// Run: node tests/admin-browser.cjs
// Uses an installed Playwright package (or PLAYWRIGHT_MODULE path).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/HP/.agents/skills/gstack/node_modules/playwright'); }
const root = path.resolve(__dirname, '..');
const owner = 'a8dbfb82-d3df-421c-acf1-194335507e80';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6L8AAAAASUVORK5CYII=', 'base64');
function mockClient(owner) {
  window.SUPABASE_URL = 'https://admin-test.supabase.co';
  window.fixture = { rows: [], failure: '', uploads: 0, removals: [] };
  let listener;
  const user = () => localStorage.getItem('testOwner') ? { id: localStorage.getItem('testOwner') } : null;
  const auth = {
    async getSession() { return { data: { session: user() ? { user: user() } : null }, error: null }; },
    async getUser() { return { data: { user: user() }, error: null }; },
    async signInWithPassword({ password }) {
      if (password === 'wrong') return { error: { status: 400 } };
      const id = password === 'other' ? 'another-user' : owner;
      localStorage.setItem('testOwner', id); return { data: { user: { id } }, error: null };
    },
    async signOut() { localStorage.removeItem('testOwner'); listener?.('SIGNED_OUT', null); return { error: null }; },
    onAuthStateChange(callback) { listener = callback; return { data: { subscription: { unsubscribe() {} } } }; }
  };
  window.supabaseClient = {
    auth,
    storage: { from() { return {
      async upload() { if (fixture.failure === 'upload') return { error: { message: 'Upload denied' } }; fixture.uploads++; return { error: null }; },
      async remove(paths) {
        fixture.removals.push(paths);
        if (fixture.failure === 'storage-throw') throw new Error('Network failed');
        return { error: fixture.failure === 'storage-error' ? { message: 'Removal denied' } : null };
      },
      getPublicUrl() { return { data: { publicUrl: location.origin + '/Images/art_floral_threadwork.jpg' } }; }
    }; } },
    from() {
      let action = 'read', payload, id, start = 0, end = 24, isCategoryQuery = false;
      const filters = [];
      const query = {
        select(cols) { if (cols === 'category') isCategoryQuery = true; return this; }, order() { return this; },
        not() { return this; },
        range(a, b) { start = a; end = b; return this; },
        limit(n) { end = n - 1; return this; },
        eq(key, value) { if (key === 'id') id = value; else filters.push([key, value]); return this; },
        insert(value) { action = 'insert'; payload = value; return this; },
        update(value) { action = 'update'; payload = value; return this; },
        delete() { action = 'delete'; return this; },
        single() { return this; },
        then(resolve, reject) {
          return Promise.resolve().then(() => {
            if (isCategoryQuery) {
              return { data: fixture.rows.map(r => ({ category: r.category })).filter(r => r.category != null), error: null };
            }
            if (fixture.failure === action) return { error: { message: `${action} denied` } };
            if (action === 'insert') { const row = { ...payload, id: crypto.randomUUID() }; fixture.rows.unshift(row); return { data: { id: row.id }, error: null }; }
            if (action === 'update') { Object.assign(fixture.rows.find(row => row.id === id), payload); return { data: { id }, error: null }; }
            if (action === 'delete') { const deleted = fixture.rows.filter(row => row.id === id); fixture.rows = fixture.rows.filter(row => row.id !== id); return { data: deleted, error: null }; }
            const rows = fixture.rows.filter(row => filters.every(([key, value]) => row[key] === value));
            return { data: rows.slice(start, end + 1), count: rows.length, error: null };
          }).then(resolve, reject);
        }
      };
      return query;
    }
  };
}
(async () => {
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (error, data) => {
      if (error) { res.writeHead(404); return res.end(); }
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.jpg': 'image/jpeg' })[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await playwright.chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://**/*', route => route.fulfill({ body: '' }));
    await page.route('**/js/supabase-client.js', route => route.fulfill({ contentType: 'application/javascript', body: `(${mockClient.toString()})(${JSON.stringify(owner)});` }));
    await page.goto(base + '/admin.html');
    await page.waitForURL('**/admin-login.html');
    console.log('PASS: logged-out dashboard redirects');
    await page.locator('#adminEmail').fill('owner@example.test');
    await page.locator('#adminPassword').fill('wrong');
    await page.locator('#loginSubmit').click();
    await page.waitForFunction(() => document.querySelector('#loginError').textContent.includes('Incorrect'));
    await page.locator('#adminPassword').fill('other');
    await page.locator('#loginSubmit').click();
    await page.waitForFunction(() => !localStorage.getItem('testOwner'));
    assert.match(await page.locator('#loginError').textContent(), /Incorrect/);
    console.log('PASS: generic login errors and non-owner rejected');
    await page.locator('#adminPassword').fill('owner-test-password');
    await page.locator('#loginSubmit').click();
    await page.waitForURL('**/admin.html');
    await page.locator('#adminDashboard').waitFor({ state: 'visible' });
    await page.locator('#title').fill('Test product');
    await page.locator('#price').fill('25');
    await page.locator('#category').selectOption('__new__');
    assert.equal(await page.locator('#newCategoryGroup').isVisible(), true);
    await page.locator('#cancelNewCategory').click();
    assert.equal(await page.locator('#newCategoryGroup').isVisible(), false);
    await page.locator('#category').selectOption('__new__');
    await page.locator('#newCategoryInput').fill('Hoop Art');
    await page.locator('#productImage').setInputFiles({ name: 'bad.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
    await page.waitForFunction(() => document.querySelector('#imageError').textContent.includes('JPG'));
    assert.equal(await page.evaluate(() => fixture.uploads), 0);
    const oversizedImage = path.join(os.tmpdir(), 'admin-oversized-test.png');
    fs.writeFileSync(oversizedImage, Buffer.alloc(5 * 1024 * 1024 + 1));
    try { await page.locator('#productImage').setInputFiles(oversizedImage); }
    finally { fs.unlinkSync(oversizedImage); }
    await page.waitForFunction(() => document.querySelector('#imageError').textContent.includes('5 MB'));
    await page.locator('#productImage').setInputFiles({ name: 'fake.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
    await page.waitForFunction(() => document.querySelector('#imageError').textContent.includes('contents'));
    console.log('PASS: image type, size and signature rejected before upload');
    await page.locator('#productImage').setInputFiles({ name: 'test.png', mimeType: 'image/png', buffer: png });
    await page.evaluate(() => { fixture.failure = 'upload'; });
    await page.locator('#productSubmit').click();
    await page.waitForFunction(() => document.querySelector('#productError').textContent.includes('upload failed'));
    assert.equal(await page.locator('#title').inputValue(), 'Test product');
    await page.evaluate(() => { fixture.failure = 'insert'; });
    await page.locator('#productSubmit').click();
    await page.waitForFunction(() => document.querySelector('#productError').textContent.includes('saved'));
    assert.equal(await page.locator('#title').inputValue(), 'Test product');
    await page.evaluate(() => { fixture.failure = ''; });
    await page.locator('#productSubmit').click();
    await page.waitForFunction(() => document.querySelector('#productsBody').textContent.includes('Test product'));
    assert.equal(await page.evaluate(() => fixture.uploads), 1);
    assert.equal(await page.locator('#title').inputValue(), '');
    console.log('PASS: upload/insert failures retain input; retry reuses upload and inserts');
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.locator('#price').fill('40');
    await page.evaluate(() => { fixture.failure = 'update'; });
    await page.locator('#productSubmit').click();
    await page.waitForFunction(() => document.querySelector('#productError').textContent.includes('saved'));
    assert.equal(await page.locator('#price').inputValue(), '40');
    await page.evaluate(() => { fixture.failure = ''; });
    await page.locator('#productSubmit').click();
    await page.waitForFunction(() => document.querySelector('#productsBody').textContent.includes('$40.00'));
    assert.equal(await page.evaluate(() => fixture.uploads), 1);
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.locator('#is_custom_quote').check();
    assert.equal(await page.locator('#price').isDisabled(), true);
    await page.locator('#custom_price_hint').fill('Starts from $150');
    await page.locator('#productSubmit').click();
    await page.waitForFunction(() => document.querySelector('#productsBody').textContent.includes('Custom Quote'));
    assert.equal(await page.evaluate(() => fixture.rows[0].price), null);
    console.log('PASS: edit failure/retry, unchanged image, custom quote');
    await page.locator('#title').fill('Second product');
    await page.locator('#price').fill('35');
    await page.locator('#category').selectOption('__new__');
    await page.locator('#newCategoryInput').fill('hoop art');
    await page.locator('#productImage').setInputFiles({ name: 'test2.png', mimeType: 'image/png', buffer: png });
    await page.locator('#productSubmit').click();
    await page.waitForFunction(() => document.querySelector('#productsBody').textContent.includes('Second product'));
    assert.equal(await page.evaluate(() => fixture.rows.find(r => r.title === 'Second product')?.category), 'Hoop Art');
    console.log('PASS: case-insensitive deduplication reuses canonical category');
    // Remove the second product so remaining tests proceed with 1 product
    await page.evaluate(() => { fixture.rows = fixture.rows.filter(r => r.title !== 'Second product'); });
    await page.locator('#refreshProducts').click();
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.locator('#cancelEdit').click();
    assert.equal(await page.locator('#productSubmit').textContent(), 'Add Product');
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    assert.equal(await page.evaluate(() => fixture.rows.length), 1);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#deleteModal').isVisible(), false);
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.evaluate(() => { fixture.failure = 'delete'; });
    await page.locator('#confirmDelete').click();
    await page.waitForFunction(() => document.querySelector('#deleteError').textContent.includes('denied'));
    assert.equal(await page.locator('#deleteModal').isVisible(), true);
    assert.equal(await page.evaluate(() => fixture.removals.length), 0);
    await page.evaluate(() => { fixture.failure = ''; });
    await page.locator('#confirmDelete').click();
    await page.waitForFunction(() => document.querySelector('#productsBody').textContent.includes('No products'));
    console.log('PASS: cancel edit, delete confirmation/cancel/failure/retry');
    const cleanupErrors = [];
    page.on('console', msg => { if (msg.type() === 'error' && msg.text().includes('Product image cleanup failed:')) cleanupErrors.push(msg.text()); });
    const prefix = 'https://admin-test.supabase.co/storage/v1/object/public/product-images/';
    const cleanupCases = [
      { url: prefix + 'owner/nested/photo%20one.png?download=1', expected: 'owner/nested/photo one.png' },
      { url: prefix + 'simple.jpg', expected: 'simple.jpg' },
      { url: null }, { url: '' }, { url: 'invalid URL' },
      { url: 'https://example.com/photo.jpg' },
      { url: 'https://other.supabase.co/storage/v1/object/public/product-images/simple.jpg' },
      { url: 'https://admin-test.supabase.co/storage/v1/object/public/another-bucket/simple.jpg' },
      { url: prefix }, { url: prefix + '%ZZ.jpg' },
      { url: prefix + 'gone.jpg', failure: 'storage-error', expected: 'gone.jpg' },
      { url: prefix + 'network.jpg', failure: 'storage-throw', expected: 'network.jpg' }
    ];
    for (const test of cleanupCases) {
      await page.evaluate(test => { fixture.failure = test.failure || ''; fixture.removals = []; fixture.rows = [{ id: 'cleanup-test', title: 'Cleanup test', category: 'Hoop Art', price: 10, image_url: test.url }]; }, test);
      await page.locator('#refreshProducts').click();
      await page.getByRole('button', { name: 'Delete', exact: true }).click();
      await page.locator('#confirmDelete').click();
      await page.waitForFunction(() => document.querySelector('#productsBody').textContent.includes('No products'));
      assert.deepEqual(await page.evaluate(() => fixture.removals), test.expected ? [[test.expected]] : []);
      assert.equal(await page.locator('#deleteError').textContent(), '');
      assert.equal(await page.locator('#adminToast').textContent(), 'Product deleted successfully.');
    }
    assert.equal(cleanupErrors.length, 2);
    // An image changed after the table loaded: remove the actual deleted row's image.
    await page.evaluate(prefix => { fixture.failure = ''; fixture.removals = []; fixture.rows = [{ id: 'stale', title: 'Stale image', image_url: prefix + 'old.jpg' }]; }, prefix);
    await page.locator('#refreshProducts').click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.evaluate(prefix => { fixture.rows[0] = { ...fixture.rows[0], image_url: prefix + 'new.jpg' }; }, prefix);
    await page.locator('#confirmDelete').click();
    await page.waitForFunction(() => document.querySelector('#productsBody').textContent.includes('No products'));
    assert.deepEqual(await page.evaluate(() => fixture.removals), [['new.jpg']]);
    console.log('PASS: Storage cleanup paths, skipped URLs, failed cleanup, and stale-image safety');
    await page.evaluate(() => { fixture.rows = Array.from({ length: 27 }, (_, i) => ({ id: String(i), title: `Product ${i}`, category: 'Hoop Art', price: 10, in_stock: false })); });
    await page.locator('#refreshProducts').click();
    await page.waitForFunction(() => document.querySelector('#pageStatus').textContent.includes('27 products'));
    assert.equal(await page.locator('#productsBody tr').count(), 25);
    await page.locator('#nextPage').click();
    await page.waitForFunction(() => document.querySelector('#pageStatus').textContent.includes('Page 2'));
    assert.equal(await page.locator('#productsBody tr').count(), 2);
    console.log('PASS: all inventory accessible across pages');
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: path.join(os.tmpdir(), 'admin-mobile.png'), fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: path.join(os.tmpdir(), 'admin-desktop.png'), fullPage: true });
    await page.locator('#adminLogout').click();
    await page.waitForURL('**/admin-login.html');
    assert.deepEqual(errors, []);
    console.log('PASS: responsive layout, logout and no runtime errors');
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
