/**
 * Cloudflare Worker: Tool Authentication Gate
 *
 * This worker sits in front of Lovable-hosted tools and provides authentication.
 * It checks for a valid auth cookie, and if not present, shows an access gate.
 *
 * CONFIGURATION REQUIRED (Cloudflare Worker Environment Variables):
 * - SUPABASE_URL: Your Supabase project URL
 * - TOOL_TOKEN_SECRET: The same secret used by issue-tool-token edge function
 * - LOVABLE_ORIGIN: The actual Lovable app URL to proxy to (e.g., https://your-app.lovable.app)
 * - MAIN_SITE_URL: The main Ecliptica site URL (e.g., https://ecliptica-ops.com)
 *
 * COOKIE SETTINGS:
 * - Cookie name: ecliptica_tool_auth
 * - Domain: .ecliptica-ops.com (shared across all subdomains)
 * - Max-Age: 7 days (604800 seconds)
 * - Secure, HttpOnly, SameSite=Lax
 */

const COOKIE_NAME = 'ecliptica_tool_auth';
const COOKIE_MAX_AGE = 604800; // 7 days in seconds

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

async function verifyHmacSignature(data, signature, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  let sigBase64 = signature.replace(/-/g, '+').replace(/_/g, '/');
  while (sigBase64.length % 4) {
    sigBase64 += '=';
  }
  const sigBytes = Uint8Array.from(atob(sigBase64), c => c.charCodeAt(0));

  return await crypto.subtle.verify('HMAC', cryptoKey, sigBytes, messageData);
}

async function verifyToolToken(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'invalid_format' };
    }

    const [headerEncoded, payloadEncoded, signature] = parts;
    const dataToVerify = `${headerEncoded}.${payloadEncoded}`;

    const isValid = await verifyHmacSignature(dataToVerify, signature, secret);
    if (!isValid) {
      return { valid: false, error: 'invalid_signature' };
    }

    const payload = JSON.parse(base64UrlDecode(payloadEncoded));

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'token_expired' };
    }

    if (payload.iss !== 'ecliptica-tool-bridge') {
      return { valid: false, error: 'invalid_issuer' };
    }

    if (payload.aud !== 'ecliptica-tools') {
      return { valid: false, error: 'invalid_audience' };
    }

    return { valid: true, payload };
  } catch (e) {
    return { valid: false, error: 'verification_failed' };
  }
}

function getCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const [cookieName, ...valueParts] = cookie.split('=');
    if (cookieName.trim() === name) {
      return valueParts.join('=');
    }
  }
  return null;
}

