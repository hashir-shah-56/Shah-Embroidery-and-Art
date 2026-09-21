const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {mockClient}=require('./customer-auth-browser.cjs');
let playwright;try{playwright=require('playwright');}catch{playwright=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/HP/.agents/skills/gstack/node_modules/playwright');}
const root=path.resolve(__dirname,'..');
function wishlistMock(){
  const original=supabaseClient.from;window.wishlistReads=0;
  supabaseClient.from=table=>{
    if(!['products','wishlist_items'].includes(table))return original(table);
    let action='read',cols='',payload,filters=[];
    const q={select(v){cols=v;return this;},eq(k,v){filters.push([k,String(v)]);return this;},not(){return this;},order(){return this;},range(){return this;},limit(){return this;},insert(v){action='insert';payload=v;return this;},delete(){action='delete';return this;},then(resolve,reject){return Promise.resolve().then(async()=>{
      const product={id:12,title:'Current Artwork',category:'Floral',price:Number(localStorage.getItem('test-price')||1250),in_stock:true,image_url:location.origin+'/Images/Logo.png'};
      if(table==='products')return {data:[product],count:1};
      if(action==='read')window.wishlistReads++;
      await new Promise(r=>setTimeout(r,80));
      const user=JSON.parse(localStorage.getItem('test-session')||'null');
      if(!user||localStorage.getItem('test-wishlist-failure')===action)return {error:{code:'42501'}};
      let rows=JSON.parse(localStorage.getItem('test-wishlist-db')||'[]');
      const match=row=>row.user_id===user.id&&filters.every(([k,v])=>String(row[k])===v);
      if(action==='insert'){
        if(payload.user_id!==user.id)return {error:{code:'42501'}};
        if(rows.some(row=>row.user_id===user.id&&String(row.product_id)===String(payload.product_id)))return {error:{code:'23505'}};
        rows.push(payload);localStorage.setItem('test-wishlist-db',JSON.stringify(rows));return {};
      }
      if(action==='delete'){rows=rows.filter(row=>!match(row));localStorage.setItem('test-wishlist-db',JSON.stringify(rows));return {};}
      return {data:rows.filter(match).map(row=>cols.includes('products')?{...row,products:product}:row)};
    }).then(resolve,reject);}};return q;
  };
}
(async()=>{
 const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+req.url.split('?')[0]);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(data);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await playwright.chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext();
  await context.route('https://**/*',r=>r.fulfill({body:''}));
  await context.route('**/js/supabase-client.js',r=>r.fulfill({contentType:'application/javascript',body:`(${mockClient.toString()})();const supabaseClient=window.supabaseClient;(${wishlistMock.toString()})();`}));
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));const base='http://127.0.0.1:'+server.address().port;
  const go=async file=>{await page.goto(base+'/'+file);await page.evaluate(()=>customerAuth.ready);};
  const heart=()=>page.locator('.artwork-card[data-product-id="12"] .wishlist-toggle-btn').first();
  const db=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('test-wishlist-db')||'[]'));
  await go('shop.html');await heart().waitFor();assert.equal(await page.evaluate(()=>wishlistReads),0);
  await page.evaluate(()=>{localStorage.setItem('shah_wishlist','legacy untouched');localStorage.setItem('shah_cart','[]');});
  await heart().click();await page.locator('#authModal.active').waitFor();assert.match(await page.locator('#authModal').innerText(),/Please sign in to save items to your wishlist/i);
  await page.locator('#loginEmail').fill('test@example.com');await page.locator('#loginPassword').fill('StrongPass1');await page.locator('#loginForm [type=submit]').click();await page.waitForURL('**/profile.html');assert.equal((await db()).length,0);
  await go('shop.html');await heart().waitFor();await page.waitForFunction(()=>wishlistReads===1);await page.evaluate(()=>refreshDynamicProductBindings());await heart().click();await page.waitForFunction(()=>document.querySelector('.wishlist-toggle-btn.active'));
  assert.equal((await db()).length,1);assert.equal(await page.evaluate(()=>wishlistReads),1);assert.equal(await page.locator('#quickViewModal.active').count(),0);
  for(const file of ['index.html','shop.html']){await go(file);await page.locator('.artwork-card[data-product-id="12"] .wishlist-toggle-btn.active').waitFor();assert.equal(await page.evaluate(()=>wishlistReads),1);}
  await page.evaluate(()=>localStorage.setItem('test-wishlist-failure','delete'));await heart().click();await page.waitForFunction(()=>!document.querySelector('.wishlist-toggle-btn').disabled);assert.equal(await heart().getAttribute('aria-pressed'),'true');assert.equal((await db()).length,1);
  await page.evaluate(()=>{localStorage.removeItem('test-wishlist-failure');localStorage.setItem('test-price','2750');});
  await go('profile.html');await page.locator('[data-section=wishlist]').click();await page.locator('.account-wishlist-item').waitFor();assert.match(await page.locator('.account-wishlist-item .artwork-price').textContent(),/2,750/);
  await page.locator('.move-to-cart').click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('shah_cart'))[0].numericPrice),2750);
  await page.locator('.remove-wishlist-item').click();await page.getByText('Your wishlist is empty',{exact:true}).waitFor();assert.equal((await db()).length,0);
  await go('shop.html');await heart().waitFor();assert.equal(await heart().getAttribute('aria-pressed'),'false');
  // Simulate another tab inserting after the cached ID list was loaded.
  await page.waitForFunction(()=>wishlistReads===1);await page.evaluate(()=>localStorage.setItem('test-wishlist-db',JSON.stringify([{user_id:JSON.parse(localStorage.getItem('test-session')).id,product_id:12}])));
  await heart().click();await page.waitForFunction(()=>document.querySelector('.wishlist-toggle-btn.active'));assert.equal((await db()).length,1);
  await page.evaluate(()=>localStorage.setItem('test-session',JSON.stringify({id:'22222222-2222-4222-8222-222222222222',email:'second@example.com',user_metadata:{full_name:'Second Customer'}})));
  await go('shop.html');await heart().waitFor();await page.waitForFunction(()=>wishlistReads===1);assert.equal(await heart().getAttribute('aria-pressed'),'false');await heart().click();await page.waitForFunction(()=>document.querySelector('.wishlist-toggle-btn.active'));assert.equal((await db()).length,2);
  await go('profile.html');await page.evaluate(()=>localStorage.setItem('test-wishlist-failure','read'));await page.locator('[data-section=wishlist]').click();await page.locator('#retryWishlist').waitFor();await page.evaluate(()=>localStorage.removeItem('test-wishlist-failure'));await page.locator('#retryWishlist').click();await page.locator('.account-wishlist-item').waitFor();assert.equal(await page.locator('.account-wishlist-item').count(),1);
  assert.equal(await page.evaluate(()=>localStorage.getItem('shah_wishlist')),'legacy untouched');assert.deepEqual(errors,[]);
  console.log('PASS: guest gate/no auto-add, shared ID query, persistence, current-price cart add, profile remove, duplicate race, failed delete rollback, second customer isolation, query retry and ignored legacy data');
 }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
