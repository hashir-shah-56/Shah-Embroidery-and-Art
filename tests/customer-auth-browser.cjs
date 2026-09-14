// Isolated UI integration: no live accounts, emails, or database writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/HP/.agents/skills/gstack/node_modules/playwright'); }
const root = path.resolve(__dirname, '..');
function mockClient() {
  const fixture = window.fixture = { mode: '', logins: 0, signups: 0, listeners: 0, profileReads: 0, profileWrites: [] };
  let listener;
  const user = () => JSON.parse(localStorage.getItem('test-session') || 'null');
  const account = email => ({ id: '11111111-1111-4111-8111-111111111111', email, created_at: '2026-09-14', user_metadata: { full_name: 'Test Customer' } });
  fixture.confirm = () => {
    const value = account('test@example.com');
    localStorage.setItem('test-session', JSON.stringify(value));
    listener?.('SIGNED_IN', { user: value });
  };
  const auth = {
    async getSession() { return { data: { session: user() ? { user: user() } : null } }; },
    async getUser() { return fixture.mode === 'expired' ? { error: { status: 401 } } : { data: { user: user() } }; },
    onAuthStateChange(cb) { fixture.listeners++; listener = cb; return {}; },
    async signInWithPassword({ email, password }) {
      fixture.logins++; await new Promise(resolve => setTimeout(resolve, 150));
      localStorage.setItem('test-login-count', String(Number(localStorage.getItem('test-login-count') || 0) + 1));
      if (fixture.mode === 'network') throw new Error('private technical error');
      if (password === 'Wrongpass1') return { error: { code: 'invalid_credentials' } };
      const value = account(email); localStorage.setItem('test-session', JSON.stringify(value));
      listener('SIGNED_IN', { user: value }); return { data: { user: value, session: { user: value } } };
    },
    async signUp({ email, password, options }) {
      fixture.signups++; fixture.passwordUnmodified = password === ' StrongPass1 ';
      if (fixture.mode === 'network') throw new Error('private technical error');
      if (fixture.mode === 'duplicate') return { error: { code: 'user_already_exists' } };
      if (fixture.mode === 'weak') return { error: { code: 'weak_password' } };
      if (fixture.mode === 'verify') { fixture.redirect = options.emailRedirectTo; return { data: { session: null, user: account(email) } }; }
      const value = account(email); value.user_metadata = options.data;
      localStorage.setItem('test-session', JSON.stringify(value)); listener('SIGNED_IN', { user: value });
      return { data: { user: value, session: { user: value } } };
    },
    async signOut() { localStorage.removeItem('test-session'); listener('SIGNED_OUT', null); return {}; },
    async updateUser(attrs) {
      if (fixture.mode === 'auth-save') return { error: { code: 'unexpected_failure' } };
      if (attrs.password) fixture.passwordChanged = true;
      const value = user(); if (attrs.data) value.user_metadata = attrs.data;
      if (attrs.email) {
        if (fixture.mode === 'email-pending') value.new_email = attrs.email;
        else value.email = attrs.email;
      }
      localStorage.setItem('test-session', JSON.stringify(value)); listener('USER_UPDATED', { user: value }); return { data: { user: value } };
    }
  };
  window.supabaseClient = { auth, from(table) {
    let payload, action = 'read', ownerId;
    const query = {
      select() { return this; }, eq(key, value) { if (key === 'id') ownerId = value; return this; }, single() { return this; }, maybeSingle() { return this; },
      order() { return this; }, limit() { return this; }, range() { return this; }, not() { return this; },
      upsert(row) { payload = row; action = 'write'; return this; }, update(row) { payload = row; action = 'write'; return this; },
      then(resolve, reject) { return Promise.resolve().then(async () => {
        if (table !== 'profiles') return { data: [], count: 0 };
        if (action === 'read') { fixture.profileReads++; if (window.testProfileDelay) await new Promise(resolve => setTimeout(resolve, window.testProfileDelay)); }
        if (fixture.mode === 'profile') return { error: { code: '42501' } };
        if (action === 'write') {
          fixture.profileWrites.push({ ownerId: ownerId || payload.id, payload });
          if (fixture.mode === 'profile-write') return { error: { code: '42501' } };
          if (window.testSaveDelay) await new Promise(resolve => setTimeout(resolve, window.testSaveDelay));
          localStorage.setItem('test-profile', JSON.stringify({ ...JSON.parse(localStorage.getItem('test-profile') || '{}'), ...payload, updated_at: new Date().toISOString() }));
        }
        return { data: JSON.parse(localStorage.getItem('test-profile') || 'null') };
      }).then(resolve, reject); }
    }; return query;
  } };
}
async function runCustomerAuthTests() {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(req.url.split('?')[0]);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (error, data) => {
      if (error) { res.writeHead(404); return res.end(); }
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png' })[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await playwright.chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext();
    await context.route('https://**/*', route => route.fulfill({ body: '' }));
    await context.route('**/js/supabase-client.js', route => route.fulfill({ contentType: 'application/javascript', body: `(${mockClient.toString()})();` }));
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const goto = async file => { await page.goto(base + '/' + file); await page.evaluate(() => customerAuth.ready); };
    const open = async () => { await page.locator('#navAccountBtn').click(); await page.locator('#authModal.active').waitFor(); };
    const login = async (password = 'StrongPass1') => {
      await page.locator('#loginEmail').fill('TEST@EXAMPLE.COM'); await page.locator('#loginPassword').fill(password);
      await page.locator('#loginForm [type=submit]').click();
    };
    await goto('index.html');
    await page.evaluate(() => {
      localStorage.setItem('shah_current_user', JSON.stringify({ id: 'forged', name: 'Forged', email: 'test@example.com' }));
      localStorage.setItem('shah_users', JSON.stringify([{ email: 'test@example.com', passwordHash: 'forged' }]));
    });
    await goto('profile.html'); await page.waitForURL('**/index.html?login=1');
    assert.equal(await page.evaluate(() => customerAuth.getCurrentUser()), null);
    console.log('PASS: forged mock session cannot open profile');
    await page.locator('#authModalClose').click();
    for (const width of [1440, 1024, 900, 768, 480, 393, 360]) {
      await page.setViewportSize({ width, height: 850 }); await open();
      for (const mode of ['login', 'signup']) {
        if (mode === 'signup') await page.locator('#authToggleButton').click();
        const form = page.locator(mode === 'login' ? '#loginForm' : '#signupForm');
        await form.locator('[type=submit]').scrollIntoViewIfNeeded();
        const geometry = await page.evaluate(() => {
          const el = document.querySelector('.auth-modal-container'), r = el.getBoundingClientRect();
          return { overflow: document.documentElement.scrollWidth > innerWidth, clipped: r.left < 0 || r.right > innerWidth || r.top < 0 || r.bottom > innerHeight, inner: el.scrollWidth > el.clientWidth };
        });
        assert.deepEqual(geometry, { overflow: false, clipped: false, inner: false }, `${width} ${mode}`);
        if (mode === 'signup' && [1440, 393].includes(width)) {
          await page.screenshot({ path: path.join(require('node:os').tmpdir(), `shah-customer-auth-${width}.png`) });
        }
      }
      await page.locator('#authModalClose').click();
      if (width < 900) {
        await page.locator('#hamburgerToggle').click();
        await page.locator('#mobileDrawer.active').waitFor();
        await page.locator('#drawerClose').click();
      }
    }
    console.log('PASS: login/signup geometry at all seven requested widths');
    await page.setViewportSize({ width: 393, height: 420 }); await open();
    await page.locator('#loginForm [type=submit]').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('#loginForm [type=submit]').isVisible(), true);
    await page.locator('#authModalClose').focus(); await page.keyboard.press('Shift+Tab');
    assert.equal(await page.locator('#authToggleButton').evaluate(el => el === document.activeElement), true);
    await page.setViewportSize({ width: 1024, height: 850 });
    await login('Wrongpass1'); await page.waitForFunction(() => document.querySelector('.auth-status').textContent.includes('Incorrect'));
    await page.evaluate(() => fixture.mode = 'network'); await login();
    await page.waitForFunction(() => document.querySelector('.auth-status').textContent.includes('connection'));
    assert.equal(await page.locator('#loginForm [type=submit]').isEnabled(), true);
    await page.evaluate(() => fixture.mode = '');
    await page.locator('#authToggleButton').click();
    await page.locator('#signupName').fill(' Test Customer ');
    await page.locator('#signupEmail').fill('bad');
    await page.locator('#signupPassword').fill('weak');
    await page.locator('#signupConfirmPassword').fill('different');
    assert.equal(await page.locator('#signupForm [type=submit]').isDisabled(), true);
    await page.locator('#signupEmail').fill('TEST@EXAMPLE.COM');
    await page.locator('#signupPassword').fill(' StrongPass1 '); await page.locator('#signupConfirmPassword').fill(' StrongPass1 ');
    for (const mode of ['duplicate', 'weak', 'network']) {
      await page.evaluate(value => fixture.mode = value, mode); await page.locator('#signupForm [type=submit]').click();
      await page.waitForFunction(() => document.querySelector('#signupForm').dataset.busy === 'false');
      assert.ok((await page.locator('.auth-status').textContent()).length);
    }
    await page.evaluate(() => { fixture.mode = 'verify'; localStorage.setItem('loginRedirectTarget', JSON.stringify('checkout.html')); });
    await page.locator('#signupForm [type=submit]').click();
    await page.waitForFunction(() => document.querySelector('.auth-status').textContent.includes('Verify'));
    assert.equal(await page.evaluate(() => customerAuth.getCurrentUser()), null);
    assert.equal(await page.evaluate(() => fixture.redirect), base + '/');
    assert.equal(await page.evaluate(() => fixture.passwordUnmodified), true);
    console.log('PASS: validation, generic errors, network recovery, confirmation-required signup');
    const cart = [{ title: 'Test Art', category: 'Hoop Art', price: 'Rs. 500', numericPrice: 500, quantity: 2, img: '' }];
    await page.evaluate(value => localStorage.setItem('shah_cart', JSON.stringify(value)), cart);
    await goto('cart.html'); await page.locator('#btnProceedToCheckout').click();
    await page.locator('#authModal.active').waitFor();
    await page.locator('#loginEmail').fill('TEST@EXAMPLE.COM'); await page.locator('#loginPassword').fill('StrongPass1');
    const beforeLogins = await page.evaluate(() => Number(localStorage.getItem('test-login-count') || 0));
    await page.evaluate(() => { const form = document.querySelector('#loginForm'); form.requestSubmit(); form.requestSubmit(); });
    await page.waitForURL('**/checkout.html');
    assert.equal(await page.evaluate(() => Number(localStorage.getItem('test-login-count'))), beforeLogins + 1);
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('shah_cart'))), cart);
    await page.locator('#checkoutName').fill('Checkout Customer');
    await page.evaluate(() => customerAuth.signOut()); await page.waitForURL('**/cart.html?login=checkout');
    await page.locator('#authModal.active').waitFor(); await login(); await page.waitForURL('**/checkout.html');
    assert.equal(await page.locator('#checkoutName').inputValue(), 'Checkout Customer');
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('shah_cart'))), cart);
    console.log('PASS: checkout login gate, cart equality, session-loss form restoration');
    await goto('profile.html'); await page.locator('#profilePage.visible').waitFor();
    await page.reload(); await page.locator('#profilePage.visible').waitFor();
    const reopened = await context.newPage(); await reopened.goto(base + '/profile.html'); await reopened.locator('#profilePage.visible').waitFor(); await reopened.close();
    assert.equal(await page.evaluate(() => fixture.listeners), 1);
    await page.locator('[data-section=settings]').click(); await page.locator('#settingsName').waitFor();
    assert.equal(await page.locator('#settingsName').inputValue(), 'Test Customer');
    await page.locator('#settingsName').fill('Updated Customer'); await page.locator('#settingsPhone').fill('+92 300 1234567');
    await page.locator('#accountSettingsForm [type=submit]').click();
    await page.waitForFunction(() => customerAuth.getCurrentUser()?.name === 'Updated Customer');
    await page.locator('#profileLogoutBtn').click(); await page.waitForURL('**/index.html?login=1');
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('shah_cart'))), cart);
    console.log('PASS: refresh/reopened session, single listener, profile database fields, settings, logout');
    await page.locator('#authToggleButton').click();
    await page.locator('#signupName').fill('New Customer'); await page.locator('#signupEmail').fill('NEW@EXAMPLE.COM');
    await page.locator('#signupPassword').fill('StrongPass1'); await page.locator('#signupConfirmPassword').fill('StrongPass1');
    await page.locator('#signupForm [type=submit]').click(); await page.waitForURL('**/profile.html');
    assert.equal(await page.evaluate(() => customerAuth.getCurrentUser().email), 'new@example.com');
    await page.evaluate(async () => { fixture.mode = 'profile'; await customerAuth.refreshCurrentProfile(); });
    assert.equal(await page.evaluate(() => customerAuth.profileUnavailable()), true);
    assert.ok(await page.evaluate(() => customerAuth.getCurrentUser()));
    await page.evaluate(async () => { fixture.mode = 'expired'; await customerAuth.refresh(); });
    await page.waitForURL('**/index.html?login=1');
    console.log('PASS: immediate-session signup, profile failure preserves identity, invalid session blocks profile');
    // Test both origins with repository assets and mocked Auth, without sending emails.
    for (const origin of [base, 'https://shah-embroidery-and-art.netlify.app']) {
      const confirmationContext = await browser.newContext();
      await confirmationContext.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.origin !== origin) return route.fulfill({ body: '' });
        if (url.pathname === '/js/supabase-client.js') return route.fulfill({ contentType: 'application/javascript', body: `(${mockClient.toString()})();` });
        const file = path.resolve(root, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
        if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
        return route.fulfill({ path: file });
      });
      const confirmationPage = await confirmationContext.newPage();
      confirmationPage.on('pageerror', error => errors.push(error.message));
      await confirmationPage.goto(origin + '/index.html?login=1');
      await confirmationPage.evaluate(() => customerAuth.ready);
      await confirmationPage.locator('#authToggleButton').click();
      await confirmationPage.locator('#signupName').fill('Test Customer');
      await confirmationPage.locator('#signupEmail').fill('test@example.com');
      await confirmationPage.locator('#signupPassword').fill('StrongPass1');
      await confirmationPage.locator('#signupConfirmPassword').fill('StrongPass1');
      await confirmationPage.evaluate(value => { fixture.mode = 'verify'; localStorage.setItem('shah_cart', JSON.stringify(value)); }, cart);
      await confirmationPage.locator('#signupForm [type=submit]').click();
      await confirmationPage.waitForFunction(() => fixture.redirect);
      assert.equal(await confirmationPage.evaluate(() => fixture.redirect), origin + '/');
      assert.equal(await confirmationPage.evaluate(() => customerAuth.getCurrentUser()), null);
      // Simulate the SDK receiving the confirmed session, then following the email callback.
      await confirmationPage.evaluate(() => fixture.confirm());
      await confirmationPage.waitForFunction(() => document.querySelector('#navAccountBtn').classList.contains('is-logged-in'));
      assert.equal(await confirmationPage.locator('#authModal').evaluate(el => el.classList.contains('active')), false);
      await confirmationPage.goto(origin + '/');
      await confirmationPage.evaluate(() => customerAuth.ready);
      assert.equal(confirmationPage.url(), origin + '/');
      assert.equal(await confirmationPage.locator('#authModal').evaluate(el => el.classList.contains('active')), false);
      await confirmationPage.reload();
      await confirmationPage.waitForFunction(() => document.querySelector('#navAccountBtn').classList.contains('is-logged-in'));
      assert.equal(await confirmationPage.evaluate(() => fixture.listeners), 1);
      assert.deepEqual(await confirmationPage.evaluate(() => JSON.parse(localStorage.getItem('shah_cart'))), cart);
      await confirmationPage.evaluate(() => localStorage.setItem('loginRedirectTarget', JSON.stringify('checkout.html')));
      await confirmationPage.goto(origin + '/');
      await confirmationPage.waitForURL('**/checkout.html');
      assert.equal(await confirmationPage.evaluate(() => localStorage.getItem('loginRedirectTarget')), null);
      assert.deepEqual(await confirmationPage.evaluate(() => JSON.parse(localStorage.getItem('shah_cart'))), cart);
      await confirmationPage.goto(origin + '/profile.html');
      await confirmationPage.locator('#profileLogoutBtn').click();
      await confirmationPage.waitForURL('**/index.html?login=1');
      assert.equal(await confirmationPage.evaluate(() => customerAuth.getCurrentUser()), null);
      assert.deepEqual(await confirmationPage.evaluate(() => JSON.parse(localStorage.getItem('shah_cart'))), cart);
      await confirmationContext.close();
    }
    console.log('PASS: local/production-origin signup callbacks, confirmed navbar, no reopened modal, refresh, checkout intent, cart and logout (mocked Auth)');
    // Exercise the real client bootstrap with the CDN unavailable.
    await page.route('**/js/supabase-client.js', route => route.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(root, 'js/supabase-client.js'), 'utf8') }));
    await goto('index.html'); await open(); await login();
    await page.waitForFunction(() => document.querySelector('.auth-status').textContent.includes('connection'));
    assert.equal(await page.locator('#loginForm [type=submit]').isEnabled(), true);
    console.log('PASS: unavailable authentication service leaves a recoverable guest UI');
    assert.deepEqual(errors, []); console.log('PASS: no JavaScript runtime errors');
  } finally { await browser?.close(); server.close(); }
}
module.exports = { mockClient };
if (require.main === module) runCustomerAuthTests().catch(error => { console.error(error); process.exitCode = 1; });
