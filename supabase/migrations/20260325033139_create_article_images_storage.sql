/*
  # Create Article Images Storage Bucket

  1. Storage
    - Creates `article-images` bucket for storing uploaded article images
    - Bucket is public for read access
    
  2. Security
    - Enable RLS on storage.objects
    - Authenticated users can upload images
    - Everyone can view images (public bucket)
    - Only authenticated users can delete their uploads
*/

-- Create the storage bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload article images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-images');

-- Allow authenticated users to update their images
CREATE POLICY "Authenticated users can update article images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'article-images')
  WITH CHECK (bucket_id = 'article-images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete article images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'article-images');

-- Allow public read access to article images
CREATE POLICY "Public can view article images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'article-images');
