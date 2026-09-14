-- Run in Supabase SQL Editor. This file alone does not apply remote changes.
begin;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;

drop policy if exists customer_profile_select on public.profiles;
create policy customer_profile_select on public.profiles for select to authenticated
using ((select auth.uid()) = id);
drop policy if exists customer_profile_insert on public.profiles;
create policy customer_profile_insert on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);
drop policy if exists customer_profile_update on public.profiles;
create policy customer_profile_update on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
-- Also constrain any pre-existing permissive policies on this table.
drop policy if exists customer_profile_owner_guard on public.profiles;
create policy customer_profile_owner_guard on public.profiles as restrictive for all to public
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create or replace function public.customer_profile_defaults()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- Profile email is a mirror, never an independent identity claim.
  select lower(email) into new.email from auth.users where id = new.id;
  new.updated_at := now();
  if TG_OP = 'UPDATE' then new.created_at := old.created_at; end if;
  return new;
end;
$$;
revoke all on function public.customer_profile_defaults() from public;
drop trigger if exists customer_profile_defaults on public.profiles;
create trigger customer_profile_defaults before insert or update on public.profiles
for each row execute function public.customer_profile_defaults();
-- No auth.users signup trigger: profile failures cannot prevent registration.
commit;
