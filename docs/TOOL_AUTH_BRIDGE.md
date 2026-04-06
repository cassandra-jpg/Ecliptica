# Tool Authentication Bridge

This document describes the authentication bridge system for protecting member-only tools hosted on separate subdomains (e.g., Lovable-hosted apps).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Authentication Flow                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. User visits tool subdomain (e.g., acquisitionsimulator.ecliptica-ops.com)
│                              │                                              │
│                              ▼                                              │
│  2. Cloudflare Worker checks for valid auth cookie                          │
│                              │                                              │
│           ┌──────────────────┴──────────────────┐                          │
│           │                                      │                          │
│           ▼                                      ▼                          │
│  Cookie Valid                           No Cookie / Invalid                 │
│           │                                      │                          │
│           ▼                                      ▼                          │
│  3a. Proxy to Lovable app              3b. Show "Member Access Required"   │
│                                                  │                          │
│                                                  ▼                          │
│                                         4. User clicks "Sign In"            │
│                                                  │                          │
│                                                  ▼                          │
│                                         5. Redirect to /auth/bridge         │
│                                            ?redirect=<tool_url>             │
│                                                  │                          │
│           ┌──────────────────────────────────────┘                          │
│           │                                                                 │
│           ▼                                                                 │
│  6. Bridge checks Supabase session                                          │
│           │                                                                 │
│           ├─── Not authenticated ──► Redirect to /login?tab=member          │
│           │                          with returnTo=/auth/bridge             │
│           │                                                                 │
│           ▼                                                                 │
│  7. User completes member OTP login                                         │
│           │                                                                 │
│           ▼                                                                 │
│  8. Bridge calls issue-tool-token edge function                             │
│           │                                                                 │
│           ▼                                                                 │
│  9. issue-tool-token verifies:                                              │
│     - Valid Supabase session                                                │
│     - User is in registered_members table                                   │
│     - Returns signed JWT (5-min expiry)                                     │
│           │                                                                 │
│           ▼                                                                 │
│  10. Bridge redirects to tool subdomain:                                    │
│      /__auth_callback?token=<jwt>&return_path=/                             │
│           │                                                                 │
│           ▼                                                                 │
│  11. Cloudflare Worker at /__auth_callback:                                 │
│      - Verifies JWT signature and expiry                                    │
│      - Creates session cookie (7-day expiry)                                │
│      - Sets cookie on .ecliptica-ops.com                                    │
│      - Redirects to return_path                                             │
│           │                                                                 │
│           ▼                                                                 │
│  12. User now has valid cookie, can access tool                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Supabase Edge Functions

#### `issue-tool-token`
- **Purpose**: Issues short-lived JWTs for authenticated members
- **Authentication**: Requires valid Supabase session (Bearer token)
- **Validation**: Verifies user exists in `registered_members` table
- **Token**: HS256-signed JWT with 5-minute expiry
- **Claims**: `sub`, `email`, `name`, `iat`, `exp`, `iss`, `aud`

#### `validate-tool-access`
- **Purpose**: Validates tool tokens and checks membership (used by Cloudflare Worker for API validation if needed)
- **Supports**: Both Supabase session tokens and tool tokens
- **Parameter**: `token_type` = "session" | "tool_token"

### 2. Frontend Pages

#### `/auth/bridge`
- **File**: `src/pages/AuthBridgePage.tsx`
- **Purpose**: Orchestrates the auth flow between main site and tool subdomains
- **Features**:
  - Validates redirect URL against allowlist
  - Checks authentication state
  - Issues tool token
  - Handles errors gracefully

### 3. Cloudflare Worker

#### `tool-auth-worker.js`
- **File**: `cloudflare-workers/tool-auth-worker.js`
- **Purpose**: Sits in front of Lovable-hosted tools
- **Features**:
  - Checks auth cookie on every request
  - Shows access gate if unauthenticated
  - Handles `/__auth_callback` to set cookies
  - Proxies requests to Lovable origin when authenticated

## Environment Variables

### Supabase Edge Functions

| Variable | Description | Auto-configured |
|----------|-------------|-----------------||
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `TOOL_TOKEN_SECRET` | Secret for signing tool tokens (min 32 chars) | **No - must set** |

**To set TOOL_TOKEN_SECRET in Supabase:**
1. Go to Supabase Dashboard > Project Settings > Edge Functions
2. Add secret: `TOOL_TOKEN_SECRET`
3. Value: Generate a secure random string (64+ characters recommended)

Example generation:
```bash
openssl rand -base64 48
```

### Cloudflare Worker

| Variable | Type | Description |
|----------|------|-------------|
| `MAIN_SITE_URL` | Var | Main Ecliptica site URL (e.g., `https://ecliptica-ops.com`) |
| `LOVABLE_ORIGIN` | Secret | Actual Lovable app URL to proxy to |
| `TOOL_TOKEN_SECRET` | Secret | Same secret as Supabase edge functions |

### Netlify (Frontend)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |

## Cloudflare Worker Setup

### Prerequisites
1. Cloudflare account with domain `ecliptica-ops.com` configured
2. Wrangler CLI installed: `npm install -g wrangler`
3. Logged into Cloudflare: `wrangler login`

### Deployment Steps

