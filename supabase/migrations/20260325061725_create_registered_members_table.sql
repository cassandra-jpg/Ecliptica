/*
  # Create registered_members table

  1. New Tables
    - `registered_members`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null) — the member's email address
      - `first_name` (text) — member's first name
      - `last_name` (text) — member's last name
      - `company` (text) — member's business/company name
      - `phone` (text, nullable) — optional phone number
      - `title` (text) — member's title or role
      - `created_at` (timestamptz) — when they registered

  2. Security
    - Enable RLS on `registered_members` table
    - Allow anyone (anon + authenticated) to INSERT — for public sign-up
    - Allow only admins to SELECT all records — for admin dashboard
    - No UPDATE or DELETE policies — records are immutable after creation

  3. RPC Function
    - `is_registered_member(member_email text)` — SECURITY DEFINER function
      callable by anon users to check whether an email exists in the table
      before sending an OTP. Returns boolean.

  4. Notes
    - Duplicate email is handled by the UNIQUE constraint (error code 23505)
    - Email is lowercased in the RPC function for case-insensitive matching
    - Admins are identified by their JWT email claim
*/

CREATE TABLE IF NOT EXISTS registered_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  company text DEFAULT '',
  phone text,
  title text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE registered_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register as a member"
  ON registered_members FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND
    length(trim(email)) > 0
  );

CREATE POLICY "Admins can view all registered members"
  ON registered_members FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') IN (
      SELECT email FROM profiles WHERE role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION is_registered_member(member_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS(
    SELECT 1 FROM registered_members WHERE email = lower(trim(member_email))
  );
$$;
