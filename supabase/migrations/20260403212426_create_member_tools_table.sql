/*
  # Create Member Tools Management System

  1. New Tables
    - `member_tools`
      - `id` (uuid, primary key) - Unique identifier
      - `slug` (text, unique) - URL-friendly identifier for the tool
      - `name` (text) - Display name of the tool
      - `description` (text, nullable) - Optional short description
      - `url` (text) - Full URL to the tool subdomain
      - `is_visible` (boolean) - Whether tool appears in Members Area
      - `sort_order` (integer) - Display order (lower = first)
      - `status` (text) - Tool status: 'active', 'draft', 'archived'
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `member_tools` table
    - Admin-only write permissions (create, update, delete)
    - Members can read only visible, active tools
    - Uses existing admin email check pattern

  3. Initial Data
    - Seeds two initial tools: Acquisition Simulator and Growth Diagnostic
*/

-- Create the member_tools table
CREATE TABLE IF NOT EXISTS member_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  url text NOT NULL,
  is_visible boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE member_tools ENABLE ROW LEVEL SECURITY;

-- Create index on slug for fast lookups (used for access validation)
CREATE INDEX IF NOT EXISTS idx_member_tools_slug ON member_tools(slug);

-- Create index on sort_order for efficient ordering
CREATE INDEX IF NOT EXISTS idx_member_tools_sort_order ON member_tools(sort_order);

-- RLS Policy: Admins can read all tools (for management)
CREATE POLICY "Admins can read all tools"
  ON member_tools
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')
  );

-- RLS Policy: Members can read only visible and active tools
CREATE POLICY "Members can read visible active tools"
  ON member_tools
  FOR SELECT
  TO authenticated
  USING (
    is_visible = true 
    AND status = 'active'
    AND auth.jwt() ->> 'email' NOT IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')
  );

-- RLS Policy: Admins can insert new tools
CREATE POLICY "Admins can insert tools"
  ON member_tools
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'email' IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')
  );

-- RLS Policy: Admins can update tools
CREATE POLICY "Admins can update tools"
  ON member_tools
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')
  );

-- RLS Policy: Admins can delete tools
CREATE POLICY "Admins can delete tools"
  ON member_tools
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')
  );

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_member_tools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS member_tools_updated_at ON member_tools;
CREATE TRIGGER member_tools_updated_at
  BEFORE UPDATE ON member_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_member_tools_updated_at();

-- Seed initial tools
INSERT INTO member_tools (slug, name, description, url, is_visible, sort_order, status)
VALUES 
  (
    'acquisition-simulator',
    'Acquisition Simulator',
    'Model acquisition scenarios and evaluate strategic outcomes.',
    'https://acquisitionsimulator.ecliptica-ops.com/',
    true,
    1,
    'active'
  ),
  (
    'growth-diagnostic',
    'Growth Diagnostic',
    'Identify growth constraints and unlock scalable pathways.',
    'https://growthdiagnostic.ecliptica-ops.com/',
    true,
    2,
    'active'
  )
ON CONFLICT (slug) DO NOTHING;

-- Create RPC function for validating tool access (used by edge function)
-- This function checks if a user has access to a specific tool by slug
-- SECURITY DEFINER allows the function to bypass RLS for the validation check
CREATE OR REPLACE FUNCTION validate_tool_access(tool_slug text, user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tool_record member_tools;
  is_member boolean;
BEGIN
  -- Check if user is a registered member
  SELECT EXISTS (
    SELECT 1 FROM registered_members 
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(user_email))
  ) INTO is_member;

  -- If not a registered member, deny access
  IF NOT is_member THEN
    RETURN json_build_object(
      'valid', false,
      'reason', 'not_member'
    );
  END IF;

  -- Check if tool exists and is accessible
  SELECT * INTO tool_record
  FROM member_tools
  WHERE slug = tool_slug
    AND is_visible = true
    AND status = 'active';

  -- If tool not found or not accessible
  IF tool_record.id IS NULL THEN
    RETURN json_build_object(
      'valid', false,
      'reason', 'tool_not_found'
    );
  END IF;

  -- Access granted
  RETURN json_build_object(
    'valid', true,
    'tool', json_build_object(
      'id', tool_record.id,
      'name', tool_record.name,
      'url', tool_record.url
    )
  );
END;
$$;