#### For Acquisition Simulator:
```bash
cd cloudflare-workers

# Set the secrets
wrangler secret put TOOL_TOKEN_SECRET --env acquisition-simulator
# Enter the same secret used in Supabase

wrangler secret put LOVABLE_ORIGIN --env acquisition-simulator
# Enter the Lovable app URL (e.g., https://your-app-id.lovable.app)

# Deploy
wrangler deploy --env acquisition-simulator
```

#### For Growth Diagnostic:
```bash
cd cloudflare-workers

# Set the secrets
wrangler secret put TOOL_TOKEN_SECRET --env growth-diagnostic
wrangler secret put LOVABLE_ORIGIN --env growth-diagnostic

# Deploy
wrangler deploy --env growth-diagnostic
```

### DNS Configuration

The Cloudflare Worker routes are configured in `wrangler.toml`. Ensure:

1. DNS for `ecliptica-ops.com` is managed by Cloudflare
2. Subdomains are configured as CNAME or A records proxied through Cloudflare
3. Worker routes match the subdomain patterns

Example DNS records:
```
acquisitionsimulator.ecliptica-ops.com  CNAME  @  (Proxied)
growthdiagnostic.ecliptica-ops.com      CNAME  @  (Proxied)
```

## Security Considerations

### Token Security
- Tool tokens have 5-minute expiry (mitigates replay attacks)
- Tokens are HS256-signed with a strong secret
- Issuer and audience claims are verified
- Tokens contain only essential claims

### Cookie Security
- `HttpOnly`: Prevents JavaScript access
- `Secure`: Only sent over HTTPS
- `SameSite=Lax`: Prevents CSRF while allowing navigation
- Domain: `.ecliptica-ops.com` (shared across subdomains)
- Max-Age: 7 days

### Redirect Validation
- Only `*.ecliptica-ops.com` subdomains are allowed
- Protocol must be HTTPS
- No open redirect vulnerabilities

### Member Validation
- Token issuance requires active Supabase session
- User must exist in `registered_members` table
- Membership checked at token issuance time

## Testing Checklist

### Pre-deployment
- [ ] TOOL_TOKEN_SECRET set in Supabase Edge Functions
- [ ] TOOL_TOKEN_SECRET set in Cloudflare Worker (same value)
- [ ] LOVABLE_ORIGIN set for each worker environment
- [ ] MAIN_SITE_URL configured correctly
- [ ] DNS records configured and proxied through Cloudflare

### End-to-end Flow
1. [ ] Visit tool subdomain → See "Member Access Required" gate
2. [ ] Click "Sign In" → Redirected to `/auth/bridge`
3. [ ] If not logged in → Redirected to `/login?tab=member`
4. [ ] Complete OTP login → Redirected back to bridge
5. [ ] Bridge issues token → Redirected to `/__auth_callback`
6. [ ] Cookie set → Redirected to tool `/`
7. [ ] Tool loads successfully
8. [ ] Refresh page → Still authenticated (cookie persists)
9. [ ] Visit different tool subdomain → Cookie works (shared domain)
10. [ ] Wait 7 days → Cookie expires, must re-authenticate

### Error Handling
- [ ] Invalid redirect URL → Error shown on bridge page
- [ ] Non-member user → Error shown, option to sign up
- [ ] Expired token at callback → Error shown, try again
- [ ] Invalid token signature → Error shown
- [ ] Missing TOOL_TOKEN_SECRET → Graceful error

### Security Tests
- [ ] Cannot access tool without valid cookie
- [ ] Cannot forge cookie (signature verification fails)
- [ ] Cannot use expired token
- [ ] Cannot redirect to non-ecliptica-ops.com domains
- [ ] Cannot access other users' sessions

## Adding New Tools

1. Add tool to `member_tools` table in Supabase
2. Add subdomain to `ALLOWED_REDIRECT_DOMAINS` in `AuthBridgePage.tsx`
3. Create new environment in `wrangler.toml`
4. Deploy worker with appropriate secrets
5. Configure DNS record

Example for "Vortex Content Tool":
```toml
[env.vortex-content]
name = "ecliptica-vortex-content-auth"
routes = [
  { pattern = "vortexcontent.ecliptica-ops.com/*", zone_name = "ecliptica-ops.com" }
]
[env.vortex-content.vars]
MAIN_SITE_URL = "https://ecliptica-ops.com"
```

Then update `AuthBridgePage.tsx`:
```typescript
const ALLOWED_REDIRECT_DOMAINS = [
  'ecliptica-ops.com',
  'acquisitionsimulator.ecliptica-ops.com',
  'growthdiagnostic.ecliptica-ops.com',
  'vortexcontent.ecliptica-ops.com', // Add new tool
];
```

## Troubleshooting

### "Token signing is not configured"
- Ensure `TOOL_TOKEN_SECRET` is set in Supabase Edge Functions
- Secret must be at least 32 characters

### "Invalid token signature" at callback
- Ensure Cloudflare Worker and Supabase use the SAME `TOOL_TOKEN_SECRET`

### Cookie not working across subdomains
- Check cookie domain is `.ecliptica-ops.com` (leading dot)
- Ensure both subdomains are under `ecliptica-ops.com`

### Infinite redirect loop
- Check that Lovable app doesn't have its own auth that conflicts
- Verify LOVABLE_ORIGIN is correct

### 502 errors when accessing tool
- Verify LOVABLE_ORIGIN is the correct Lovable app URL
- Check Lovable app is deployed and accessible
