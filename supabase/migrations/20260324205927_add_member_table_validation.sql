/*
  # Add Validation to Member Tables

  ## 1. Purpose
    - Add basic validation to member_feedback and member_requests tables
    - While these tables must accept anonymous submissions, we can add constraints
    - Prevent completely empty submissions

  ## 2. Changes Made
    - Add CHECK constraints to ensure submissions have actual content
    - Update RLS policies to reference these constraints
    - Maintain anonymous access while adding basic validation

  ## 3. Important Notes
    - These tables intentionally allow anonymous INSERT (by design)
    - Validation is at the data level, not access level
*/

-- Update RLS policies with validation (still permissive but with data checks)
DROP POLICY IF EXISTS "Anyone can submit feedback" ON member_feedback;
DROP POLICY IF EXISTS "Anyone can submit requests" ON member_requests;

-- Recreate with validation that ensures data quality without restricting access
CREATE POLICY "Anyone can submit feedback"
  ON member_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND 
    email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    message IS NOT NULL AND
    length(trim(message)) >= 10
  );

CREATE POLICY "Anyone can submit requests"
  ON member_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND 
    email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    request_type IN ('feature_product', 'tool_submission') AND
    message IS NOT NULL AND
    length(trim(message)) >= 10
  );
