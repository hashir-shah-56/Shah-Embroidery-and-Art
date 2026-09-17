// Executes the owner's supplied schema/policies in local PostgreSQL, never the remote project.
const assert = require('node:assert/strict');
const path = require('node:path');
const { PGlite } = require(process.env.PGLITE_MODULE || path.join(require('node:os').tmpdir(), 'shah-profile-sql-tests/node_modules/@electric-sql/pglite'));
(async () => {
  const db = new PGlite();
  const a = '11111111-1111-4111-8111-111111111111', b = '22222222-2222-4222-8222-222222222222', owner = 'a8dbfb82-d3df-421c-acf1-194335507e80';
  const asUser = id => db.exec(`reset role; set role ${id ? 'authenticated' : 'anon'}; select set_config('request.jwt.claim.sub','${id || ''}',false);`);
  const insert = (id, returning = false) => db.query(`insert into custom_order_requests(user_id,guest_email,full_name,email,order_type,description,reference_image_urls) values($1,$2,'Customer','test@example.com','Hoop Art','Sage and gold flowers',array['https://example.com/reference.png']) ${returning ? 'returning *' : ''}`, [id, id ? null : 'test@example.com']);
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      grant usage on schema auth to anon,authenticated;
      insert into auth.users values('${a}'),('${b}'),('${owner}');
      create table custom_order_requests (
        id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade,
        guest_email text, full_name text not null, email text not null, phone text, order_type text not null,
        dimensions text, color_palette text, occasion text, description text not null, budget_range text, timeline text,
        specific_date date, reference_image_urls text[], status text not null default 'Inquiry Received',
        created_at timestamptz not null default now(), updated_at timestamptz not null default now());
      alter table custom_order_requests enable row level security;
      -- Model API table privileges separately from the supplied row policies.
      grant select,insert,update on custom_order_requests to anon,authenticated;
      create policy customer_custom_orders_select on custom_order_requests for select to authenticated using(auth.uid()=user_id);
      create policy customer_custom_orders_insert on custom_order_requests for insert to authenticated with check(auth.uid()=user_id);
      create policy guest_custom_orders_insert on custom_order_requests for insert to anon with check(user_id is null);
      create policy admin_custom_orders_select_all on custom_order_requests for select to authenticated using(auth.uid()='${owner}'::uuid);
      create policy admin_custom_orders_update on custom_order_requests for update to authenticated using(auth.uid()='${owner}'::uuid) with check(auth.uid()='${owner}'::uuid);`);
    await asUser(null); await insert(null);
    assert.equal((await db.query('select * from custom_order_requests')).rows.length,0);
    await assert.rejects(insert(null,true),/row-level security/);
    await assert.rejects(insert(a),/row-level security/);
    await asUser(a); const first=(await insert(a,true)).rows[0];
    assert.equal(first.status,'Inquiry Received'); assert.equal(first.reference_image_urls.length,1);
    await assert.rejects(insert(b),/row-level security/);
    await asUser(b); const second=(await insert(b,true)).rows[0];
    assert.equal((await db.query('select * from custom_order_requests')).rows.length,1);
    assert.equal((await db.query('select * from custom_order_requests where id=$1',[first.id])).rows.length,0);
    assert.equal((await db.query("update custom_order_requests set status='Completed' returning *")).rows.length,0);
    await asUser(owner); assert.equal((await db.query('select * from custom_order_requests')).rows.length,3);
    for(const status of ['In Progress','Ready for Review','Completed']) {
      assert.equal((await db.query('update custom_order_requests set status=$1 where id=$2 returning *',[status,second.id])).rows[0].status,status);
    }
    await asUser(b); assert.equal((await db.query('select status from custom_order_requests')).rows[0].status,'Completed');
    await asUser(null); assert.equal((await db.query("update custom_order_requests set status='Completed' returning *")).rows.length,0);
    console.log('PASS: guest INSERT without RETURNING, guest read/ownership denial, two-customer isolation, customer update denial, owner sees all three and persists every stage');
  } finally { await db.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
