/*
  # Optimize RLS Policies - Final Fix
  - Consolidate all profiles policies into single SELECT and UPDATE policies
*/

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT TO authenticated USING (id = (SELECT auth.uid()) OR (SELECT auth.jwt()->>'email') IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com'));
CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE TO authenticated USING (id = (SELECT auth.uid()) OR (SELECT auth.jwt()->>'email') IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')) WITH CHECK ((id = (SELECT auth.uid()) AND (SELECT auth.jwt()->>'email') NOT IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com') AND role = (SELECT p.role FROM profiles p WHERE p.id = (SELECT auth.uid()) LIMIT 1)) OR ((SELECT auth.jwt()->>'email') IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com') AND role IN ('admin', 'client', 'partner', 'member')));
