-- Run in the configured project's Supabase SQL Editor.
-- Restores the bucket required by the existing public reference-image URL flow.
-- Safe to rerun; does not modify product buckets or custom request table policies.
begin;

insert into storage.buckets (id, name, public)
values ('custom-order-images', 'custom-order-images', true)
on conflict (id) do nothing;

-- Do not silently change an existing private bucket to public.
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'custom-order-images' and public) then
    raise exception 'custom-order-images already exists but is private; review its intended visibility before proceeding';
  end if;
end;
$$;

drop policy if exists custom_reference_guest_insert on storage.objects;
create policy custom_reference_guest_insert on storage.objects
for insert to anon
with check (bucket_id = 'custom-order-images' and (storage.foldername(name))[1] = 'guests');

drop policy if exists custom_reference_customer_insert on storage.objects;
create policy custom_reference_customer_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'custom-order-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;
