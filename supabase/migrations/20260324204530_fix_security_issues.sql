/*
  # Fix Security and Performance Issues

  ## 1. RLS Policy Optimization
  ## 2. Function Security - secure search_path
  ## 3. Changes Made - optimized queries
*/

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

CREATE POLICY "Users can view profiles" ON profiles FOR SELECT TO authenticated USING ((select auth.uid()) = id OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'admin'));
CREATE POLICY "Users can update profiles" ON profiles FOR UPDATE TO authenticated USING ((select auth.uid()) = id OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'admin')) WITH CHECK (((select auth.uid()) = id AND role = (SELECT role FROM profiles WHERE id = (select auth.uid()))) OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'admin'));

CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION check_admin_role() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$ BEGIN IF NEW.role = 'admin' AND NEW.email NOT IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com') THEN RAISE EXCEPTION 'Admin role can only be assigned to cassandra@ecliptica-ops.com or james@ecliptica-ops.com'; END IF; RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$ BEGIN INSERT INTO public.profiles (id, email, role) VALUES (NEW.id, NEW.email, 'client'); RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'admin'); END; $$;

DROP POLICY IF EXISTS "Public can read published articles" ON articles;
DROP POLICY IF EXISTS "Authenticated can read published articles" ON articles;
DROP POLICY IF EXISTS "Admins can insert articles" ON articles;
DROP POLICY IF EXISTS "Admins can update articles" ON articles;
DROP POLICY IF EXISTS "Admins can delete articles" ON articles;

CREATE POLICY "Public can read published articles" ON articles FOR SELECT TO anon USING (published = true);
CREATE POLICY "Authenticated can read published articles" ON articles FOR SELECT TO authenticated USING (published = true OR is_admin());
CREATE POLICY "Admins can insert articles" ON articles FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update articles" ON articles FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete articles" ON articles FOR DELETE TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Anyone can submit feedback" ON member_feedback;
DROP POLICY IF EXISTS "Admins can read feedback" ON member_feedback;
DROP POLICY IF EXISTS "Anyone can submit requests" ON member_requests;
DROP POLICY IF EXISTS "Admins can read requests" ON member_requests;

CREATE POLICY "Anyone can submit feedback" ON member_feedback FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read feedback" ON member_feedback FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Anyone can submit requests" ON member_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read requests" ON member_requests FOR SELECT TO authenticated USING (is_admin());
