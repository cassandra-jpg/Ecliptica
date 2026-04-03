# Ecliptica Tool Subdomain Auth Package

This package provides authentication enforcement for Ecliptica member tools hosted on separate subdomains.

## Quick Setup

### Option 1: Netlify Edge Function (Recommended - True Server-Side Protection)

1. Copy `netlify/edge-functions/auth-gate.js` to your tool subdomain project
2. Copy `netlify.toml` to your tool subdomain project root (or merge with existing)
3. Deploy to Netlify

The edge function runs at the CDN level BEFORE any content is served, providing true server-side protection.

### Option 2: Client-Side Auth Gate (Fallback)

If you cannot use Netlify Edge Functions:

1. Copy `../tool-auth-gate.html` and rename it to `index.html` in your tool subdomain
2. Move your actual tool application to `/app/` path
3. The auth gate will redirect to `/app/` after successful authentication

## How It Works

1. User clicks a tool from the Ecliptica Members Area
2. Members Area appends `?token=xxx` to the tool URL
3. Auth gate validates the token against Supabase edge function
4. If valid: sets session cookie and allows access
5. If invalid: shows branded "Member Access Required" screen

## Configuration

In `auth-gate.js`, update these values if needed:

```javascript
const SUPABASE_URL = 'https://afzceywxymltjbkhcsbd.supabase.co';
const MAIN_SITE_URL = 'https://ecliptica-ops.com';
```

The tool slug is auto-detected from the hostname:
- `acquisitionsimulator.ecliptica-ops.com` → `acquisition-simulator`
- `growthdiagnostic.ecliptica-ops.com` → `growth-diagnostic`

## Security Notes

- Tokens are validated against the `validate-tool-access` Supabase edge function
- Session cookies are HttpOnly, Secure, and SameSite=Strict
- Sessions expire after 1 hour
- Invalid tokens are rejected and cookies are cleared

## Testing

1. Visit the tool subdomain directly (no token) → Should see auth gate
2. Sign in via Members Area and click tool → Should access tool
3. Open tool in incognito without token → Should see auth gate
