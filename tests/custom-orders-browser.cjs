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
function requestsMock(owner) {
  const original = supabaseClient.from;
  fixture.uploads = 0;
  supabaseClient.storage = {from:()=>({upload:async()=>{fixture.uploads++;if(fixture.mode==='upload')return {error:{code:'denied'}};return {};},getPublicUrl:()=>({data:{publicUrl:location.origin+'/Images/Logo.png'}})})};
  supabaseClient.from = table => {
    if(table!=='custom_order_requests')return original(table);
    let action='read',payload,filters=[],single=false,start=0,end=Infinity,returning=false;
    const q={ select(){returning=true;return this;},order(){return this;},eq(k,v){filters.push([k,v]);return this;},range(a,b){start=a;end=b;return this;},single(){single=true;return this;},insert(v){action='insert';payload=v;return this;},update(v){action='update';payload=v;return this;},then(resolve,reject){return Promise.resolve().then(async()=>{
      await new Promise(r=>setTimeout(r,100));
      const user=JSON.parse(localStorage.getItem('test-session')||'null');
      const db=JSON.parse(localStorage.getItem('test-requests')||'[]');
      if(fixture.mode===action)return {error:{code:'denied'}};
      let rows=db.filter(row=>user&&(row.user_id===user.id||user.id===owner)).filter(row=>filters.every(([k,v])=>row[k]===v));
      if(action==='insert'){
        if(returning&&!user)return {error:{code:'guest_select_denied'}};
        if(payload.user_id!==(user?.id||null))return {error:{code:'wrong_owner'}};
        rows=[{...payload,id:crypto.randomUUID(),created_at:new Date().toISOString()}];db.push(...rows);
      }
      if(action==='update'){if(user?.id!==owner)return {error:{code:'owner_only'}};rows.forEach(row=>Object.assign(row,payload));}
      if(action!=='read')localStorage.setItem('test-requests',JSON.stringify(db));
      if(action==='insert')return {data:null,error:null};
      const count=rows.length;rows.reverse();rows=rows.slice(start,end+1);return {data:single?rows[0]:rows,count};
    }).then(resolve,reject);}};return q;
  };
}
(async()=>{
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+req.url.split('?')[0]);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(file,(e,data)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(data);});});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;let browser;
try{
browser=await playwright.chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext();await context.route('https://**/*',r=>r.fulfill({body:''}));
await context.route('**/js/supabase-client.js',r=>r.fulfill({contentType:'application/javascript',body:'('+mockClient.toString()+')(); const supabaseClient = window.supabaseClient; delete window.supabaseClient; ('+requestsMock.toString()+')('+JSON.stringify(owner)+');'}));
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const go=async file=>{await page.goto(base+'/'+file);if(!file.startsWith('admin'))await page.evaluate(()=>customerAuth.ready);};
const identity=id=>page.evaluate(id=>{localStorage.setItem('test-session',JSON.stringify({id,email:'test@example.com',user_metadata:{full_name:'Test Customer'}}));localStorage.setItem('test-profile',JSON.stringify({id,full_name:'Test Customer',email:'test@example.com',phone:'03001234567'}));},id);
const fill=async()=>{for(const [id,value]of Object.entries({customName:'Test Customer',customEmail:'TEST@EXAMPLE.COM',customPhone:'03001234567',customDetails:'A floral hoop in sage and gold',customDimensions:'12 inches',customPalette:'Sage and gold'}))await page.locator('#'+id).fill(value);await page.locator('label[for=typeHoop]').click();};
const submit=()=>page.locator('#customOrderSubmit').click();const db=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('test-requests')||'[]'));
await go('custom-order.html');await page.evaluate(()=>localStorage.setItem('shah_custom_order_requests','legacy untouched'));await fill();
await page.locator('#customReferenceImages').setInputFiles({name:'reference.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6L8AAAAASUVORK5CYII=','base64')});
await page.evaluate(()=>fixture.mode='upload');await submit();await page.waitForFunction(()=>document.querySelector('#customOrderPageForm').dataset.busy==='false');assert.equal((await db()).length,0);assert.equal(await page.locator('#customDetails').inputValue(),'A floral hoop in sage and gold');
await page.evaluate(()=>fixture.mode='insert');await submit();await page.waitForFunction(()=>document.querySelector('#customOrderPageForm').dataset.busy==='false');assert.equal((await db()).length,0);assert.equal(await page.evaluate(()=>fixture.uploads),2);
await page.evaluate(()=>fixture.mode='');await submit();await page.locator('#customOrderPageForm').dispatchEvent('submit');await page.locator('#customOrderSuccess.visible').waitFor();
let rows=await db();assert.equal(rows.length,1);assert.equal(rows[0].user_id,null);assert.equal(rows[0].guest_email,'test@example.com');assert.equal(rows[0].reference_image_urls.length,1);assert.equal(await page.evaluate(()=>fixture.uploads),2);assert.equal(await page.locator('#customDetails').inputValue(),'');
console.log('PASS: guest insert without SELECT, inline success, upload-before-insert, upload/insert failure retention, cached upload retry and duplicate-submit protection');
for(const id of[a,b]){await identity(id);await go('custom-order.html');await fill();await submit();await page.waitForURL('**/profile.html#custom-orders');await page.locator('.custom-request-card').waitFor();assert.equal(await page.locator('.custom-request-card').count(),1);assert.equal(await page.locator('.order-status-badge').textContent(),'Inquiry Received');}
assert.equal((await db()).length,3);assert.equal(await page.evaluate(()=>localStorage.getItem('shah_custom_order_requests')),'legacy untouched');
await page.evaluate(()=>fixture.mode='read');await page.locator('[data-section="custom-orders"]').click();await page.locator('#retryCustomOrders').waitFor();await page.evaluate(()=>fixture.mode='');await page.locator('#retryCustomOrders').click();await page.locator('.custom-request-card').waitFor();
await identity(owner);await go('admin.html');await page.locator('#customOrderStatus-0').waitFor();assert.equal(await page.locator('.custom-order-status-save').count(),3);await page.locator('.custom-order-details-toggle').last().click();assert.match(await page.locator('#adminCustomOrderDetails-2').innerText(),/Guest/);assert.equal(await page.locator('#adminCustomOrderDetails-2 img').count(),1);
await page.locator('#customOrderStatus-0').selectOption('Ready for Review');await page.locator('.custom-order-status-save').first().click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('test-requests'))[2].status==='Ready for Review');
await identity(b);await go('profile.html#custom-orders');await page.locator('.custom-request-card').waitFor();assert.equal(await page.locator('.order-status-badge').textContent(),'Ready for Review');assert.equal(await page.locator('.progress-step.complete').count(),3);
for(const width of[1440,1024,900,768,480,393,360]){await page.setViewportSize({width,height:850});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
await identity(owner);await go('admin.html');await page.locator('#customOrderStatus-0').waitFor();
await page.evaluate(()=>{const db=JSON.parse(localStorage.getItem('test-requests'));for(let i=0;i<24;i++)db.push({...db[0],id:crypto.randomUUID()});db[0].reference_image_urls=['javascript:alert(1)'];localStorage.setItem('test-requests',JSON.stringify(db));});await page.locator('#refreshCustomOrders').click();await page.waitForFunction(()=>document.querySelectorAll('.custom-order-status-save').length===25);await page.locator('#nextCustomOrdersPage').click();await page.waitForFunction(()=>document.querySelectorAll('.custom-order-status-save').length===2);assert.equal(await page.locator('#customOrdersBody a[href^="javascript:"]').count(),0);
assert.deepEqual(errors,[]);console.log('PASS: two customer histories, ignored legacy data, retry state, owner sees customers and guest/images, persisted status/3-step progress, pagination, URL safety and responsive profile');
}finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
