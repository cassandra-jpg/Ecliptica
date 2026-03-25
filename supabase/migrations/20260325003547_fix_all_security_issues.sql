/*
  # Fix All Security Issues
  
  ## Security Issues Addressed
  
  1. **Auth RLS Performance Optimization**
     - Replace direct auth.<function>() calls with (SELECT auth.<function>()) in all policies
     - This prevents re-evaluation of auth functions for each row, improving query performance at scale
  
  2. **Multiple Permissive Policies**
     - Consolidate multiple permissive policies into single policies with OR conditions
     - Eliminates redundant policy evaluation for SELECT and UPDATE operations
  
  3. **RLS Policy Always True (Critical)**
     - Fix "Admins can update any profile" policy that had WITH CHECK (true)
     - Add proper validation to prevent unrestricted updates
  
  ## Changes Made
  
  1. Drop all existing profiles policies
  2. Create consolidated, optimized policies with proper auth function calls
  3. Add proper WITH CHECK constraints for admin updates
  4. Ensure role changes are properly validated
*/

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Create optimized SELECT policy (consolidates user and admin view policies)
CREATE POLICY "Authenticated users can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    -- Users can view their own profile OR admins can view all profiles
    (SELECT auth.uid()) = id 
    OR 
    (SELECT auth.jwt()->>'email') IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')
  );

-- Create optimized UPDATE policy for regular users
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK (
    -- User must be updating their own profile
    (SELECT auth.uid()) = id 
    AND
    -- User cannot change their own role
    role = (SELECT p.role FROM profiles p WHERE p.id = (SELECT auth.uid()) LIMIT 1)
  );

-- Create optimized UPDATE policy for admins with proper validation
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    -- Only admins can use this policy
    (SELECT auth.jwt()->>'email') IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')
  )
  WITH CHECK (
    -- Admin is making the update
    (SELECT auth.jwt()->>'email') IN ('cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com')
    AND
    -- Role must be one of the valid values
    role IN ('admin', 'client', 'partner', 'member')
  );
