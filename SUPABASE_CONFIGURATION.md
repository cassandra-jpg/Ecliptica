# Supabase Configuration Instructions

## Auth DB Connection Strategy Configuration

**Issue:** The Auth server is configured to use at most 10 fixed connections. This should be changed to a percentage-based allocation strategy for better scalability.

**How to Fix:**

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **Database**
3. Scroll to **Connection pooling** section
4. Find **Auth server connection pool** settings
5. Change from **Fixed connections (10)** to **Percentage-based allocation**
6. Recommended setting: **10-15%** of total database connections

**Why this matters:**
- Percentage-based allocation automatically scales with your instance size
- If you upgrade your database instance, the Auth server will automatically get more connections
- Fixed connections create a bottleneck that doesn't scale with infrastructure upgrades

**Alternative via SQL (if available in your Supabase version):**
```sql
-- This may require superuser access or dashboard configuration
ALTER SYSTEM SET supabase.auth_pool_mode = 'percentage';
ALTER SYSTEM SET supabase.auth_pool_percentage = 10;
```

Note: This configuration is typically done through the Supabase Dashboard rather than migrations, as it affects the infrastructure layer rather than the database schema.

## Current Security Status

### ✅ Resolved Issues
- RLS policies optimized with `(select auth.uid())` to prevent per-row re-evaluation
- Multiple permissive policies consolidated into single policies
- All functions secured with `SET search_path = public, pg_temp`
- Member table policies now include data validation

### ⚠️ Requires Dashboard Configuration
- Auth DB Connection Strategy: Change from fixed (10) to percentage-based (10-15%)

### 📋 Member Table Policies (Intentionally Permissive)
The `member_feedback` and `member_requests` tables allow anonymous INSERT by design:
- This is required for the passwordless member access system
- Validation is enforced at the data level:
  - Valid email format required
  - Minimum message length of 10 characters
  - Request type must be 'feature_product' or 'tool_submission'
- Read access is restricted to admins only

This approach balances accessibility (members can submit without accounts) with data quality (submissions must be valid).
