
-- Insert a new bucket for posts
insert into storage.buckets (id, name, public)
values ('posts', 'posts', true);

-- Allow public access to view files
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'posts' );

-- Allow authenticated users to upload files
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'posts' and auth.role() = 'authenticated' );
