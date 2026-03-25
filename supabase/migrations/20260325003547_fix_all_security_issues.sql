/*
  # Fix All Security Issues
  - Consolidate and optimize RLS policies
  - Fix WITH CHECK (true) on admin update policy
*/

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

CREATE POLICY "Authenticated users can view profiles" ON profiles FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id OR (SELECT auth.jwt()->>'email') IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com'));
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id AND role = (SELECT p.role FROM profiles p WHERE p.id = (SELECT auth.uid()) LIMIT 1));
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE TO authenticated USING ((SELECT auth.jwt()->>'email') IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')) WITH CHECK ((SELECT auth.jwt()->>'email') IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com') AND role IN ('admin', 'client', 'partner', 'member'));
