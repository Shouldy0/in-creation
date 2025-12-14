-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('process-media', 'process-media', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
-- Allow public read access
CREATE POLICY "Media is publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'process-media' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'process-media'
    AND auth.role() = 'authenticated'
  );

-- Allow users to update/delete their own media
CREATE POLICY "Users can update own media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'process-media'
    AND auth.uid() = owner
  );

CREATE POLICY "Users can delete own media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'process-media'
    AND auth.uid() = owner
  );
