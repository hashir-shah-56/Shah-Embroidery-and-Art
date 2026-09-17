// Isolated browser contracts. Fake SDK persistence is test-only; actual RLS is tested separately.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { mockClient } = require('./customer-auth-browser.cjs');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/HP/.agents/skills/gstack/node_modules/playwright'); }
function mockAddresses() {
  const originalFrom = supabaseClient.from;
  const all = () => JSON.parse(localStorage.getItem('test-addresses') || '[]');
  const user = () => JSON.parse(localStorage.getItem('test-session') || 'null');
  const sorted = rows => rows.sort((a, b) => Number(b.is_default) - Number(a.is_default) || b.updated_at.localeCompare(a.updated_at) || a.id.localeCompare(b.id));
  fixture.addressReads = 0; fixture.addressWrites = [];
  supabaseClient.from = table => {
    if (table !== 'addresses') return originalFrom(table);
    let owner;
    return { select() { return this; }, eq(key, value) { if (key === 'user_id') owner = value; return this; }, order() { return this; },
      then(resolve, reject) { return Promise.resolve().then(async () => {
        fixture.addressReads++;
        if (window.addressDelay) await new Promise(resolve => setTimeout(resolve, window.addressDelay));
        if (fixture.addressError === 'load') return { error: { message: 'RAW PRIVATE ERROR' } };
        return { data: sorted(all().filter(row => row.user_id === owner && owner === user()?.id)) };
      }).then(resolve, reject); }
    };
  };
  supabaseClient.rpc = async (name, args) => {
    fixture.addressWrites.push({ name, ...args });
    if (window.saveAddressDelay) await new Promise(resolve => setTimeout(resolve, window.saveAddressDelay));
    if (fixture.addressError) return { error: { message: 'RAW PRIVATE ERROR' } };
    const owner = user()?.id;
    let records = all(); let own = records.filter(row => row.user_id === owner);
    let target = own.find(row => row.id === args.address_id);
    if (!owner || (args.address_id && !target)) return { error: { code: '42501' } };
    const now = new Date().toISOString();
    if (args.action === 'save') {
      const makeDefault = args.details.is_default || !own.length;
      if (makeDefault) own.forEach(row => row.is_default = false);
      if (target) Object.assign(target, args.details, { is_default: makeDefault, updated_at: now });
      else { target = { ...args.details, id: crypto.randomUUID(), user_id: owner, created_at: now, updated_at: now, is_default: makeDefault }; records.push(target); own.push(target); }
    } else if (args.action === 'default') own.forEach(row => row.is_default = row === target);
    else { records = records.filter(row => row !== target); own = own.filter(row => row !== target); }
    if (own.length && !own.some(row => row.is_default)) sorted(own.filter(row => row !== target).length ? own.filter(row => row !== target) : own)[0].is_default = true;
    localStorage.setItem('test-addresses', JSON.stringify(records));
    return { data: sorted(own) };
  };
}
const root = path.resolve(__dirname, '..');
(async () => {
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + req.url.split('?')[0]);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (error, body) => {
      if (error) { res.writeHead(404); return res.end(); }
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' })[path.extname(file)] || 'application/octet-stream'); res.end(body);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await playwright.chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext();
    await context.route('https://**/*', route => route.fulfill({ body: '' }));
    await context.route('**/js/supabase-client.js', route => route.fulfill({ contentType: 'application/javascript', body: `(${mockClient.toString()})(); (${mockAddresses.toString()})();` }));
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = `http://127.0.0.1:${server.address().port}`;
    const goto = async file => { await page.goto(`${base}/${file}`); await page.evaluate(() => customerAuth.ready); };
    const readyList = () => page.waitForFunction(() => document.getElementById('accountSectionContent')?.getAttribute('aria-busy') === 'false');
    const form = page.locator('#addressForm');
    const open = async () => { await page.locator('#openAddressModalBtn').click(); await page.locator('#addressModal.active').waitFor(); };
    const fill = async (label = 'Home', country = 'Pakistan', postal = '54000') => {
      for (const [id,value] of Object.entries({ addressLabel: label, addressName: 'Sara Customer', addressPhone: '+92 300 1234567', addressText: '12 Main Road / #3', addressLine2: 'Apartment 2', addressState: 'Punjab', addressCity: 'Lahore', addressPostal: postal, addressCountry: country })) await page.locator('#' + id).fill(value);
    };
    const save = async () => { await form.locator('[type=submit]').click(); await page.locator('#addressModal.active').waitFor({ state: 'hidden' }); };
    const remove = async index => { await page.locator('.delete-address').nth(index).click(); await page.locator('#addressDeleteConfirm').click(); await page.locator('#addressDeleteModal.active').waitFor({ state: 'hidden' }); };
    await goto('index.html');
    await page.evaluate(() => {
      const id = '11111111-1111-4111-8111-111111111111';
      localStorage.setItem('test-session', JSON.stringify({ id, email: 'test@example.com', user_metadata: { full_name: 'Sara Customer' } }));
      localStorage.setItem('shah_saved_addresses', JSON.stringify({ 'test@example.com': [{ name: 'UNTRUSTED LEGACY', isDefault: true }] }));
      localStorage.setItem('shah_cart', JSON.stringify([{ title: 'Artwork', price: 'Rs. 1,000', numericPrice: 1000, quantity: 2, img: 'Images/Logo.png' }]));
      localStorage.setItem('shah_wishlist', '{}'); localStorage.setItem('shah_orders', '[]'); localStorage.setItem('shah_custom_order_requests', '{}');
    });
    const untouched = await page.evaluate(() => Object.fromEntries(['shah_saved_addresses','shah_cart','shah_wishlist','shah_orders','shah_custom_order_requests'].map(key => [key,localStorage.getItem(key)])));
    await goto('profile.html#addresses'); await readyList();
    assert.match(await page.locator('#accountSectionContent').textContent(), /No saved addresses/);
    assert.equal(await page.evaluate(() => fixture.addressReads), 1);
    await open(); await fill();
    await page.locator('#addressPhone').fill('abc'); assert.equal(await form.locator('[type=submit]').isDisabled(), true);
    await page.locator('#addressPhone').fill('+92 300 1234567');
    await page.locator('#addressPostal').fill('SW1A 1AA'); assert.equal(await form.locator('[type=submit]').isDisabled(), true);
    await page.locator('#addressPostal').fill('54000');
    await page.locator('#addressDefault').uncheck();
    await page.evaluate(() => { window.saveAddressDelay = 500; document.getElementById('addressForm').requestSubmit(); document.getElementById('addressForm').requestSubmit(); });
    await page.locator('#addressModal.active').waitFor({ state: 'hidden' });
    assert.equal(await page.evaluate(() => fixture.addressWrites.length), 1);
    assert.equal(await page.locator('.default-address').count(), 1);
    console.log('PASS: ignores legacy addresses, empty/loading state, validation, first default and duplicate-submit prevention');
    await open(); await fill('Work', 'United Kingdom', 'SW1A 1AA'); await page.locator('#addressDefault').uncheck(); await save();
    assert.equal(await page.locator('.account-address-card').count(), 2);
    await page.evaluate(() => fixture.addressError = 'default');
    await page.locator('.set-default-address:not(:disabled)').click();
    await page.waitForFunction(() => document.querySelector('.set-default-address:not(:disabled)')?.textContent === 'Set Default');
    assert.equal(await page.locator('.default-address .address-card-name').textContent(), 'Home');
    await page.evaluate(() => fixture.addressError = '');
    await page.locator('.set-default-address:not(:disabled)').click();
    await page.waitForFunction(() => document.querySelector('.default-address .address-card-name')?.textContent === 'Work');
    const workId = await page.locator('.default-address .edit-address').getAttribute('data-address-id');
    await page.locator('.default-address .edit-address').click();
    assert.equal(await page.locator('#addressDefault').isChecked(), true);
    await page.locator('#addressLabel').fill('Office'); await page.locator('#addressCity').fill('London');
    await page.locator('#addressPhone').fill('+44 20 7946 0958');
    await page.evaluate(() => fixture.addressError = 'save');
    await form.locator('[type=submit]').click();
    await page.waitForFunction(() => !document.getElementById('addressForm').dataset.busy);
    assert.equal(await page.locator('#addressLabel').inputValue(), 'Office');
    assert.match(await page.locator('#siteToast').textContent(), /couldn't update/);
    assert.doesNotMatch(await page.locator('#siteToast').textContent(), /RAW PRIVATE/);
    await page.evaluate(() => fixture.addressError = ''); await save();
    assert.equal(await page.locator('.default-address .edit-address').getAttribute('data-address-id'), workId);
    await goto('profile.html#addresses'); await readyList();
    assert.match(await page.locator('.default-address').textContent(), /Office.*Sara Customer.*London/s);
    console.log('PASS: second address, switch default, edit preserves UUID/default, save failure recovery, international postal and reload persistence');
    for (const width of [1440,1024,900,768,480,393,360]) {
      await page.setViewportSize({ width, height: 850 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `cards overflow ${width}`);
      for (const button of await page.locator('.edit-address,.delete-address,.set-default-address').all()) assert.ok((await button.boundingBox()).height >= 44);
      await page.locator('.edit-address').first().click();
      await form.locator('[type=submit]').scrollIntoViewIfNeeded();
      const geometry = await page.locator('#addressModal .modal-container').evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth, bottom: el.getBoundingClientRect().bottom }));
      assert.equal(geometry.scroll <= geometry.width, true, `modal overflow ${width}`); assert.ok(geometry.bottom <= 851);
      assert.ok((await form.locator('[type=submit]').boundingBox()).height >= 44);
      await page.keyboard.press('Escape');
    }
    await page.setViewportSize({ width: 393, height: 420 }); await open(); await fill();
    await form.locator('[type=submit]').scrollIntoViewIfNeeded();
    assert.ok((await form.locator('[type=submit]').boundingBox()).y < 420);
    await page.locator('#addressModalClose').focus(); await page.keyboard.press('Shift+Tab');
    assert.equal(await form.locator('[type=submit]').evaluate(el => el === document.activeElement), true);
    await page.keyboard.press('Escape');
    await page.locator('#addressModal').waitFor({ state: 'hidden' });
    await page.setViewportSize({ width: 393, height: 850 });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: path.join(require('node:os').tmpdir(), 'shah-addresses-393.png'), fullPage: true, animations: 'disabled' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: path.join(require('node:os').tmpdir(), 'shah-addresses-1440.png'), fullPage: true, animations: 'disabled' });
    console.log('PASS: all seven widths, 44px actions, scrollable mobile form, shortened viewport and focus wrapping');
    await page.evaluate(() => { fixture.addressError = 'load'; });
    await page.locator('[data-section=addresses]').click(); await readyList();
    assert.match(await page.locator('#accountSectionContent').textContent(), /could not load/);
    await page.evaluate(() => fixture.addressError = ''); await page.locator('#retryAddresses').click(); await readyList();
    await page.evaluate(() => fixture.addressError = 'delete');
    await page.locator('.delete-address').first().click(); await page.locator('#addressDeleteConfirm').click();
    await page.waitForFunction(() => !document.getElementById('addressDeleteConfirm').disabled);
    assert.equal(await page.locator('.account-address-card').count(), 2);
    await page.locator('#addressDeleteCancel').click(); await page.evaluate(() => fixture.addressError = '');
    await goto('checkout.html');
    await page.waitForFunction(() => document.getElementById('checkoutAddressStatus')?.getAttribute('aria-busy') === 'false');
    assert.equal(await page.locator('#checkoutAddress').inputValue(), '12 Main Road / #3, Apartment 2, Punjab');
    assert.equal(await page.locator('#checkoutCountry').inputValue(), 'United Kingdom');
    assert.equal(await page.locator('#checkoutPostal').inputValue(), 'SW1A 1AA');
    assert.equal(await page.evaluate(() => fixture.addressReads), 1);
    const delayed = await context.newPage(); await delayed.addInitScript(() => window.addressDelay = 1200);
    await delayed.goto(base + '/checkout.html'); await delayed.evaluate(() => customerAuth.ready);
    await delayed.locator('#checkoutAddress').fill('My one-time delivery address');
    await delayed.locator('#checkoutCountry').selectOption('Canada');
    await delayed.waitForFunction(() => document.getElementById('checkoutAddressStatus')?.getAttribute('aria-busy') === 'false');
    assert.equal(await delayed.locator('#checkoutAddress').inputValue(), 'My one-time delivery address');
    assert.equal(await delayed.locator('#checkoutCountry').inputValue(), 'Canada'); await delayed.close();
    console.log('PASS: load/delete failures, retry, default checkout prefill and preservation of typed delivery fields during network loading');
    await goto('profile.html#addresses'); await readyList();
    await remove(0); assert.equal(await page.locator('.account-address-card').count(), 1); assert.equal(await page.locator('.default-address').count(), 1);
    await open(); await fill('Second'); await page.locator('#addressDefault').uncheck(); await save();
    await remove(1); assert.equal(await page.locator('.default-address').count(), 1);
    await remove(0); assert.match(await page.locator('#accountSectionContent').textContent(), /No saved addresses/);
    await goto('checkout.html'); await page.waitForFunction(() => document.getElementById('checkoutAddressStatus')?.getAttribute('aria-busy') === 'false');
    assert.equal(await page.locator('#checkoutAddress').inputValue(), ''); assert.equal(await page.locator('#checkoutCountry').inputValue(), 'Pakistan');
    await goto('profile.html#addresses'); await readyList(); await open(); await fill('<img src=x onerror=alert(1)>'); await save();
    assert.equal(await page.locator('.account-address-card img').count(), 0);
    const writes = await page.evaluate(() => fixture.addressWrites);
    assert.equal(Object.hasOwn(writes[0].details, 'user_id'), false);
    await page.locator('#profileLogoutBtn').click(); await page.waitForURL('**/index.html?login=1');
    await goto('profile.html'); await page.waitForURL('**/index.html?login=1');
    await page.locator('#loginEmail').fill('test@example.com'); await page.locator('#loginPassword').fill('StrongPass1'); await page.locator('#loginForm [type=submit]').click(); await page.waitForURL('**/profile.html');
    await page.locator('[data-section=addresses]').click(); await readyList(); assert.equal(await page.locator('.account-address-card').count(), 1);
    assert.deepEqual(await page.evaluate(() => Object.fromEntries(['shah_saved_addresses','shah_cart','shah_wishlist','shah_orders','shah_custom_order_requests'].map(key => [key,localStorage.getItem(key)]))), untouched);
    assert.equal(await page.evaluate(() => fixture.listeners), 1); assert.deepEqual(errors, []);
    console.log('PASS: default/non-default/final deletion, no-address checkout, XSS-safe cards, logout/login persistence and untouched commerce data');
  } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
