// Isolated recovery UI/SDK contract tests; no real emails or passwords are sent.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { mockClient } = require('./customer-auth-browser.cjs');
let playwright;
try { playwright = require('playwright'); } catch { playwright = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/HP/.agents/skills/gstack/node_modules/playwright'); }
function recoveryMock() {
  let listener, emitted = false;
  const auth = supabaseClient.auth, listen = auth.onAuthStateChange, getSession = auth.getSession, update = auth.updateUser;
  fixture.resetRequests = []; fixture.resetUpdates = 0;
  auth.onAuthStateChange = callback => { listener = callback; return listen(callback); };
  auth.getSession = async () => {
    const result = await getSession();
    if (!emitted && location.hash === '#test-recovery' && result.data.session) {
      emitted = true; listener?.('PASSWORD_RECOVERY', result.data.session);
      history.replaceState(null, '', location.pathname);
    }
    return result;
  };
  auth.resetPasswordForEmail = async (email, options) => {
    fixture.resetRequests.push({ email, options });
    await new Promise(r => setTimeout(r, 180));
    if (fixture.mode === 'network') throw new Error('Technical details must not be shown');
    return { error: null };
  };
  auth.updateUser = async attrs => {
    fixture.resetUpdates++; await new Promise(r => setTimeout(r, 180));
    if (fixture.mode === 'reset-fail') return { error: { code: 'same_password' } };
    return update(attrs);
  };
}
(async () => {
  const root = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + req.url.split('?')[0]);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (error, data) => {
      if (error) { res.writeHead(404); return res.end(); }
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png' })[path.extname(file)] || 'application/octet-stream'); res.end(data);
    });
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`; let browser;
  try {
    browser = await playwright.chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext();
    await context.route('https://**/*', route => route.fulfill({ body: '' }));
    await context.route('**/js/supabase-client.js', route => route.fulfill({ contentType: 'application/javascript', body: `(${mockClient.toString()})();(${recoveryMock.toString()})();` }));
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const goto = async file => { await page.goto('about:blank'); await page.goto(base + '/' + file); await page.evaluate(() => customerAuth.ready); };
    await goto('index.html');
    await page.locator('#navAccountBtn').click(); await page.locator('#forgotPasswordButton').click();
    assert.equal(await page.locator('#loginForm').isVisible(), false);
    assert.equal(await page.locator('#signupForm').isVisible(), false);
    await page.locator('#resetRequestEmail').fill('bad');
    assert.equal(await page.locator('#resetRequestForm [type=submit]').isDisabled(), true);
    for (const width of [1440, 1024, 900, 768, 480, 393, 360]) {
      await page.setViewportSize({ width, height: 850 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await page.locator('#resetRequestForm').isVisible(), true);
    }
    await page.locator('#resetRequestEmail').fill(' TEST@EXAMPLE.COM ');
    await page.evaluate(() => { fixture.mode = 'network'; localStorage.setItem('shah_cart', '[]'); localStorage.setItem('shah_login_redirect_target', JSON.stringify('checkout.html')); });
    await page.locator('#resetRequestForm [type=submit]').click();
    await page.waitForFunction(() => document.querySelector('.auth-status').textContent.includes('could not send'));
    await page.evaluate(() => { fixture.mode = ''; });
    await page.locator('#resetRequestForm [type=submit]').click(); await page.locator('#resetRequestForm').dispatchEvent('submit');
    await page.waitForFunction(() => document.querySelector('.auth-status').textContent.startsWith('If an account exists'));
    assert.equal(await page.evaluate(() => fixture.resetRequests.length), 2);
    assert.deepEqual(await page.evaluate(() => fixture.resetRequests[1]), { email: 'test@example.com', options: { redirectTo: base + '/reset-password.html' } });
    await page.locator('#backToLoginButton').click(); assert.equal(await page.locator('#loginForm').isVisible(), true);
    console.log('PASS: same-modal view/back, validation, generic success, network retry, loading/double-submit guard, origin redirect and seven widths');
    await goto('reset-password.html'); await page.locator('#resetInvalidLink').waitFor(); assert.equal(await page.locator('#resetPasswordForm').isVisible(), false);
    const seed = () => page.evaluate(() => localStorage.setItem('test-session', JSON.stringify({ id: '11111111-1111-4111-8111-111111111111', email: 'test@example.com', user_metadata: { full_name: 'Customer' } })));
    await seed(); await goto('reset-password.html'); await page.locator('#resetInvalidLink').waitFor(); assert.equal(await page.locator('#resetPasswordForm').isVisible(), false);
    await goto('reset-password.html#error=access_denied&error_code=otp_expired'); await page.locator('#resetInvalidLink').waitFor();
    await goto('reset-password.html#test-recovery'); await page.locator('#resetPasswordForm').waitFor();
    assert.equal(await page.evaluate(() => fixture.listeners), 1);
    await page.locator('#resetNewPassword').fill('weak'); await page.locator('#resetConfirmPassword').fill('weak');
    assert.equal(await page.locator('#resetPasswordForm [type=submit]').isDisabled(), true);
    await page.locator('#resetNewPassword').fill(' StrongPass2 '); await page.locator('#resetConfirmPassword').fill('Mismatch2');
    assert.equal(await page.locator('#resetPasswordForm [type=submit]').isDisabled(), true);
    await page.locator('#resetConfirmPassword').fill(' StrongPass2 ');
    assert.equal(await page.locator('#resetPasswordForm .password-strength-label').textContent(), 'Strong');
    for (const width of [1440, 1024, 900, 768, 480, 393, 360]) {
      await page.setViewportSize({ width, height: width === 360 ? 420 : 850 });
      await page.locator('#resetPasswordForm [type=submit]').scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    await page.evaluate(() => { fixture.mode = 'reset-fail'; }); await page.locator('#resetPasswordForm [type=submit]').click();
    await page.waitForFunction(() => document.querySelector('#passwordResetStatus').textContent.includes('different'));
    assert.equal(await page.locator('#resetNewPassword').inputValue(), ' StrongPass2 ');
    await page.evaluate(() => { fixture.mode = ''; }); await page.locator('#resetPasswordForm [type=submit]').click(); await page.locator('#resetPasswordForm').dispatchEvent('submit');
    await page.locator('#resetReturnLogin').waitFor();
    assert.equal(await page.evaluate(() => fixture.resetUpdates), 2);
    assert.equal(await page.locator('#passwordResetStatus').textContent(), 'Your password has been reset successfully.');
    assert.equal(await page.locator('#resetNewPassword').inputValue(), '');
    assert.equal(await page.evaluate(() => localStorage.getItem('shah_cart')), '[]');
    await page.locator('#resetReturnLogin').click(); await page.waitForURL('**/index.html?login=1'); await page.locator('#authModal.active').waitFor();
    assert.equal(await page.evaluate(() => customerAuth.getCurrentUser()), null);
    await seed(); await goto('reset-password.html#test-recovery'); await page.locator('#resetPasswordForm').waitFor();
    await page.evaluate(() => { fixture.mode = 'expired'; });
    await page.locator('#resetNewPassword').fill('StrongPass2'); await page.locator('#resetConfirmPassword').fill('StrongPass2');
    await page.locator('#resetPasswordForm [type=submit]').click(); await page.locator('#resetInvalidLink').waitFor();
    assert.equal(await page.evaluate(() => fixture.resetUpdates), 0);
    assert.deepEqual(errors, []);
    console.log('PASS: guest/ordinary-session/expired-link denial, recovery event before page bindings, verified-session gate, strength/matching validation, retained retry input, successful update, local sign-out/login return, cart preservation and session expiry');
  } finally { await browser?.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
