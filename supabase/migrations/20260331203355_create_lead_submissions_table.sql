/*
  # Create Lead Submissions Table

  1. New Tables
    - `lead_submissions`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `form_type` (text) - Type of form: demo_request, contact, newsletter, build_request, waitlist, member_interest, other
      - `source_page` (text) - URL path where form was submitted
      - `source_section` (text, nullable) - Section name if applicable
      - `name` (text, nullable)
      - `email` (text, nullable)
      - `business_name` (text, nullable)
      - `role` (text, nullable)
      - `company_size` (text, nullable)
      - `revenue_range` (text, nullable)
      - `industry` (text, nullable)
      - `primary_goal` (text, nullable)
      - `timeline` (text, nullable)
      - `linkedin_url` (text, nullable)
      - `scheduling_url` (text, nullable)
      - `message` (text, nullable)
      - `phone` (text, nullable)
      - `metadata` (jsonb, nullable) - UTM params, referrer, extra data
      - `status` (text) - new, contacted, qualified, converted, archived

  2. Security
    - Enable RLS on `lead_submissions` table
    - Add policy for admins to read all submissions
    - Add policy for service role to insert submissions

  3. Indexes
    - Index on created_at for sorting
    - Index on form_type for filtering
    - Index on status for filtering
    - Index on email for searching
*/

CREATE TABLE IF NOT EXISTS lead_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  form_type text NOT NULL,
  source_page text NOT NULL,
  source_section text,
  name text,
  email text,
  business_name text,
  role text,
  company_size text,
  revenue_range text,
  industry text,
  primary_goal text,
  timeline text,
  linkedin_url text,
  scheduling_url text,
  message text,
  phone text,
  metadata jsonb,
  status text DEFAULT 'new' NOT NULL
);

ALTER TABLE lead_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all lead submissions"
  ON lead_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update lead submissions"
  ON lead_submissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Service role can insert lead submissions"
  ON lead_submissions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_lead_submissions_created_at ON lead_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_form_type ON lead_submissions(form_type);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_status ON lead_submissions(status);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_email ON lead_submissions(email);