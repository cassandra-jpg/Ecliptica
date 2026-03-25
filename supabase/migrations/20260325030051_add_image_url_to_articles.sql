/*
  # Add Image URL to Articles

  1. Changes
    - Add `image_url` column to `articles` table to store AI-generated article images
    - Column is optional (nullable) as existing articles may not have images
  
  2. Notes
    - Images will be auto-generated using AI when articles are created
    - Images will be landscape format displayed in full article view
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
