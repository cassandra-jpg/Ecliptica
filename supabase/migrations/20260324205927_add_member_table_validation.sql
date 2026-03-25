/*
  # Add Validation to Member Tables
  - Add basic validation to member_feedback and member_requests tables
*/

DROP POLICY IF EXISTS "Anyone can submit feedback" ON member_feedback;
DROP POLICY IF EXISTS "Anyone can submit requests" ON member_requests;

CREATE POLICY "Anyone can submit feedback" ON member_feedback FOR INSERT TO anon, authenticated WITH CHECK (email IS NOT NULL AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND message IS NOT NULL AND length(trim(message)) >= 10);
CREATE POLICY "Anyone can submit requests" ON member_requests FOR INSERT TO anon, authenticated WITH CHECK (email IS NOT NULL AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND request_type IN ('feature_product', 'tool_submission') AND message IS NOT NULL AND length(trim(message)) >= 10);
