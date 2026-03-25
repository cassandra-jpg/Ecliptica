/*
  # Fix Infinite Recursion in Profiles Policies
  - Use JWT email check instead of subquery to profiles to avoid recursion
*/

DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT TO authenticated USING (auth.jwt()->>'email' IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com'));
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1));
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE TO authenticated USING (auth.jwt()->>'email' IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')) WITH CHECK (true);
