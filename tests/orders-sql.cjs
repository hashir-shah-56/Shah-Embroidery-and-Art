// Local PostgreSQL enforcement against the owner's supplied schema/policies, then the supplement.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require(process.env.PGLITE_MODULE || path.join(require('node:os').tmpdir(), 'shah-profile-sql-tests/node_modules/@electric-sql/pglite'));
(async () => {
  const db = new PGlite();
  const a = '11111111-1111-4111-8111-111111111111', b = '22222222-2222-4222-8222-222222222222';
  const owner = 'a8dbfb82-d3df-421c-acf1-194335507e80';
  const asUser = id => db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${id}',false)`);
  const insert = (user, number) => db.query(`insert into orders(user_id,order_number,payment_method,shipping_name,shipping_phone,shipping_email,shipping_address,shipping_city) values ($1,$2,'cod','Test Customer','03001234567','test@example.com','12 Main Road','Lahore') returning *`, [user, number]);
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      grant usage on schema auth to anon,authenticated;
      insert into auth.users values ('${a}'),('${b}'),('${owner}');
      create table products(id bigint primary key);
      create table orders(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
        order_number text not null unique,status text not null default 'Processing',payment_method text not null,
        subtotal numeric not null default 0,shipping_cost numeric not null default 0,total numeric not null default 0,
        shipping_name text not null,shipping_phone text not null,shipping_email text not null,shipping_address text not null,
        shipping_city text not null,shipping_postal text,shipping_country text not null default 'Pakistan',
        created_at timestamptz not null default now(),updated_at timestamptz not null default now());
      create table order_items(id uuid primary key default gen_random_uuid(),order_id uuid not null references orders(id) on delete cascade,
        product_id bigint references products(id) on delete set null,title text not null,category text,price numeric,
        is_custom_quote boolean default false,quantity integer not null default 1,image_url text,created_at timestamptz not null default now());
      alter table orders enable row level security; alter table order_items enable row level security;
      grant select,insert,update on orders to authenticated; grant select,insert on order_items to authenticated;
      create policy customer_orders_select on orders for select to authenticated using(auth.uid()=user_id);
      create policy customer_orders_insert on orders for insert to authenticated with check(auth.uid()=user_id);
      create policy customer_order_items_select on order_items for select to authenticated using(exists(select 1 from orders where orders.id=order_items.order_id and orders.user_id=auth.uid()));
      create policy customer_order_items_insert on order_items for insert to authenticated with check(exists(select 1 from orders where orders.id=order_items.order_id and orders.user_id=auth.uid()));
      create policy admin_orders_select_all on orders for select to authenticated using(auth.uid()='${owner}'::uuid);
      create policy admin_orders_update on orders for update to authenticated using(auth.uid()='${owner}'::uuid) with check(auth.uid()='${owner}'::uuid);
      create policy admin_order_items_select_all on order_items for select to authenticated using(auth.uid()='${owner}'::uuid);`);
    await asUser(a); const first = (await insert(a, 'SE-10001')).rows[0];
    assert.equal((await db.query("update orders set status='Cancelled' returning *")).rows.length, 0, 'original policies cannot cancel');
    await asUser(b); const second = (await insert(b, 'SE-10002')).rows[0];
    await db.query("insert into order_items(order_id,title,price,quantity) values($1,'Second art',1200,2)", [second.id]);
    await db.exec('reset role');
    const sql = fs.readFileSync(path.join(__dirname, '../supabase/order-cancellation.sql'), 'utf8');
    await db.exec(sql); await db.exec(sql);
    assert.equal((await db.query("select count(*)::int n from pg_class where oid in ('orders'::regclass,'order_items'::regclass) and relrowsecurity")).rows[0].n, 2);
    await asUser(a);
    assert.deepEqual((await db.query('select id from orders')).rows.map(row => row.id), [first.id]);
    assert.equal((await db.query('select * from order_items')).rows.length, 0);
    await assert.rejects(insert(b, 'SE-10003'), /row-level security/);
    await assert.rejects(db.query("insert into order_items(order_id,title) values($1,'Intruder')", [second.id]), /row-level security/);
    assert.equal((await db.query("update orders set status='Cancelled' where id=$1 returning *", [second.id])).rows.length, 0);
    for (const assignment of ["total=1", "shipping_address='Changed'", `user_id='${b}'`, "order_number='SE-99999'", "created_at=now()+interval '1 day'"]) {
      await assert.rejects(db.query(`update orders set status='Cancelled',${assignment} where id=$1`, [first.id]), /Only cancellation/);
    }
    await assert.rejects(db.query("update orders set status='Shipped' where id=$1", [first.id]), /Only cancellation/);
    const cancelled = (await db.query("update orders set status='Cancelled' where id=$1 and user_id=$2 and status='Processing' returning *", [first.id,a])).rows[0];
    assert.equal(cancelled.status, 'Cancelled'); assert(cancelled.updated_at >= first.updated_at);
    assert.equal((await db.query("update orders set status='Processing' where id=$1 returning *", [first.id])).rows.length, 0);
    await asUser(owner); assert.equal((await db.query('select * from orders')).rows.length, 2);
    assert.equal((await db.query('select * from order_items')).rows.length, 1);
    for (const status of ['Shipped','Delivered','Cancelled']) assert.equal((await db.query('update orders set status=$1 where id=$2 returning *',[status,second.id])).rows[0].status,status);
    await db.exec("reset role; set role anon; select set_config('request.jwt.claim.sub','',false)");
    await assert.rejects(db.query('select * from orders'), /permission denied/);
    await assert.rejects(db.query('select * from order_items'), /permission denied/);
    console.log('PASS: rerun preserves rows; own-order/item RLS; foreign read/insert/update denial; cancellation-only columns/status; owner sees both customers and changes status; anonymous denial');
  } finally { await db.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
