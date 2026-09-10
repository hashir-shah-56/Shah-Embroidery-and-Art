-- Apply once in the Supabase SQL Editor after admin-security.sql.
-- Storage remove() needs both SELECT and DELETE permissions.
-- Existing restrictive guards remain in force; only the configured owner is allowed.
begin;

drop policy if exists "owner_product_images_cleanup_select" on storage.objects;
create policy "owner_product_images_cleanup_select" on storage.objects
for select to authenticated
using (
  bucket_id = 'product-images'
  and (select auth.uid()) = 'a8dbfb82-d3df-421c-acf1-194335507e80'::uuid
);

drop policy if exists "owner_product_images_cleanup_delete" on storage.objects;
create policy "owner_product_images_cleanup_delete" on storage.objects
for delete to authenticated
using (
  bucket_id = 'product-images'
  and (select auth.uid()) = 'a8dbfb82-d3df-421c-acf1-194335507e80'::uuid
);

commit;
