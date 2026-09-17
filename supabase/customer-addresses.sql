-- Run in this project's Supabase SQL Editor. Safe to rerun; preserves address rows.
-- Creating this file does not apply it remotely. No product/admin/profile policies change.
begin;
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text check (char_length(label) <= 40),
  full_name text not null check (char_length(btrim(full_name)) between 2 and 150),
  phone text not null check (phone ~ '^[+0-9 ().-]+$' and char_length(regexp_replace(phone, '[^0-9]', '', 'g')) between 10 and 15),
  address_line_1 text not null check (char_length(btrim(address_line_1)) between 5 and 500),
  address_line_2 text check (char_length(address_line_2) <= 500),
  city text not null check (char_length(btrim(city)) between 2 and 150),
  state_province text check (char_length(state_province) <= 150),
  postal_code text check (char_length(postal_code) <= 20),
  country text not null check (char_length(btrim(country)) between 2 and 100),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists addresses_owner_updated on public.addresses(user_id, updated_at desc, id);
create unique index if not exists addresses_one_default on public.addresses(user_id) where is_default;
alter table public.addresses enable row level security;
revoke all on public.addresses from anon, authenticated;
grant select, insert, update, delete on public.addresses to authenticated;
drop policy if exists customer_address_select on public.addresses;
create policy customer_address_select on public.addresses for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists customer_address_insert on public.addresses;
create policy customer_address_insert on public.addresses for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists customer_address_update on public.addresses;
create policy customer_address_update on public.addresses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists customer_address_delete on public.addresses;
create policy customer_address_delete on public.addresses for delete to authenticated using ((select auth.uid()) = user_id);
drop policy if exists customer_address_owner_guard on public.addresses;
create policy customer_address_owner_guard on public.addresses as restrictive for all to public
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function public.customer_address_timestamps()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if TG_OP = 'UPDATE' then
    if new.user_id <> old.user_id or new.id <> old.id then raise exception 'Address ownership is immutable'; end if;
    new.created_at := old.created_at;
  end if;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function public.customer_address_timestamps() from public, anon, authenticated;
drop trigger if exists customer_address_timestamps on public.addresses;
create trigger customer_address_timestamps before insert or update on public.addresses
for each row execute function public.customer_address_timestamps();

-- One transaction per edit/default/delete, serialized per customer, including first inserts.
-- Invoker security retains RLS. Ownership comes only from auth.uid(), never JSON or arguments.
create or replace function public.customer_address_mutate(action text, address_id uuid default null, details jsonb default '{}'::jsonb)
returns setof public.addresses language plpgsql security invoker set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
  target_id uuid := address_id;
  make_default boolean;
begin
  if owner_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text, 731));
  if action not in ('save', 'delete', 'default') or action is null then raise exception 'Invalid address action'; end if;
  if target_id is not null then
    perform 1 from public.addresses where id = target_id and user_id = owner_id for update;
    if not found then raise exception 'Address unavailable' using errcode = '42501'; end if;
  elsif action <> 'save' then raise exception 'Address required';
  end if;

  if action = 'save' then
    make_default := coalesce((details->>'is_default')::boolean, false)
      or not exists (select 1 from public.addresses where user_id = owner_id);
    if make_default then
      update public.addresses set is_default = false where user_id = owner_id and is_default;
    end if;
    if target_id is null then
      insert into public.addresses(user_id, label, full_name, phone, address_line_1, address_line_2, city, state_province, postal_code, country, is_default)
      values (owner_id, btrim(details->>'label'), btrim(details->>'full_name'), btrim(details->>'phone'),
        btrim(details->>'address_line_1'), btrim(details->>'address_line_2'), btrim(details->>'city'),
        btrim(details->>'state_province'), btrim(details->>'postal_code'), btrim(details->>'country'), make_default)
      returning id into target_id;
    else
      update public.addresses set label = btrim(details->>'label'), full_name = btrim(details->>'full_name'),
        phone = btrim(details->>'phone'), address_line_1 = btrim(details->>'address_line_1'),
        address_line_2 = btrim(details->>'address_line_2'), city = btrim(details->>'city'),
        state_province = btrim(details->>'state_province'), postal_code = btrim(details->>'postal_code'),
        country = btrim(details->>'country'), is_default = make_default
      where id = target_id and user_id = owner_id;
    end if;
  elsif action = 'default' then
    update public.addresses set is_default = false where user_id = owner_id and is_default and id <> target_id;
    update public.addresses set is_default = true where user_id = owner_id and id = target_id;
  else
    delete from public.addresses where id = target_id and user_id = owner_id;
  end if;

  -- After deleting/unchecking the default, prefer the most recently updated other address.
  if not exists (select 1 from public.addresses where user_id = owner_id and is_default) then
    update public.addresses set is_default = true where id = (
      select id from public.addresses where user_id = owner_id
      order by (id = target_id), updated_at desc, id limit 1
    ) and user_id = owner_id;
  end if;
  return query select * from public.addresses where user_id = owner_id order by is_default desc, updated_at desc, id;
end;
$$;
revoke all on function public.customer_address_mutate(text, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.customer_address_mutate(text, uuid, jsonb) to authenticated;
commit;
