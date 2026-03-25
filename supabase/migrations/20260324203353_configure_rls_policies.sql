/*
  # Row Level Security Policies

  ## 1. Profiles Table Policies
    - Users can read their own profile
    - Users can update their own non-role fields
    - Only admins can view all profiles
    - Only admins can update roles

  ## 2. Articles Table Policies
    - Public users can read only published articles
    - Authenticated non-admin users can read only published articles
    - Only admins can insert, update, delete articles

  ## 3. Member Feedback Table Policies
    - Allow insert from unauthenticated users
    - Restrict read access to admins only

  ## 4. Member Requests Table Policies
    - Allow insert from unauthenticated users
    - Restrict read access to admins only
*/

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Public can read published articles" ON articles FOR SELECT TO anon USING (published = true);
CREATE POLICY "Authenticated can read published articles" ON articles FOR SELECT TO authenticated USING (published = true OR is_admin());
CREATE POLICY "Admins can insert articles" ON articles FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update articles" ON articles FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete articles" ON articles FOR DELETE TO authenticated USING (is_admin());

CREATE POLICY "Anyone can submit feedback" ON member_feedback FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read feedback" ON member_feedback FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY "Anyone can submit requests" ON member_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read requests" ON member_requests FOR SELECT TO authenticated USING (is_admin());