function createAuthCookie(token, isSecure = true) {
  const parts = [
    `${COOKIE_NAME}=${token}`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    'Path=/',
    'Domain=.ecliptica-ops.com',
    'HttpOnly',
    'SameSite=Lax',
  ];

  if (isSecure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function createClearCookie() {
  return `${COOKIE_NAME}=; Max-Age=0; Path=/; Domain=.ecliptica-ops.com; HttpOnly; SameSite=Lax; Secure`;
}

function getAccessGatePage(mainSiteUrl, currentUrl, errorMessage = null) {
  const bridgeUrl = `${mainSiteUrl}/auth/bridge?redirect=${encodeURIComponent(currentUrl)}`;

  const errorHtml = errorMessage ? `
    <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #DC2626; background-color: rgba(220, 38, 38, 0.05);">
      <p style="margin: 0; font-family: 'Montserrat', sans-serif; font-size: 12px; color: #DC2626;">
        ${errorMessage}
      </p>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Member Access Required | Ecliptica</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-navy: #1B2340;
      --color-gold: #C9AA71;
      --color-ivory: #FAF9F6;
      --color-text-muted: #6B7280;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-ivory);
      font-family: 'Montserrat', sans-serif;
      padding: 24px;
    }

    .container {
      max-width: 420px;
      width: 100%;
      text-align: center;
    }

    .logo {
      height: 48px;
      margin-bottom: 48px;
    }

    .card {
      background: white;
      border: 1px solid rgba(27, 35, 64, 0.1);
      padding: 48px 40px;
    }

    .icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 24px;
      border: 2px solid var(--color-gold);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon svg {
      width: 28px;
      height: 28px;
      color: var(--color-gold);
    }

    h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 500;
      color: var(--color-navy);
      margin-bottom: 16px;
    }

    p {
      font-size: 14px;
      color: var(--color-text-muted);
      line-height: 1.6;
      margin-bottom: 32px;
    }

    .btn {
      display: block;
      width: 100%;
      padding: 16px 24px;
      background-color: var(--color-navy);
      color: white;
      text-decoration: none;
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      border: none;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn:hover {
      background-color: var(--color-gold);
    }

    .footer {
      margin-top: 24px;
    }

    .footer a {
      font-size: 12px;
      color: var(--color-text-muted);
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer a:hover {
      color: var(--color-gold);
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="${mainSiteUrl}/PRIMARY_LOGO.png" alt="Ecliptica" class="logo">

    <div class="card">
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>

      <h1>Member Access Required</h1>

      <p>This tool is available exclusively to Ecliptica members. Please sign in to continue.</p>

      ${errorHtml}

      <a href="${bridgeUrl}" class="btn">Sign In</a>
    </div>

    <div class="footer">
      <a href="${mainSiteUrl}">Return to Ecliptica</a>
    </div>
  </div>
</body>
</html>`;
}

function getCallbackSuccessPage(returnPath = '/') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Granted | Ecliptica</title>
  <style>
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #FAF9F6;
      font-family: 'Montserrat', sans-serif;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 2px solid #C9AA71;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    p {
      margin-top: 16px;
      color: #6B7280;
      font-size: 14px;
    }
    .container {
      text-align: center;
    }
  </style>
  <script>
    setTimeout(function() {
      window.location.href = '${returnPath}';
    }, 500);
  </script>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Access granted. Redirecting...</p>
  </div>
</body>
</html>`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const mainSiteUrl = env.MAIN_SITE_URL || 'https://ecliptica-ops.com';
    const lovableOrigin = env.LOVABLE_ORIGIN;
    const toolTokenSecret = env.TOOL_TOKEN_SECRET;

    // Handle auth callback
    if (pathname === '/__auth_callback') {
      const token = url.searchParams.get('token');
      const returnPath = url.searchParams.get('return_path') || '/';

      if (!token) {
        return new Response(getAccessGatePage(mainSiteUrl, url.origin, 'No authentication token provided.'), {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        });
      }

      if (!toolTokenSecret) {
        console.error('TOOL_TOKEN_SECRET not configured');
        return new Response(getAccessGatePage(mainSiteUrl, url.origin, 'Authentication is not configured. Please contact support.'), {
          status: 500,
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // Verify the token
      const verification = await verifyToolToken(token, toolTokenSecret);

      if (!verification.valid) {
        const errorMessages = {
          invalid_format: 'Invalid token format.',
          invalid_signature: 'Token verification failed.',
          token_expired: 'Your access token has expired. Please sign in again.',
          invalid_issuer: 'Invalid token source.',
          invalid_audience: 'Invalid token audience.',
          verification_failed: 'Token verification failed.',
        };

        return new Response(getAccessGatePage(mainSiteUrl, url.origin, errorMessages[verification.error] || 'Invalid token.'), {
          status: 401,
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // Create a session token to store in cookie (just the email for verification)
      const sessionData = {
        email: verification.payload.email,
        name: verification.payload.name,
        exp: Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE,
        iat: Math.floor(Date.now() / 1000),
      };

      // Create a simple signed session cookie
      const sessionPayload = btoa(JSON.stringify(sessionData)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const encoder = new TextEncoder();
      const keyData = encoder.encode(toolTokenSecret);
      const messageData = encoder.encode(sessionPayload);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const signatureArray = new Uint8Array(signature);
      const signatureString = Array.from(signatureArray).map(byte => String.fromCharCode(byte)).join('');
      const signatureEncoded = btoa(signatureString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const sessionCookie = `${sessionPayload}.${signatureEncoded}`;

      // Set cookie and redirect
      const isSecure = url.protocol === 'https:';
      return new Response(getCallbackSuccessPage(returnPath), {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Set-Cookie': createAuthCookie(sessionCookie, isSecure),
        },
      });
    }

    // Handle logout
    if (pathname === '/__auth_logout') {
      return new Response(getAccessGatePage(mainSiteUrl, url.origin), {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Set-Cookie': createClearCookie(),
        },
      });
    }

    // Check for existing auth cookie
    const authCookie = getCookie(request, COOKIE_NAME);

    if (authCookie && toolTokenSecret) {
      // Verify the session cookie
      const parts = authCookie.split('.');
      if (parts.length === 2) {
        const [sessionPayload, signature] = parts;

        try {
          const isValid = await verifyHmacSignature(sessionPayload, signature, toolTokenSecret);

          if (isValid) {
            let base64 = sessionPayload.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) {
              base64 += '=';
            }
            const sessionData = JSON.parse(atob(base64));

            // Check expiration
            const now = Math.floor(Date.now() / 1000);
            if (sessionData.exp && sessionData.exp > now) {
              // Valid session - proxy to Lovable
              if (lovableOrigin) {
                const proxyUrl = new URL(pathname + url.search, lovableOrigin);
                const proxyRequest = new Request(proxyUrl, {
                  method: request.method,
                  headers: request.headers,
                  body: request.body,
                  redirect: 'manual',
                });

                const response = await fetch(proxyRequest);

                // Return the proxied response with original headers
                const newHeaders = new Headers(response.headers);

                return new Response(response.body, {
                  status: response.status,
                  statusText: response.statusText,
                  headers: newHeaders,
                });
              } else {
                // No Lovable origin configured - this shouldn't happen in production
                return new Response('Tool origin not configured', { status: 500 });
              }
            }
          }
        } catch (e) {
          console.error('Session verification error:', e);
        }
      }
    }

    // No valid session - show access gate
    return new Response(getAccessGatePage(mainSiteUrl, `${url.origin}${url.pathname}`), {
      status: 401,
      headers: {
        'Content-Type': 'text/html',
        'Set-Cookie': createClearCookie(), // Clear any invalid cookies
      },
    });
  },
};
