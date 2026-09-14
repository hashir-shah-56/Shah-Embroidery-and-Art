const assert = require('node:assert/strict');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/HP/.agents/skills/gstack/node_modules/playwright'); }

(async () => {
  const browser = await playwright.chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 480, height: 900 } });
  await page.setContent(`
    <section id="gallery"><div id="galleryFilters" class="gallery-tabs"></div><div id="galleryGrid" class="gallery-grid"></div></section>
    <div id="quickViewModal"><img id="quickViewImg"><span id="quickViewCategory"></span><h2 id="quickViewTitle"></h2><span id="quickViewPrice"></span></div>
  `);
  await page.evaluate(() => {
    window.supabaseClient = { from: () => ({ select: () => ({ eq: () => ({ order: () => ({ limit: () => Promise.resolve({
      data: [
        { id: '1', title: 'Newest Hoop', category: 'Hoop Art', price: 50, in_stock: true, image_url: '' },
        { id: '2', title: 'Newest Wall', category: 'Wall Art', is_custom_quote: true, in_stock: true, image_url: '' }
      ], error: null
    }) }) }) }) }) };
    window.fetchCategories = async () => ['Hoop Art', 'Wall Art'];
  });
  await page.addScriptTag({ content: 'const supabaseClient = window.supabaseClient;' });
  await page.addScriptTag({ path: require('node:path').resolve(__dirname, '../js/gallery-loader.js') });
  await page.waitForTimeout(100);
  assert.equal(await page.locator('#galleryGrid .gallery-item').count(), 2);
  assert.equal(await page.locator('#galleryGrid .gallery-img').first().getAttribute('src'), 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=600&auto=format&fit=crop');
  assert.equal(await page.locator('#galleryFilters .tab-btn').count(), 3);
  await page.locator('#galleryFilters .tab-btn').nth(1).click();
  assert.equal(await page.locator('#galleryGrid .gallery-item').count(), 1);
  await page.locator('#galleryGrid .gallery-item').click();
  assert.equal(await page.locator('#galleryViewTitle').textContent(), 'Newest Hoop');
  assert.equal(await page.locator('#galleryViewDescription').textContent(), 'A handcrafted piece from Shah Embroidery & Art.');
  assert.equal(await page.locator('#galleryViewModal').evaluate(node => node.classList.contains('active')), true);
  assert.equal(await page.locator('#galleryViewModal button').count(), 1);
  await page.locator('#galleryViewClose').click();
  assert.equal(await page.locator('#galleryViewModal').evaluate(node => node.classList.contains('active')), false);
  await page.locator('#galleryGrid .gallery-item').click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#galleryViewModal').evaluate(node => node.classList.contains('active')), false);
  for (const width of [1280, 768, 480]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true);
  }
  const layoutPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await layoutPage.setContent('<div class="gallery-grid"><div class="gallery-item"></div><div class="gallery-item tall"></div></div>');
  await layoutPage.addStyleTag({ path: require('node:path').resolve(__dirname, '../css/gallery.css') });
  await layoutPage.addStyleTag({ path: require('node:path').resolve(__dirname, '../css/responsive.css') });
  for (const width of [1280, 1024, 768, 480]) {
    await layoutPage.setViewportSize({ width, height: 900 });
    const sizes = await layoutPage.locator('.gallery-item').evaluateAll(items => items.map(item => ({ width: item.getBoundingClientRect().width, height: item.getBoundingClientRect().height })));
    assert.ok(sizes[0].width <= 320 && sizes[0].width >= Math.min(260, width - 80));
    assert.equal(sizes[0].height, 280);
    assert.equal(sizes[1].height, width <= 900 ? 580 : 580);
  }
  await layoutPage.close();
  console.log('PASS: dynamic gallery rendering, filtering, view-only modal, and responsive sizing');
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
