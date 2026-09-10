// Opt-in live integration test. Opens a fresh browser for the owner to sign in.
// Creates, edits and deletes ONLY a uniquely named verification product.
// Run with the site served at http://127.0.0.1:4173.
const assert = require('node:assert/strict');
const path = require('node:path');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/HP/.agents/skills/gstack/node_modules/playwright'); }
(async () => {
  const browser = await playwright.chromium.launch({ channel: 'chrome', headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const title = `Admin verification ${Date.now()}`;
  let created = false;
  try {
    await page.goto('http://127.0.0.1:4173/admin.html');
    await page.waitForURL('**/admin-login.html');
    console.log('PASS: live logged-out redirect. Sign in in the opened Chrome window to continue.');
    await page.waitForURL('**/admin.html', { timeout: 600000 });
    await page.locator('#adminDashboard').waitFor({ state: 'visible' });
    console.log('PASS: real owner login and protected dashboard.');
    const cleanupTitle = process.argv.find(arg => arg.startsWith('--cleanup-title='))?.slice('--cleanup-title='.length);
    if (cleanupTitle) {
      assert.match(cleanupTitle, /^Admin verification \d+$/, 'Cleanup is limited to named verification products.');
      const previousRow = page.locator('#productsBody tr').filter({ hasText: cleanupTitle });
      await previousRow.waitFor({ state: 'visible' });
      await previousRow.getByRole('button', { name: 'Delete', exact: true }).click();
      await page.locator('#confirmDelete').click();
      await previousRow.waitFor({ state: 'detached' });
      console.log('Removed previous temporary product:', cleanupTitle);
    }
    await page.locator('#title').fill(title);
    await page.locator('#price').fill('12.34');
    await page.locator('#description').fill('Temporary product created for the requested admin integration test.');
    await page.locator('#is_featured').check();
    await page.locator('#productImage').setInputFiles(path.resolve(__dirname, '../Images/art_floral_threadwork.jpg'));
    await page.locator('#productSubmit').click();
    await page.waitForFunction(title => document.querySelector('#productsBody').textContent.includes(title) || document.querySelector('#productError').textContent.length > 0, title, { timeout: 60000 });
    assert.equal(await page.locator('#productError').textContent(), '');
    created = true;
    const row = page.locator('#productsBody tr').filter({ hasText: title });
    assert.equal(await row.count(), 1);
    console.log('PASS: live image upload and product insert.');
    const imageUrl = await row.locator('img').getAttribute('src');
    const imagePath = decodeURIComponent(new URL(imageUrl).pathname.split('/storage/v1/object/public/product-images/')[1]);
    const imageExists = async () => page.evaluate(async imagePath => {
      const slash = imagePath.lastIndexOf('/');
      const folder = slash < 0 ? '' : imagePath.slice(0, slash);
      const name = imagePath.slice(slash + 1);
      const { data, error } = await supabaseClient.storage.from('product-images').list(folder, { search: name });
      if (error) throw new Error(error.message);
      return data.some(object => object.name === name);
    }, imagePath);
    assert.equal(await imageExists(), true, 'Uploaded image must exist in Storage before deletion (SELECT policy required).');
    console.log('PASS: uploaded image confirmed in Storage.');
    const publicContext = await browser.newContext();
    const homepage = await publicContext.newPage();
    homepage.on('pageerror', error => errors.push(error.message));
    const checkHome = async price => {
      await homepage.goto('http://127.0.0.1:4173/index.html');
      const card = homepage.locator('#featured .artwork-card').filter({ hasText: title });
      await card.waitFor({ state: 'visible', timeout: 30000 });
      assert.equal(await card.getAttribute('data-price'), price);
    };
    await checkHome('$12.34');
    console.log('PASS: unauthenticated homepage shows new product.');
    await row.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.locator('#price').fill('23.45');
    await page.locator('#productSubmit').click();
    await page.waitForFunction(title => [...document.querySelectorAll('#productsBody tr')].some(row => row.textContent.includes(title) && row.textContent.includes('$23.45')) || document.querySelector('#productError').textContent.length > 0, title);
    assert.equal(await page.locator('#productError').textContent(), '');
    await checkHome('$23.45');
    console.log('PASS: live price update in dashboard and public homepage.');
    await row.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.locator('#confirmDelete').click();
    await page.waitForFunction(() => document.querySelector('#deleteModal').hidden || document.querySelector('#deleteError').textContent.length > 0);
    assert.equal(await page.locator('#deleteError').textContent(), '');
    await row.waitFor({ state: 'detached' });
    created = false;
    assert.equal(await imageExists(), false, 'Image still exists in Storage after product deletion (check Storage DELETE policy).');
    console.log('PASS: associated Storage object removed.');
    const response = homepage.waitForResponse(response => response.url().includes('/rest/v1/products'));
    await homepage.reload();
    const data = await (await response).json();
    assert.ok(Array.isArray(data) && !data.some(product => product.title === title));
    console.log('PASS: live deletion reflected in dashboard and public query.');
    // Set up SQL-style rows without using or altering the Add/Edit form validation.
    for (const [suffix, imageUrl] of [['empty-image', ''], ['external-image', 'https://example.com/product.jpg']]) {
      const edgeTitle = `${title} ${suffix}`;
      const result = await page.evaluate(async ({ title, imageUrl }) => {
        const { data, error } = await supabaseClient.from('products').insert({ title, category: 'Hand Embroidery', price: 1, image_url: imageUrl, is_custom_quote: false, is_featured: false, in_stock: false }).select('id').single();
        return { data, error };
      }, { title: edgeTitle, imageUrl });
      assert.equal(result.error, null);
      console.log(`Created edge-case test row: ${edgeTitle}`);
      let storageRequests = 0;
      const onRequest = request => { if (request.method() === 'DELETE' && request.url().includes('/storage/v1/object/')) storageRequests++; };
      page.on('request', onRequest);
      await page.locator('#refreshProducts').click();
      const edgeRow = page.locator('#productsBody tr').filter({ hasText: edgeTitle });
      await edgeRow.getByRole('button', { name: 'Delete', exact: true }).click();
      await page.locator('#confirmDelete').click();
      await edgeRow.waitFor({ state: 'detached' });
      page.off('request', onRequest);
      assert.equal(await page.locator('#deleteError').textContent(), '');
      assert.equal(storageRequests, 0);
      const remaining = await page.evaluate(async id => {
        const { data, error } = await supabaseClient.from('products').select('id').eq('id', id);
        if (error) throw new Error(error.message);
        return data.length;
      }, result.data.id);
      assert.equal(remaining, 0);
      console.log(`PASS: ${suffix} product deleted without a Storage removal request.`);
    }
    await page.locator('#adminLogout').click();
    await page.waitForURL('**/admin-login.html');
    assert.deepEqual(errors, []);
    console.log('PASS: live logout; no JavaScript runtime errors.');
  } finally {
    if (created) {
      try {
        const testRow = page.locator('#productsBody tr').filter({ hasText: title });
        await testRow.getByRole('button', { name: 'Delete', exact: true }).click();
        await page.locator('#confirmDelete').click();
        await testRow.waitFor({ state: 'detached' });
        console.log(`Removed temporary product after failed verification: ${title}. Check Storage if cleanup policies are unavailable.`);
      } catch { console.log(`Live verification stopped; remove the test product named: ${title}`); }
    }
    await browser.close();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
