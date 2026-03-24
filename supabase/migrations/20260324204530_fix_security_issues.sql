/*
  # Fix Security and Performance Issues

  ## 1. RLS Policy Optimization
    - Replace auth.uid() with (select auth.uid()) for better performance
    - Consolidate multiple permissive policies into single policies with OR conditions
    - Add explicit true conditions for intentionally permissive policies

  ## 2. Function Security
    - Set explicit search_path for all functions to prevent search_path manipulation attacks

  ## 3. Changes Made
    - Drop and recreate profiles policies with optimized queries
    - Update all function definitions with secure search_path
    - Maintain existing security model while improving performance

  ## 4. Important Notes
    - Member feedback and requests intentionally allow unrestricted insert (this is by design)
    - All other security constraints remain unchanged
*/

-- Drop existing profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Create optimized profiles policies (consolidated and optimized)
CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  )
  WITH CHECK (
    (
      (select auth.uid()) = id AND
      role = (SELECT role FROM profiles WHERE id = (select auth.uid()))
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- Update update_updated_at_column function with secure search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update check_admin_role function with secure search_path
CREATE OR REPLACE FUNCTION check_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.role = 'admin' AND 
     NEW.email NOT IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com') THEN
    RAISE EXCEPTION 'Admin role can only be assigned to cassandra@ecliptica-ops.com or james@ecliptica-ops.com';
  END IF;
  RETURN NEW;
END;
$$;

-- Update handle_new_user function with secure search_path
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'client'
  );
  RETURN NEW;
END;
$$;

-- Update is_admin function with secure search_path and optimized query
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (select auth.uid())
    AND role = 'admin'
  );
END;
$$;

-- Drop and recreate articles policies with optimized auth calls
DROP POLICY IF EXISTS "Public can read published articles" ON articles;
DROP POLICY IF EXISTS "Authenticated can read published articles" ON articles;
DROP POLICY IF EXISTS "Admins can insert articles" ON articles;
DROP POLICY IF EXISTS "Admins can update articles" ON articles;
DROP POLICY IF EXISTS "Admins can delete articles" ON articles;

CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  TO anon
  USING (published = true);

CREATE POLICY "Authenticated can read published articles"
  ON articles FOR SELECT
  TO authenticated
  USING (published = true OR is_admin());

CREATE POLICY "Admins can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (is_admin());

-- Drop and recreate member policies with optimized auth calls
DROP POLICY IF EXISTS "Anyone can submit feedback" ON member_feedback;
DROP POLICY IF EXISTS "Admins can read feedback" ON member_feedback;
DROP POLICY IF EXISTS "Anyone can submit requests" ON member_requests;
DROP POLICY IF EXISTS "Admins can read requests" ON member_requests;

-- Recreate with explicit true check (intentionally permissive by design)
CREATE POLICY "Anyone can submit feedback"
  ON member_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read feedback"
  ON member_feedback FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Anyone can submit requests"
  ON member_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read requests"
  ON member_requests FOR SELECT
  TO authenticated
  USING (is_admin());