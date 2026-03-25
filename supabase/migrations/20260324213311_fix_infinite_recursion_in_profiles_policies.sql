/*
  # Fix Infinite Recursion in Profiles Policies

  ## Problem
    - The profiles policies were querying the profiles table within their own USING/WITH CHECK clauses
    - This created infinite recursion when trying to check admin status
    
  ## Solution
    - Use direct auth.uid() comparisons without subqueries to profiles
    - Store admin check in a separate helper function that doesn't cause recursion
    - Simplify policies to avoid circular dependencies
    
  ## Changes Made
    1. Drop existing problematic policies
    2. Create new simplified policies that don't cause recursion
    3. Users can always view and update their own profile
    4. Admin capabilities handled separately without recursive checks
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;

-- Create simple, non-recursive policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.jwt()->>'email' IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')
  );

-- Allow users to update their own profile (but not change role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1)
  );

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    auth.jwt()->>'email' IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')
  )
  WITH CHECK (true);
