import { defineMiddleware } from "astro:middleware";

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

function buildCSP(nonce: string): string {
  const directives = [
    "default-src 'self'",
    // 'self' covers Astro's bundled scripts; nonce covers our explicit tags;
    // strict-dynamic trusts scripts loaded by nonced scripts (Clarity chain);
    // unsafe-inline is ignored by nonce-aware browsers (fallback for old ones only)
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline'`,
    "connect-src 'self' https://*.clarity.ms https://dc.services.visualstudio.com",
    "img-src 'self' data: https://*.clarity.ms",
    "font-src 'self'",
    "media-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
  ];
  return directives.join("; ");
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const nonce = generateNonce();
  ctx.locals.cspNonce = nonce;

  const response = await next();

  // Only enforce CSP in production; keep dev unrestricted for hot-reload
  if (!import.meta.env.DEV) {
    response.headers.set("Content-Security-Policy", buildCSP(nonce));
  }

  response.headers.set("Strict-Transport-Security", "max-age=31536000");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()",
  );

  return response;
});
