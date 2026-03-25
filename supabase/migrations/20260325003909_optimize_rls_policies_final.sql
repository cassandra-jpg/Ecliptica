/*
  # Optimize RLS Policies - Final Fix
  
  ## Security Issues Addressed
  
  1. **Auth RLS Performance Optimization**
     - Wrap ALL auth function calls with SELECT to prevent re-evaluation per row
     - This includes auth.uid() and auth.jwt() in all clauses
  
  2. **Multiple Permissive UPDATE Policies**
     - Consolidate "Users can update own profile" and "Admins can update any profile" into a single policy
     - Reduces policy evaluation overhead and simplifies permission logic
  
  ## Changes Made
  
  1. Drop all existing profiles policies
  2. Create single optimized SELECT policy with proper SELECT wrapping
  3. Create single optimized UPDATE policy that handles both users and admins
  4. All auth.uid() and auth.jwt() calls wrapped in SELECT statements
*/

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Create single optimized SELECT policy
-- Users can view their own profile OR admins can view all profiles
CREATE POLICY "profiles_select_policy"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR 
    (SELECT auth.jwt()->>'email') IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')
  );

-- Create single consolidated UPDATE policy
-- Handles both regular users updating their own profile and admins updating any profile
CREATE POLICY "profiles_update_policy"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    -- User is updating their own profile OR user is an admin
    id = (SELECT auth.uid())
    OR
    (SELECT auth.jwt()->>'email') IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')
  )
  WITH CHECK (
    -- Case 1: Regular user updating own profile (cannot change role)
    (
      id = (SELECT auth.uid())
      AND
      (SELECT auth.jwt()->>'email') NOT IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')
      AND
      role = (SELECT p.role FROM profiles p WHERE p.id = (SELECT auth.uid()) LIMIT 1)
    )
    OR
    -- Case 2: Admin updating any profile (role must be valid)
    (
      (SELECT auth.jwt()->>'email') IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')
      AND
      role IN ('admin', 'client', 'partner', 'member')
    )
  );
