/*
  # Fix Infinite Recursion in profiles_update_policy

  ## Problem
  The existing UPDATE policy's WITH CHECK clause contains a subquery that
  reads from the `profiles` table to verify the current user's role. Since
  RLS is active on `profiles`, this triggers the same policy again, causing
  infinite recursion.

  ## Fix
  Replace the WITH CHECK clause with a simpler, non-recursive version:
  - Admin users (identified by email via JWT) can update any profile with any valid role
  - Non-admin users can only update their own profile, and may not self-assign the 'admin' role

  This removes the self-referential subquery entirely.
*/

DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    (id = (SELECT auth.uid()))
    OR
    ((SELECT auth.jwt()->>'email') = ANY (ARRAY['cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com']))
  )
  WITH CHECK (
    (
      -- Admins can set any valid role
      ((SELECT auth.jwt()->>'email') = ANY (ARRAY['cassandra@ecliptica-ops.com', 'james@ecliptica-ops.com']))
      AND role = ANY (ARRAY['admin', 'client', 'partner', 'member'])
    )
    OR
    (
      -- Non-admins can only update their own profile and cannot assign admin role
      id = (SELECT auth.uid())
      AND role <> 'admin'
    )
  );
