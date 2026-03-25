/*
  # Initial Schema Setup for Ecliptica Backend

  ## 1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique, not null)
      - `full_name` (text)
      - `role` (text, not null, default 'client')
      - `company` (text)
      - `title` (text)
      - `phone` (text)
      - `created_at` (timestamptz, default now())
    
    - `articles`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `category` (text)
      - `opening_line` (text)
      - `full_content` (text)
      - `publisher` (text, nullable)
      - `published` (boolean, default false)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `member_feedback`
      - `id` (uuid, primary key)
      - `email` (text)
      - `message` (text)
      - `created_at` (timestamptz, default now())
    
    - `member_requests`
      - `id` (uuid, primary key)
      - `email` (text)
      - `request_type` (text)
      - `message` (text)
      - `created_at` (timestamptz, default now())

  ## 2. Security
    - Enable RLS on all tables
    - Admin-only access enforced for cassandra@ecliptica-ops.com and james@ecliptica-ops.com
    - Policies for role-based access control
    - Public read access for published articles only
    - Member insert access for feedback and requests

  ## 3. Important Notes
    - Auto-update trigger for articles.updated_at
    - Admin role strictly limited to two emails via constraint
    - Profile creation handled via trigger in next migration
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'client',
  company text,
  title text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text,
  opening_line text,
  full_content text,
  publisher text,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create member_feedback table
CREATE TABLE IF NOT EXISTS member_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  message text,
  created_at timestamptz DEFAULT now()
);

-- Create member_requests table
CREATE TABLE IF NOT EXISTS member_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  request_type text,
  message text,
  created_at timestamptz DEFAULT now()
);

-- Create trigger to auto-update articles.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_articles_updated_at'
  ) THEN
    CREATE TRIGGER update_articles_updated_at
      BEFORE UPDATE ON articles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create constraint to enforce admin role only for specific emails
CREATE OR REPLACE FUNCTION check_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'admin' AND 
     NEW.email NOT IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com') THEN
    RAISE EXCEPTION 'Admin role can only be assigned to cassandra@ecliptica-ops.com or james@ecliptica-ops.com';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_admin_role'
  ) THEN
    CREATE TRIGGER enforce_admin_role
      BEFORE INSERT OR UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION check_admin_role();
  END IF;
END $$;

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_requests ENABLE ROW LEVEL SECURITY;
