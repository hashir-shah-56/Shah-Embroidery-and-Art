const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { mockClient } = require('./customer-auth-browser.cjs');
let playwright;
try { playwright = require('playwright'); } catch { playwright = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/HP/.agents/skills/gstack/node_modules/playwright'); }
const root = path.resolve(__dirname, '..');
const cart = [{title:'Summary Test',price:'Rs. 1,250',numericPrice:1250,quantity:2,img:'Images/Logo.png',category:'Embroidery'}];
(async () => {
  const server = http.createServer((req,res) => {
    const file=path.resolve(root,'.'+req.url.split('?')[0]);
    if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
    fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(data);});
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  let browser;
  try {
    browser=await playwright.chromium.launch({channel:'chrome',headless:true});
    const observations=[];
    for(const slow of [false,true]) for(const flow of ['signup','login','direct']) {
      const context=await browser.newContext();
      await context.route('https://**/*',r=>r.fulfill({body:''}));
      await context.route('**/js/supabase-client.js',r=>r.fulfill({contentType:'application/javascript',body:`(${mockClient.toString()})();
        const supabaseClient=window.supabaseClient;
        window.testProfileDelay=${slow?700:0};
        for(const method of ['getSession','getUser','signUp','signInWithPassword']) {
          const original=supabaseClient.auth[method];
          supabaseClient.auth[method]=async (...args)=>{await new Promise(r=>setTimeout(r,${slow?400:0}));return original(...args);};
        }`}));
      await context.addInitScript(()=>{
        window.summaryFrames=[];
        const observe=()=>{
          const checkout=document.getElementById('checkoutPage');
          if(checkout && !checkout.hidden) window.summaryFrames.push({
            items:document.querySelectorAll('.checkout-summary-item').length,
            subtotal:document.getElementById('checkoutSubtotal')?.textContent,
            total:document.getElementById('checkoutGrandTotal')?.textContent,
            cart:localStorage.getItem('shah_cart')
          });
          requestAnimationFrame(observe);
        };
        requestAnimationFrame(observe);
      });
      const page=await context.newPage(), errors=[];page.on('pageerror',e=>errors.push(e.message));
      if(slow){const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:100000,uploadThroughput:50000});}
      const base='http://127.0.0.1:'+server.address().port;
      await page.goto(base+'/cart.html');await page.evaluate(()=>customerAuth.ready);
      await page.evaluate(({cart,flow})=>{
        localStorage.setItem('shah_cart',JSON.stringify(cart));
        localStorage.setItem('pendingCheckoutFormData',JSON.stringify({checkoutName:'Typed Customer',checkoutCity:'Lahore',checkoutCountry:'Pakistan'}));
        if(flow==='direct')localStorage.setItem('test-session',JSON.stringify({id:'11111111-1111-4111-8111-111111111111',email:'test@example.com',user_metadata:{full_name:'Test Customer'}}));
      },{cart,flow});
      await page.reload();await page.evaluate(()=>customerAuth.ready);
      await page.getByRole('button', {name:'Proceed to Checkout'}).click();
      if(flow!=='direct'){
        await page.locator('#authModal.active').waitFor();
        if(flow==='signup'){
          await page.locator('#authToggleButton').click();
          for(const [id,value]of Object.entries({signupName:'Test Customer',signupEmail:'test@example.com',signupPassword:'StrongPass1',signupConfirmPassword:'StrongPass1'}))await page.locator('#'+id).fill(value);
          await page.locator('#signupForm [type=submit]').click();
        }else{
          await page.locator('#loginEmail').fill('test@example.com');await page.locator('#loginPassword').fill('StrongPass1');await page.locator('#loginForm [type=submit]').click();
        }
      }
      await page.waitForURL('**/checkout.html');
      await page.waitForFunction(()=>document.querySelectorAll('.checkout-summary-item').length===1 && window.summaryFrames.length>2);
      const frames=await page.evaluate(()=>window.summaryFrames);
      const bad=frames.filter(frame=>frame.items!==1||frame.subtotal!=='Rs. 2,500'||frame.total!=='Rs. 2,500');
      observations.push({flow,slow,badFrames:bad.length,first:frames[0]});
      console.log(`${flow}, slow=${slow}: ${bad.length} blank/incorrect visible frames`);
      assert.equal(await page.evaluate(()=>localStorage.getItem('shah_cart')),JSON.stringify(cart));
      assert.equal(await page.locator('#checkoutName').inputValue(),'Typed Customer');
      assert.deepEqual(errors,[]);
      await context.close();
    }
    console.log(JSON.stringify(observations,null,2));
    assert.ok(observations.every(result=>result.badFrames===0),'Visible checkout frames must contain real items and totals');
  }finally{await browser?.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
