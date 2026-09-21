// Run: node tests/shop-browser.cjs (Playwright + Chrome required).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/HP/.agents/skills/gstack/node_modules/playwright'); }
function mockClient() {
  const extraProducts = [
    { id: 'bw-1', title: 'Bridal Keepsake', category: 'Bridal & Wedding', price: 200, in_stock: false, is_featured: false, image_url: location.origin + '/Images/art_floral_threadwork.jpg' },
    { id: 'wa-1', title: 'Wall Tapestry', category: 'Wall Art', price: 180, in_stock: false, is_featured: false, image_url: location.origin + '/Images/art_floral_threadwork.jpg' }
  ];
  window.fixture = { fail: false, delays: {}, queries: [], products: Array.from({ length: 130 }, (_, i) => ({
    id: String(i), title: `Artwork ${String(i).padStart(3, '0')}`, category: i < 30 ? 'Hoop Art' : i < 120 ? 'Hand Embroidery' : 'Islamic Art',
    price: i + 10, is_custom_quote: i === 13, custom_price_hint: 'Starts from $150',
    image_url: location.origin + '/Images/art_floral_threadwork.jpg', in_stock: i % 10 !== 0, is_featured: i % 2 === 0
  })).concat(extraProducts) };
  window.supabaseClient = { from() {
    const filters = []; let start = 0, end = null, isCategoryQuery = false;
    return {
      select(cols) { if (cols === 'category') isCategoryQuery = true; return this; },
      eq(key, value) { filters.push([key, value]); return this; },
      not() { return this; },
      order() { return this; },
      range(a, b) { start = a; end = b; return this; },
      limit(n) { end = (start || 0) + n - 1; return this; },
      then(resolve, reject) {
        if (isCategoryQuery) {
          const rows = fixture.products.map(p => ({ category: p.category }));
          return Promise.resolve({ data: rows, error: null }).then(resolve, reject);
        }
        const sliceEnd = end == null ? 11 : end;
        const category = filters.find(([key]) => key === 'category')?.[1] || 'all';
        fixture.queries.push({ category, start, end: sliceEnd, filters });
        const fail = fixture.fail;
        const products = fixture.products.filter(row => filters.every(([key, value]) => row[key] === value));
        return new Promise(r => setTimeout(r, fixture.delays[category] || 40)).then(() => fail ? { error: { message: 'Simulated network error' } } : { data: products.slice(start, sliceEnd + 1), count: products.length, error: null }).then(resolve, reject);
      }
    };
  } };
}
(async () => {
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (error, data) => {
      if (error) { res.writeHead(404); return res.end(); }
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png' })[path.extname(file)] || 'application/octet-stream'); res.end(data);
    });
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await playwright.chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.route('https://**/*', route => route.fulfill({ body: '' }));
    await page.route('**/js/supabase-client.js', route => route.fulfill({ contentType: 'application/javascript', body: `(${mockClient.toString()})();` }));
    const ready = () => page.waitForFunction(() => document.querySelector('#shopResults')?.getAttribute('aria-busy') === 'false');
    const cards = () => page.locator('#shopProducts .artwork-card');
    await page.goto(base + '/index.html');
    const galleryCta = page.locator('a[href="shop.html"]').filter({ hasText: /Explore Full Gallery|Shop the Collection/ }).first();
    assert.equal(await galleryCta.getAttribute('href'), 'shop.html');
    await page.getByRole('link', { name: 'View All Artwork', exact: true }).click();
    await page.waitForURL('**/shop.html*'); await ready();
    assert.equal(await cards().count(), 12);
    assert.equal(await page.locator('#shopPagination button').filter({ hasText: /^Previous$/ }).isDisabled(), true);
    assert.match(await page.locator('#shopStatus').textContent(), /117 artworks/);
    assert.ok((await page.locator('.shop-page-btn').count()) < 10);
    console.log('PASS: homepage links, 12 in-stock products, truncated pagination');
    await page.locator('#shopFilters').getByRole('button', { name: 'Hoop Art', exact: true }).click(); await ready();
    assert.match(page.url(), /page=1/);
    assert.equal(await cards().evaluateAll(cards => cards.every(card => card.dataset.category === 'Hoop Art')), true);
    await page.getByRole('button', { name: 'Page 2', exact: true }).click(); await ready();
    assert.match(page.url(), /page=2/);
    assert.equal(await cards().first().getAttribute('data-title'), 'Artwork 014');
    const card = cards().first(); const title = await card.getAttribute('data-title');
    await card.locator('.artwork-quick-view-btn').evaluate(el => el.click());
    assert.equal(await page.locator('#quickViewTitle').textContent(), title);
    await page.locator('#quickViewClose').click();
    await card.locator('.artwork-detail-btn').evaluate(el => el.click());
    assert.equal(await page.evaluate(title => JSON.parse(localStorage.getItem('shah_cart')).some(row => row.title === title && row.quantity === 1), title), true);
    assert.equal(await page.locator('#quickViewModal').evaluate(el => el.classList.contains('active')), false);
    await card.locator('.wishlist-toggle-btn').evaluate(el => el.click());
    await page.locator('#authModal.active').waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('shah_wishlist')), null);
    await page.locator('#authModalClose').click();
    await page.goBack(); await ready(); assert.match(page.url(), /page=1/);
    await page.goForward(); await ready(); assert.match(page.url(), /page=2/);
    assert.equal(await cards().first().locator('.wishlist-toggle-btn').evaluate(el => el.classList.contains('active')), false);
    await page.reload(); await ready(); assert.match(page.url(), /category=Hoop\+Art&page=2/);
    console.log('PASS: category/page history, bookmark reload, Quick View/cart/wishlist on page 2');
    await page.getByRole('button', { name: 'Page 3', exact: true }).click(); await ready();
    assert.equal(await cards().count(), 3);
    assert.equal(await page.getByRole('button', { name: 'Next', exact: true }).isDisabled(), true);
    await page.locator('#shopFilters').getByRole('button', { name: 'Bridal & Wedding', exact: true }).click(); await ready();
    assert.match(page.url(), /page=1/);
    assert.equal(await cards().count(), 0);
    assert.match(await page.locator('#shopProducts').textContent(), /No items found/);
    await page.locator('#shopProducts').getByRole('button', { name: 'View All Artwork' }).click(); await ready();
    assert.equal(await cards().count(), 12);
    await page.evaluate(() => { fixture.fail = true; });
    await page.locator('#shopFilters').getByRole('button', { name: 'Wall Art', exact: true }).click(); await ready();
    assert.match(await page.locator('#shopStatus').textContent(), /Unable/);
    await page.evaluate(() => { fixture.fail = false; });
    await page.getByRole('button', { name: 'Try Again' }).click(); await ready();
    assert.match(await page.locator('#shopProducts').textContent(), /No items found/);
    console.log('PASS: last-page boundaries, empty category and retryable errors');
    await page.evaluate(() => { fixture.delays = { 'Hoop Art': 500, 'Islamic Art': 30 }; });
    await page.locator('#shopFilters').getByRole('button', { name: 'Hoop Art', exact: true }).click();
    assert.equal(await page.locator('.skeleton-card').count(), 12);
    await page.locator('#shopFilters').getByRole('button', { name: 'Islamic Art', exact: true }).click(); await ready();
    await page.waitForTimeout(550);
    assert.equal(await cards().evaluateAll(cards => cards.every(card => card.dataset.category === 'Islamic Art')), true);
    await page.goto(base + '/shop.html?category=Hoop%20Art&page=999'); await ready();
    assert.match(page.url(), /page=3/); assert.equal(await cards().count(), 3);
    await page.goto(base + '/shop.html?category=bad&page=-4'); await ready();
    assert.match(page.url(), /category=all&page=1/);
    console.log('PASS: loading skeletons, stale-response protection, invalid/out-of-range URLs');
    for (const width of [1280, 768, 480]) {
      await page.setViewportSize({ width, height: 900 });
      // Exercise the existing scroll reveals before taking a static snapshot.
      for (const card of await cards().all()) await card.scrollIntoViewIfNeeded();
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(700);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.equal(await page.locator('#shopPagination button').evaluateAll(buttons => buttons.every(button => button.getBoundingClientRect().width >= 44 && button.getBoundingClientRect().height >= 44)), true);
      if (width <= 768) assert.equal(await page.locator('#shopFilters').evaluate(el => el.scrollWidth > el.clientWidth && getComputedStyle(el).overflowX === 'auto'), true);
      const screenshotDir = path.join(root, 'Test 1 Result', 'screenshots');
      fs.mkdirSync(screenshotDir, { recursive: true });
      await page.screenshot({ path: path.join(screenshotDir, `shop-${width}.png`) });
      await page.locator('#shopPagination').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(screenshotDir, `shop-pagination-${width}.png`) });
    }
    assert.deepEqual(errors, []);
    console.log('PASS: 1280/768/480px layouts, scrollable filters, 44px pagination targets; no runtime errors');
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
