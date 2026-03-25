/*
  # Add Image URL to Articles
  - Add `image_url` column to `articles` table for AI-generated images
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE articles ADD COLUMN image_url text;
  END IF;
END $$;
