-- Apply after the existing orders/order_items schema supplied by the owner.
-- Safe to rerun. This file does not apply remote changes or modify product/address policies.
begin;
grant select, insert, update on public.orders to authenticated;
grant select, insert on public.order_items to authenticated;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists customer_orders_cancel on public.orders;
create policy customer_orders_cancel on public.orders for update to authenticated
using ((select auth.uid()) = user_id and status = 'Processing')
with check ((select auth.uid()) = user_id and status = 'Cancelled');

-- UPDATE policies alone cannot restrict which columns changed.
create or replace function public.guard_order_update()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  -- Preserve trusted SQL Editor/server maintenance; browser callers use authenticated.
  if current_user not in ('postgres', 'supabase_admin', 'service_role')
     and auth.uid() is distinct from 'a8dbfb82-d3df-421c-acf1-194335507e80'::uuid then
    if auth.uid() is null or auth.uid() <> old.user_id
       or old.status <> 'Processing' or new.status <> 'Cancelled'
       or (to_jsonb(new) - 'status' - 'updated_at') <> (to_jsonb(old) - 'status' - 'updated_at') then
      raise exception 'Only cancellation of your processing order is allowed' using errcode = '42501';
    end if;
  end if;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function public.guard_order_update() from public, anon, authenticated;
drop trigger if exists guard_order_update on public.orders;
create trigger guard_order_update before update on public.orders for each row execute function public.guard_order_update();
commit;
