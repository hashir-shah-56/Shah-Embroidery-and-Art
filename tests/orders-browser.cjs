// Browser integration with an isolated SDK fixture. Real RLS is tested by orders-sql.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { mockClient } = require('./customer-auth-browser.cjs');
let playwright;
try { playwright = require('playwright'); } catch { playwright = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/HP/.agents/skills/gstack/node_modules/playwright'); }
const root = path.resolve(__dirname, '..');
const a = '11111111-1111-4111-8111-111111111111', b = '22222222-2222-4222-8222-222222222222', owner = 'a8dbfb82-d3df-421c-acf1-194335507e80';
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
        if (window.orderDelay) await new Promise(r=>setTimeout(r,window.orderDelay));
        const user=JSON.parse(localStorage.getItem('test-session') || 'null');
        const db=JSON.parse(localStorage.getItem('test-orders-db') || '{"orders":[],"order_items":[]}');
        const failure=localStorage.getItem('test-order-failure');
        const log=JSON.parse(localStorage.getItem('test-order-log') || '[]'); log.push({table,action,filters}); localStorage.setItem('test-order-log',JSON.stringify(log));
        if (!user || failure===`${table}-${action}`) return {error:{code:'42501'}};
        const visible=row=> table==='orders' ? row.user_id===user.id || user.id===owner : db.orders.some(o=>o.id===row.order_id && (o.user_id===user.id || user.id===owner));
        let rows=db[table].filter(visible).filter(row=>filters.every(([key,value])=>row[key]===value));
        if (action==='insert') {
          const incoming=Array.isArray(payload)?payload:[payload];
          if (incoming.some(row=>!visible(row))) return {error:{code:'42501'}};
          if (incoming.some(row=>db[table].some(old=>old.id===row.id || (table==='orders' && old.order_number===row.order_number)))) return {error:{code:'23505'}};
          rows=incoming.map(row=>({...row,created_at:new Date().toISOString(),updated_at:new Date().toISOString()})); db[table].push(...rows);
        } else if (action==='update') { rows.forEach(row=>Object.assign(row,payload)); }
        if (action!=='read') localStorage.setItem('test-orders-db',JSON.stringify(db));
        if (failure===`${table}-lost-response` && action==='insert') return {error:{code:'network'}};
        const count=rows.length;
        if (action==='read') rows.reverse();
        rows=rows.slice(start,end+1);
        if (table==='orders') rows=rows.map(row=>({...row,order_items:db.order_items.filter(item=>item.order_id===row.id)}));
        return {data:single?(rows[0]||null):rows,count};
      }).then(resolve,reject); }
    }; return q;
  };
}
(async()=>{
  const server=http.createServer((req,res)=>{
    const file=path.resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));
    if (!file.startsWith(root+path.sep)) {res.writeHead(403);return res.end();}
    fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.end(data);});
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${server.address().port}`; let browser;
  try {
    browser=await playwright.chromium.launch({channel:'chrome',headless:true});
    const context=await browser.newContext();
    await context.route('https://**/*',r=>r.fulfill({body:''}));
    await context.route('**/js/supabase-client.js',r=>r.fulfill({contentType:'application/javascript',body:`(${mockClient.toString()})();(${ordersMock.toString()})('${owner}');`}));
    const page=await context.newPage(), errors=[]; page.on('pageerror',e=>errors.push(e.message));
    const goto=async file=>{await page.goto(base+'/'+file); if(!file.startsWith('admin'))await page.evaluate(()=>customerAuth.ready);};
    const identity=async(id,name)=>page.evaluate(({id,name})=>{
      localStorage.setItem('test-session',JSON.stringify({id,email:`${id.slice(0,1)}@example.com`,user_metadata:{full_name:name}}));
      localStorage.setItem('test-profile',JSON.stringify({id,full_name:name,email:`${id.slice(0,1)}@example.com`,phone:'03001234567'}));
    },{id,name});
    const cart=[{id:'cart-local',productId:12,title:'Floral Test',category:'Hoop Art',price:'Rs. 1,250',numericPrice:1250,quantity:2,img:'Images/Logo.png'}, {id:'custom',title:'Custom Art',category:'Custom',price:'Custom Quote',numericPrice:0,quantity:1,img:'Images/Logo.png'}];
    const seedCart=()=>page.evaluate(cart=>localStorage.setItem('shah_cart',JSON.stringify(cart)),cart);
    const fill=async()=>{
      for(const [key,value] of Object.entries({Name:'Customer One',Phone:'03001234567',Email:'one@example.com',Address:'12 Main Road',City:'Lahore',Postal:'54000'})) await page.locator('#checkout'+key).fill(value);
      await page.locator('#checkoutCountry').selectOption('Pakistan');
    };
    const submit=()=>page.locator('#checkoutForm [type=submit]').click();
    const db=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('test-orders-db')||'{"orders":[],"order_items":[]}'));
    await goto('index.html'); await seedCart();
    await page.evaluate(()=>localStorage.setItem('shah_orders','[{"orderId":"LEGACY"}]'));
    await goto('checkout.html'); await page.waitForURL('**/cart.html?login=checkout');
    await page.locator('#loginEmail').fill('one@example.com'); await page.locator('#loginPassword').fill('StrongPass1');
    await page.locator('#loginForm [type=submit]').click(); await page.waitForURL('**/checkout.html'); await page.evaluate(()=>customerAuth.ready);
    assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('shah_cart'))),cart);
    assert.equal(await page.locator('.payment-card, .payment-options-grid, #bankTransferDetails, #cardMockDetails').count(),0);
    assert.equal(await page.locator('.checkout-payment-value').textContent(),'Cash on Delivery');
    await fill(); await page.evaluate(()=>localStorage.setItem('test-order-failure','orders-insert')); await submit();
    await page.waitForFunction(()=>document.querySelector('#siteToast')?.textContent.includes("couldn't save"));
    assert.equal((await db()).orders.length,0); assert(page.url().endsWith('checkout.html'));
    assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('shah_cart'))),cart);
    await page.evaluate(()=>localStorage.setItem('test-order-failure','order_items-insert')); await submit();
    await page.waitForFunction(()=>document.querySelector('#checkoutForm').dataset.busy==='false');
    assert.equal((await db()).orders.length,1); assert.equal((await db()).order_items.length,0);
    await page.reload(); await page.evaluate(()=>customerAuth.ready); await fill();
    await page.evaluate(()=>{localStorage.removeItem('test-order-failure');window.orderDelay=150;});
    await submit(); await page.locator('#checkoutForm').dispatchEvent('submit');
    await page.waitForURL('**/order-confirmation.html');
    let rows=await db(); assert.equal(rows.orders.length,1); assert.equal(rows.order_items.length,2);
    assert.equal(rows.orders[0].payment_method,'cod');
    await page.waitForFunction(()=>document.querySelector('#confirmReceiptCard')?.textContent.includes('Cash on Delivery'));
    assert.doesNotMatch(await page.locator('#confirmReceiptCard').innerText(),/bank transfer|WhatsApp|Credit.*Debit/i);
    assert.equal(rows.orders[0].user_id,a); assert.equal(rows.orders[0].total,2500); assert.equal(rows.order_items[0].product_id,12); assert.equal(rows.order_items[1].is_custom_quote,true);
    assert.equal(await page.evaluate(()=>localStorage.getItem('shah_cart')),null);
    assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('shah_last_order')).items),cart);
    assert.equal(await page.evaluate(()=>localStorage.getItem('shah_orders')),'[{"orderId":"LEGACY"}]');
    console.log('PASS: guest login/cart continuity; header/item failures retain cart; reload retry and repeated submit create one header/two items; unchanged receipt cache and ignored legacy orders');
    await goto('profile.html'); await page.locator('.account-order-card').waitFor();
    assert.equal(await page.locator('.account-order-card').count(),1);
    await page.locator('.order-expand-btn').click();
    assert.match(await page.locator('#order-details-0').innerText(),/Cash on Delivery/);
    await page.locator('.cancel-order-btn').click();
    await page.locator('#confirmCancellation').click(); await page.waitForFunction(()=>document.querySelector('.order-status-badge')?.textContent==='Cancelled');
    assert.equal((await db()).orders[0].status,'Cancelled');
    await page.reload(); await page.locator('.order-status-badge').waitFor(); assert.equal(await page.locator('.cancel-order-btn').count(),0);
    await page.evaluate(()=>localStorage.setItem('test-order-failure','orders-read')); await page.reload(); await page.locator('#retryOrders').waitFor();
    await page.evaluate(()=>localStorage.removeItem('test-order-failure')); await page.locator('#retryOrders').click(); await page.locator('.account-order-card').waitFor();
    await identity(b,'Customer Two'); await seedCart(); await goto('checkout.html'); await fill();
    await page.evaluate(()=>localStorage.setItem('test-order-failure','order_items-lost-response')); await submit();
    await page.waitForFunction(()=>document.querySelector('#checkoutForm').dataset.busy==='false');
    assert.equal((await db()).orders.length,2); assert.equal((await db()).order_items.length,4);
    await page.evaluate(()=>localStorage.removeItem('test-order-failure')); await submit(); await page.waitForURL('**/order-confirmation.html');
    assert.equal((await db()).order_items.length,4);
    await goto('profile.html'); await page.locator('.account-order-card').waitFor(); assert.equal(await page.locator('.account-order-card').count(),1);
    assert.equal(await page.locator('.order-status-badge').textContent(),'Processing');
    assert.equal(await page.evaluate(()=>customerOrders.listAdmin().then(()=>false,()=>true)),true);
    for(const width of [1440,1024,900,768,480,393,360]) {
      await page.setViewportSize({width,height:850});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`profile overflow ${width}`);
    }
    console.log('PASS: database history, persistent cancellation, load-error retry, second customer isolation, lost item response retry without duplication, customer denied admin service, profile widths');
    await identity(owner,'Owner'); await goto('admin.html'); await page.locator('#orderStatus-0').waitFor();
    assert.equal(await page.locator('.order-status-save').count(),2);
    await page.locator('.order-details-toggle').first().click(); assert.match(await page.locator('#adminOrderDetails-0').innerText(), /12 Main Road/);
    assert.match(await page.locator('#adminOrderDetails-0').innerText(), /Cash on Delivery/);
    await page.evaluate(()=>{const db=JSON.parse(localStorage.getItem('test-orders-db'));db.orders[0].payment_method='bank';db.orders[1].payment_method='card';localStorage.setItem('test-orders-db',JSON.stringify(db));});
    await identity(b,'Customer Two'); await goto('profile.html'); await page.locator('.account-order-card').waitFor();
    await page.locator('.order-expand-btn').click(); assert.match(await page.locator('#order-details-0').innerText(),/Credit \/ Debit Card Online/);
    await identity(owner,'Owner'); await goto('admin.html'); await page.locator('#orderStatus-0').waitFor();
    assert.match(await page.locator('#ordersBody').textContent(),/Direct Bank Transfer/);
    assert.match(await page.locator('#ordersBody').textContent(),/Card \(simulated\)/);
    await page.locator('#orderStatus-0').selectOption('Shipped'); await page.locator('.order-status-save').first().click();
    await page.waitForFunction(()=>document.querySelector('#orderStatus-0')?.value==='Shipped' && document.querySelector('.order-status-save')?.disabled);
    await page.reload(); await page.locator('#orderStatus-0').waitFor(); assert.equal(await page.locator('#orderStatus-0').inputValue(),'Shipped');
    // Table strings remain text; unsafe image schemes cannot become executable attributes.
    await page.evaluate(()=>{const db=JSON.parse(localStorage.getItem('test-orders-db'));db.orders[1].shipping_name='<img src=x onerror="window.injected=true">';db.order_items[2].image_url='javascript:window.injected=true';localStorage.setItem('test-orders-db',JSON.stringify(db));});
    await page.locator('#refreshOrders').click(); await page.locator('#orderStatus-0').waitFor();
    assert.equal(await page.evaluate(()=>!!window.injected),false); assert.equal(await page.locator('#ordersBody td:nth-child(2) img').count(),0);
    for(const width of [1440,1024,900,768,480,393,360]) {
      await page.setViewportSize({width,height:850});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`admin overflow ${width}`);
    }
    await page.evaluate(()=>{const db=JSON.parse(localStorage.getItem('test-orders-db'));const row=db.orders[0];for(let i=0;i<25;i++)db.orders.push({...row,id:crypto.randomUUID(),order_number:'SE-'+(20000+i)});localStorage.setItem('test-orders-db',JSON.stringify(db));});
    await page.locator('#refreshOrders').click(); await page.waitForFunction(()=>document.querySelectorAll('.order-status-save').length===25);
    await page.locator('#nextOrdersPage').click(); await page.waitForFunction(()=>document.querySelectorAll('.order-status-save').length===2);
    await page.locator('#adminLogout').click(); await page.waitForURL('**/admin-login.html');
    assert.deepEqual(errors,[]);
    console.log('PASS: owner sees both customers, expandable details, persisted status update, safe rendering, 25-order pagination, admin widths and logout; no runtime errors');
  } finally {await browser?.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
