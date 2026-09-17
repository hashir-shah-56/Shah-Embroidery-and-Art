const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { mockClient } = require('./customer-auth-browser.cjs');
let playwright;
try { playwright = require('playwright'); } catch { playwright = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/HP/.agents/skills/gstack/node_modules/playwright'); }
const root = path.resolve(__dirname, '..');
const owner = 'a8dbfb82-d3df-421c-acf1-194335507e80';

function ordersMock(owner) {
  const original = supabaseClient.from;
  supabaseClient.from = table => {
    if (!['orders','order_items'].includes(table)) return original(table);
    let action = 'read', payload, single = false, filters = [], start = 0, end = Infinity;
    const q = {
      select() { return this; }, order() { return this; }, eq(k,v) { filters.push([k,v]); return this; },
      range(a,b) { start=a; end=b; return this; }, maybeSingle() { single=true; return this; }, single() { single=true; return this; },
      insert(v) { action='insert'; payload=v; return this; }, update(v) { action='update'; payload=v; return this; },
      then(resolve,reject) { return Promise.resolve().then(async () => {
        const user = JSON.parse(localStorage.getItem('test-session') || 'null');
        const db = JSON.parse(localStorage.getItem('test-orders-db') || '{"orders":[],"order_items":[]}');
        if (!user) return {error:{code:'42501'}};
        const visible = row => table==='orders' ? row.user_id===user.id || user.id===owner : db.orders.some(o=>o.id===row.order_id && (o.user_id===user.id || user.id===owner));
        let rows = db[table].filter(visible).filter(row=>filters.every(([key,value])=>row[key]===value));
        if (action==='insert') {
          const incoming = Array.isArray(payload)?payload:[payload];
          rows = incoming.map(row=>({...row,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}));
          db[table].push(...rows);
          localStorage.setItem('test-orders-db',JSON.stringify(db));
        }
        const count = rows.length;
        if (action==='read') rows.reverse();
        rows = rows.slice(start,end+1);
        if (table==='orders') rows = rows.map(row=>({...row,order_items:db.order_items.filter(item=>item.order_id===row.id)}));
        return {data:single?(rows[0]||null):rows,count};
      }).then(resolve,reject); }
    }; return q;
  };
}

(async () => {
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + (req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (error, data) => {
      if (error) { res.writeHead(404); return res.end(); }
      res.setHeader('Content-Type', ({
        '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg'
      })[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    });
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await playwright.chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext();
    await context.route('https://**/*', r => r.fulfill({ body: '' }));
    await context.route('**/js/supabase-client.js', r => r.fulfill({
      contentType: 'application/javascript',
      body: `(${mockClient.toString()})();(${ordersMock.toString()})('${owner}');`
    }));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    const customerId = '33333333-3333-4333-8333-333333333333';
    const setSession = async (id, name) => page.evaluate(({ id, name }) => {
      localStorage.setItem('test-session', JSON.stringify({ id, email: 'customer@example.com', user_metadata: { full_name: name } }));
      localStorage.setItem('test-profile', JSON.stringify({ id, full_name: name, email: 'customer@example.com', phone: '03001234567' }));
    }, { id, name });

    const cart = [{ id: 'cart-1', productId: 10, title: 'Handmade Hoop', category: 'Hoop Art', price: '$45.00', numericPrice: 45, quantity: 1, img: 'Images/Logo.png' }];

    // 1. Visit checkout.html directly as logged-in user
    await page.goto(base + '/');
    await setSession(customerId, 'Fatima Shah');
    await page.evaluate(c => localStorage.setItem('shah_cart', JSON.stringify(c)), cart);

    await page.goto(base + '/checkout.html');
    await page.evaluate(() => customerAuth.ready);

    // Verify payment selection cards, bankTransferDetails, and cardMockDetails are NOT in the DOM
    const paymentCardCount = await page.locator('.payment-card').count();
    assert.equal(paymentCardCount, 0, 'No .payment-card elements should exist');
    const bankDetailsCount = await page.locator('#bankTransferDetails').count();
    assert.equal(bankDetailsCount, 0, '#bankTransferDetails must not exist');
    const cardMockCount = await page.locator('#cardMockDetails').count();
    assert.equal(cardMockCount, 0, '#cardMockDetails must not exist');

    // Verify non-interactive "Payment Method: Cash on Delivery" line in summary
    const paymentInfo = page.locator('.checkout-payment-info');
    await paymentInfo.waitFor({ state: 'visible' });
    const paymentLabel = await paymentInfo.locator('.checkout-payment-label').innerText();
    const paymentValue = await paymentInfo.locator('.checkout-payment-value').innerText();
    assert.equal(paymentLabel.trim(), 'Payment Method');
    assert.equal(paymentValue.trim(), 'Cash on Delivery');
    console.log('PASS: checkout.html has no selector cards and displays informational Cash on Delivery row');

    // 2. Complete order submission and verify database persistence with payment_method = 'cod'
    await page.locator('#checkoutName').fill('Fatima Shah');
    await page.locator('#checkoutPhone').fill('03001234567');
    await page.locator('#checkoutEmail').fill('customer@example.com');
    await page.locator('#checkoutAddress').fill('78 Gulberg III');
    await page.locator('#checkoutCity').fill('Lahore');
    await page.locator('#checkoutPostal').fill('54000');
    await page.locator('#checkoutCountry').selectOption('Pakistan');
    await page.locator('#btnPlaceOrder').click();

    await page.waitForURL('**/order-confirmation.html');
    const db = await page.evaluate(() => JSON.parse(localStorage.getItem('test-orders-db') || '{"orders":[],"order_items":[]}'));
    assert.equal(db.orders.length, 1, 'Order must be saved to DB');
    assert.equal(db.orders[0].payment_method, 'cod', 'payment_method must be "cod"');
    console.log('PASS: test order saved with payment_method = "cod" in database');

    // 3. Verify order-confirmation.html
    const receiptCard = page.locator('#confirmReceiptCard');
    await page.locator('#confirmReceiptCard strong', { hasText: 'Cash on Delivery' }).waitFor();
    const receiptText = await receiptCard.innerText();
    assert.match(receiptText, /Cash on Delivery/);
    assert.doesNotMatch(receiptText, /WhatsApp/i, 'No bank-transfer WhatsApp note should be present');
    assert.doesNotMatch(receiptText, /Direct Bank Transfer/);
    console.log('PASS: order-confirmation.html displays Cash on Delivery and no WhatsApp note');

    // 4. Verify profile.html Order History
    await page.goto(base + '/profile.html');
    await page.evaluate(() => customerAuth.ready);
    const orderCard = page.locator('.account-order-card').first();
    await orderCard.waitFor({ state: 'visible' });
    await page.locator('.order-expand-btn').first().click();
    const orderDetailsText = await page.locator('.order-details').first().innerText();
    assert.match(orderDetailsText, /Cash on Delivery/);
    console.log('PASS: profile.html displays Cash on Delivery for order history');

    // 5. Verify admin.html Order Management
    await setSession(owner, 'Owner Admin');
    await page.goto(base + '/admin.html');
    await page.locator('#adminOrdersPanel').waitFor({ state: 'visible' });
    await page.locator('.order-details-toggle').first().click();
    const adminDetailsText = await page.locator('.admin-order-details').first().innerText();
    assert.match(adminDetailsText, /Cash on Delivery/);
    console.log('PASS: admin.html displays Cash on Delivery in order details');

    assert.deepEqual(errors, [], 'No page errors occurred during test');
    console.log('ALL COD CHECKOUT VERIFICATIONS PASSED SUCCESSFULLY');
  } finally {
    await browser?.close();
    await new Promise(r => server.close(r));
  }
})().catch(e => {
  console.error(e);
  process.exitCode = 1;
});

