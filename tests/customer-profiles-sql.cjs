// Run with PGLITE_MODULE pointing to a test-only @electric-sql/pglite installation.
// Executes the actual setup SQL in local PostgreSQL; never contacts Supabase.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require(process.env.PGLITE_MODULE || path.join(require('node:os').tmpdir(), 'shah-profile-sql-tests/node_modules/@electric-sql/pglite'));
(async () => {
  const db = new PGlite();
  const a = '11111111-1111-4111-8111-111111111111';
  const b = '22222222-2222-4222-8222-222222222222';
  try {
    await db.exec(`create role anon; create role authenticated;
      create schema auth;
      create table auth.users (id uuid primary key, email text);
      create function auth.uid() returns uuid language sql stable as
      $$select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid$$;
      grant usage on schema auth to anon, authenticated;
      insert into auth.users values ('${a}', 'a@example.com'), ('${b}', 'b@example.com');`);
    const setup = fs.readFileSync(path.join(__dirname, '../supabase/customer-auth.sql'), 'utf8');
    await db.exec(setup);
    await db.exec(`insert into public.profiles (id,full_name) values ('${b}', 'Customer B');
      create policy preexisting_broad_access on public.profiles for all to authenticated using (true) with check (true);`);
    await db.exec(setup);
    assert.equal((await db.query('select count(*)::int as count from public.profiles')).rows[0].count, 1);
    assert.equal((await db.query("select relrowsecurity from pg_class where oid = 'public.profiles'::regclass")).rows[0].relrowsecurity, true);
    console.log('PASS: setup reruns without losing data; RLS enabled');
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${a}', false);`);
    const inserted = await db.query(`insert into public.profiles (id,full_name,email,phone) values ($1,'Customer A','spoof@example.com','+92 300 1234567') returning *`, [a]);
    assert.equal(inserted.rows[0].email, 'a@example.com');
    const updated = await db.query("update public.profiles set full_name = 'Updated Customer', created_at = '2000-01-01' where id = $1 returning *", [a]);
    assert.equal(updated.rows[0].full_name, 'Updated Customer');
    assert.equal(String(updated.rows[0].created_at), String(inserted.rows[0].created_at));
    assert.ok(updated.rows[0].updated_at);
    assert.equal((await db.query('select * from public.profiles where id = $1', [b])).rows.length, 0);
    assert.equal((await db.query("update public.profiles set full_name = 'Intruder' where id = $1 returning id", [b])).rows.length, 0);
    await assert.rejects(db.query('update public.profiles set id = $1 where id = $2', [b, a]), /row-level security/);
    await assert.rejects(db.query('insert into public.profiles (id) values ($1)', [b]), /row-level security/);
    await assert.rejects(db.query('delete from public.profiles where id = $1', [a]), /permission denied/);
    console.log('PASS: own-row SELECT/INSERT/UPDATE; foreign reads/writes, ID impersonation and DELETE denied despite broad policy');
    await db.exec(`reset role; update auth.users set email = 'changed@example.com' where id = '${a}';
      set role authenticated;`);
    assert.equal((await db.query("update public.profiles set email = 'anything@example.com' where id = $1 returning email", [a])).rows[0].email, 'changed@example.com');
    await db.exec("reset role; set role anon; select set_config('request.jwt.claim.sub', '', false);");
    await assert.rejects(db.query('select * from public.profiles'), /permission denied/);
    await assert.rejects(db.query('insert into public.profiles (id) values ($1)', [a]), /permission denied/);
    console.log('PASS: email mirrors Auth; anonymous reads/writes denied');
  } finally { await db.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
