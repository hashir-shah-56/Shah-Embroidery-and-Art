-- Run once in the Supabase SQL Editor as the project owner.
-- Adds owner-only restrictions without changing existing public SELECT policies.
-- Restrictive policies also constrain any existing broad authenticated policies.
begin;

alter table public.products enable row level security;

create policy "owner_products_insert_guard" on public.products
as restrictive for insert to public
with check ((select auth.uid()) = 'a8dbfb82-d3df-421c-acf1-194335507e80'::uuid);

create policy "owner_products_update_guard" on public.products
as restrictive for update to public
using ((select auth.uid()) = 'a8dbfb82-d3df-421c-acf1-194335507e80'::uuid)
with check ((select auth.uid()) = 'a8dbfb82-d3df-421c-acf1-194335507e80'::uuid);

create policy "owner_products_delete_guard" on public.products
as restrictive for delete to public
using ((select auth.uid()) = 'a8dbfb82-d3df-421c-acf1-194335507e80'::uuid);

-- INSERT is sufficient for new uniquely named uploads; no overwriting is used.
create policy "owner_product_images_upload" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'product-images'
  and (select auth.uid()) = 'a8dbfb82-d3df-421c-acf1-194335507e80'::uuid
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "owner_product_images_insert_guard" on storage.objects
as restrictive for insert to public
with check (bucket_id <> 'product-images' or (
  (select auth.uid()) = 'a8dbfb82-d3df-421c-acf1-194335507e80'::uuid
  and (storage.foldername(name))[1] = (select auth.uid())::text
));

create policy "owner_product_images_update_guard" on storage.objects
as restrictive for update to public
using (bucket_id <> 'product-images' or (select auth.uid()) = 'a8dbfb82-d3df-421c-acf1-194335507e80'::uuid)
with check (bucket_id <> 'product-images' or (select auth.uid()) = 'a8dbfb82-d3df-421c-acf1-194335507e80'::uuid);

create policy "owner_product_images_delete_guard" on storage.objects
as restrictive for delete to public
using (bucket_id <> 'product-images' or (select auth.uid()) = 'a8dbfb82-d3df-421c-acf1-194335507e80'::uuid);

-- Enforce the same limits at Storage, beyond the browser validation.
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'product-images';

commit;
