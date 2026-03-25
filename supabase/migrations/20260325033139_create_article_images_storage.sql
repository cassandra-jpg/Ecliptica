/*
  # Create Article Images Storage Bucket
  - Creates `article-images` bucket for storing uploaded article images
  - Bucket is public for read access
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload article images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'article-images');
CREATE POLICY "Authenticated users can update article images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'article-images') WITH CHECK (bucket_id = 'article-images');
CREATE POLICY "Authenticated users can delete article images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'article-images');
CREATE POLICY "Public can view article images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'article-images');
