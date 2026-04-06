/**
 * ECLIPTICA TOOL AUTH GATE - NETLIFY EDGE FUNCTION
 *
 * This edge function runs at the CDN level BEFORE any content is served.
 * It provides true server-side authentication enforcement.
 *
 * DEPLOYMENT:
 * 1. Copy this file to your tool subdomain's netlify/edge-functions/ folder
 * 2. Create/update netlify.toml with the edge function configuration
 * 3. Deploy to Netlify
 *
 * The function intercepts ALL requests and:
 * - Checks for valid session cookie
 * - Validates against Supabase edge function
 * - Returns auth gate page if unauthorized
 * - Allows request through if authorized
 */

const SUPABASE_URL = 'https://afzceywxymltjbkhcsbd.supabase.co';
const MAIN_SITE_URL = 'https://ecliptica-ops.com';

function getToolSlug(hostname) {
  if (hostname.includes('acquisitionsimulator')) return 'acquisition-simulator';
  if (hostname.includes('growthdiagnostic')) return 'growth-diagnostic';
  return hostname.split('.')[0];
}

function getAuthGatePage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Member Access Required | Ecliptica</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Montserrat:wght@300;400;500&family=Libre+Baskerville:wght@400&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-navy: #1B2340;
      --color-gold: #C9A84C;
      --color-ivory: #F7F5F0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Libre Baskerville', serif;
      background-color: var(--color-navy);
      color: var(--color-ivory);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .container { max-width: 500px; text-align: center; }
    .logo { width: 180px; margin-bottom: 3rem; }
    .lock-icon { width: 48px; height: 48px; margin-bottom: 2rem; opacity: 0.6; }
    h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2.5rem;
      font-weight: 300;
      margin-bottom: 1.5rem;
    }
    .message {
      font-size: 1rem;
      line-height: 1.8;
      margin-bottom: 3rem;
      color: rgba(247, 245, 240, 0.8);
    }
    .buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .btn {
      font-family: 'Montserrat', sans-serif;
      font-size: 0.75rem;
      font-weight: 400;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      text-decoration: none;
      padding: 1rem 2.5rem;
      transition: all 0.3s ease;
    }
    .btn-primary { background-color: var(--color-gold); color: var(--color-navy); }
    .btn-primary:hover { background-color: #d4b55a; }
    .btn-secondary {
      background-color: transparent;
      color: var(--color-gold);
      border: 1px solid var(--color-gold);
    }
    .btn-secondary:hover { background-color: rgba(201, 168, 76, 0.1); }
    .divider {
      width: 60px;
      height: 1px;
      background-color: var(--color-gold);
      margin: 3rem auto;
      position: relative;
    }
    .divider::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
      width: 8px;
      height: 8px;
      background-color: var(--color-gold);
    }
    .footer-text {
      font-family: 'Montserrat', sans-serif;
      font-size: 0.7rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(247, 245, 240, 0.4);
    }
    @media (max-width: 480px) {
      h1 { font-size: 1.75rem; }
      .buttons { flex-direction: column; }
      .btn { width: 100%; text-align: center; }
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="${MAIN_SITE_URL}/reversed_logo_color.png" alt="Ecliptica" class="logo">
    <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
    <h1>Member Access Required</h1>
    <p class="message">Please sign up or sign in to your Members Account to access.</p>
    <div class="buttons">
      <a href="${MAIN_SITE_URL}/login" class="btn btn-primary">Sign In</a>
      <a href="${MAIN_SITE_URL}/login" class="btn btn-secondary">Sign Up</a>
    </div>
    <div class="divider"></div>
    <p class="footer-text">Ecliptica Intelligence Systems</p>
  </div>
</body>
</html>`;
}

export default async function handler(request, context) {
  const url = new URL(request.url);
  const hostname = url.hostname;
  const toolSlug = getToolSlug(hostname);

  // Allow static assets through without auth check
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  if (staticExtensions.some(ext => url.pathname.endsWith(ext))) {
    return context.next();
  }

  // Check for token in URL (coming from Members Area)
  const urlToken = url.searchParams.get('token');

  // Check for session cookie
  const cookies = request.headers.get('cookie') || '';
  const sessionMatch = cookies.match(/ecliptica_session=([^;]+)/);
  const sessionToken = sessionMatch ? sessionMatch[1] : null;

  // Use URL token if present, otherwise use session cookie
  const token = urlToken || sessionToken;

  if (!token) {
    // No token = show auth gate
    return new Response(getAuthGatePage(), {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Validate token against Supabase
  try {
    const validateResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/validate-tool-access`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, tool_slug: toolSlug }),
      }
    );

    const result = await validateResponse.json();

    if (result.valid) {
      // Set session cookie and allow through
      const response = await context.next();

      // If token was in URL, set cookie and redirect to clean URL
      if (urlToken) {
        const cleanUrl = new URL(url);
        cleanUrl.searchParams.delete('token');

        return new Response(null, {
          status: 302,
          headers: {
            'Location': cleanUrl.pathname + cleanUrl.search,
            'Set-Cookie': `ecliptica_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`,
          },
        });
      }

      return response;
    }
  } catch (error) {
    console.error('Auth validation error:', error);
  }

  // Invalid token = show auth gate and clear any stale cookie
  return new Response(getAuthGatePage(), {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Set-Cookie': 'ecliptica_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
    },
  });
}

export const config = {
  path: '/*',
};
