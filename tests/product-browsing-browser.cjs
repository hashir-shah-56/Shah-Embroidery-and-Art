const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {mockClient} = require('./customer-auth-browser.cjs');
let playwright;
try { playwright=require('playwright'); } catch { playwright=require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/HP/.agents/skills/gstack/node_modules/playwright'); }
const root=path.resolve(__dirname,'..');
const estimate='Estimated delivery: 5-7 business days within Pakistan';
function products(){
  const original=supabaseClient.from;
  supabaseClient.from=table=>{
    if(table!=='products')return original(table);
    const q={select(){return this;},eq(){return this;},not(){return this;},order(){return this;},limit(){return this;},range(){return this;},then(resolve,reject){return Promise.resolve({data:[{id:1,title:'Test Embroidery',category:'Floral',price:1250,in_stock:true,image_url:location.origin+'/Images/Logo.png',description:'A floral test piece'}],count:1,error:null}).then(resolve,reject);}};return q;
  };
}
(async()=>{
  const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+req.url.split('?')[0]);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(data);});});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  try{
    browser=await playwright.chromium.launch({channel:'chrome',headless:true});
    for(const touch of [false,true]){
      const context=await browser.newContext({viewport:{width:touch?393:1440,height:900},hasTouch:touch,isMobile:touch});
      await context.route('https://**/*',r=>r.fulfill({body:''}));
      await context.route('**/js/supabase-client.js',r=>r.fulfill({contentType:'application/javascript',body:`(${mockClient.toString()})();const supabaseClient=window.supabaseClient;(${products.toString()})();`}));
      const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
      const base='http://127.0.0.1:'+server.address().port;
      const activate=locator=>touch?locator.tap():locator.click();
      for(const file of ['index.html','shop.html']){
        await page.goto(base+'/'+file);await page.evaluate(()=>customerAuth.ready);
        const card=page.locator('.artwork-card[data-product-id="1"]').first();await card.waitFor();
        await page.evaluate(()=>localStorage.removeItem('shah_cart'));
        for(const selector of ['.artwork-img','.artwork-title','.artwork-quick-view-btn']){
          await activate(card.locator(selector));await page.locator('#quickViewModal.active').waitFor();
          assert.equal(await page.locator('#quickViewTitle').textContent(),'Test Embroidery');
          assert.equal(await page.locator('#quickViewModal .delivery-estimate').textContent(),estimate);
          assert.equal(await page.evaluate(()=>localStorage.getItem('shah_cart')),null);
          await activate(page.locator('#quickViewClose'));
        }
        if(!touch){await card.locator('.artwork-title').focus();await page.keyboard.press('Enter');await page.locator('#quickViewModal.active').waitFor();await page.locator('#quickViewClose').click();}
        await activate(card.locator('.artwork-detail-btn'));
        assert.equal(await page.locator('#quickViewModal.active').count(),0);
        assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('shah_cart'))[0].quantity),1);
      }
      await page.goto(base+'/cart.html');await page.locator('.cart-summary-card').waitFor();assert.equal(await page.locator('.cart-summary-card .delivery-estimate').textContent(),estimate);
      await page.evaluate(()=>localStorage.setItem('test-session',JSON.stringify({id:'11111111-1111-4111-8111-111111111111',email:'test@example.com',user_metadata:{full_name:'Test Customer'}})));
      await page.goto(base+'/checkout.html');await page.locator('.checkout-summary-item').waitFor();
      const line=page.locator('#checkoutDeliveryEstimate');assert.equal(await line.textContent(),estimate);assert.equal(await line.isVisible(),true);
      await page.locator('#checkoutCountry').selectOption({label:'Other'});assert.equal(await line.isVisible(),false);assert.equal(await page.locator('#checkoutShippingLabel').textContent(),'Confirmed separately');
      await page.locator('#checkoutCountry').selectOption('Pakistan');assert.equal(await line.isVisible(),true);
      assert.deepEqual(errors,[]);await context.close();console.log('PASS: '+(touch?'single-tap mobile':'desktop/keyboard')+' image/title/button Quick View, isolated + cart action, consistent delivery and international hiding');
    }
  }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
