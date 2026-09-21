// Local PostgreSQL verification of the owner's supplied wishlist schema/RLS.
const assert=require('node:assert/strict'),path=require('node:path');
const {PGlite}=require(process.env.PGLITE_MODULE||path.join(require('node:os').tmpdir(),'shah-profile-sql-tests/node_modules/@electric-sql/pglite'));
(async()=>{
 const db=new PGlite(),a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222';
 const asUser=id=>db.exec(`reset role;set role ${id?'authenticated':'anon'};select set_config('request.jwt.claim.sub','${id||''}',false)`);
 try{
  await db.exec(`create role anon;create role authenticated;create schema auth;
   create table auth.users(id uuid primary key);
   create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
   grant usage on schema auth to anon,authenticated;
   insert into auth.users values('${a}'),('${b}');
   create table public.products(id bigint primary key);insert into products values(12);
   create table public.wishlist_items(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,product_id bigint not null references public.products(id) on delete cascade,created_at timestamptz not null default now(),unique(user_id,product_id));
   alter table public.wishlist_items enable row level security;
   create policy customer_wishlist_select on wishlist_items for select to authenticated using(auth.uid()=user_id);
   create policy customer_wishlist_insert on wishlist_items for insert to authenticated with check(auth.uid()=user_id);
   create policy customer_wishlist_delete on wishlist_items for delete to authenticated using(auth.uid()=user_id);
   grant select,insert,delete on wishlist_items to anon,authenticated;`);
  await asUser(a);await db.exec(`insert into wishlist_items(user_id,product_id) values('${a}',12)`);
  await assert.rejects(db.exec(`insert into wishlist_items(user_id,product_id) values('${a}',12)`),e=>e.code==='23505');
  await assert.rejects(db.exec(`insert into wishlist_items(user_id,product_id) values('${b}',12)`),e=>e.code==='42501');
  await asUser(b);assert.equal((await db.query('select * from wishlist_items')).rows.length,0);
  assert.equal((await db.query(`delete from wishlist_items where user_id='${a}' returning *`)).rows.length,0);
  await db.exec(`insert into wishlist_items(user_id,product_id) values('${b}',12)`);
  assert.equal((await db.query('select * from wishlist_items')).rows.length,1);
  await asUser(null);assert.equal((await db.query('select * from wishlist_items')).rows.length,0);
  await assert.rejects(db.exec(`insert into wishlist_items(user_id,product_id) values('${a}',12)`),e=>e.code==='42501');
  await db.exec('reset role;delete from products where id=12');
  assert.equal((await db.query('select * from wishlist_items')).rows.length,0);
  console.log('PASS: own-row access, foreign insert/delete denial, guest denial, unique pair, and product deletion cascade for both users');
 }finally{await db.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
