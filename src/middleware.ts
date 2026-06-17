import { defineMiddleware } from "astro:middleware";

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

function buildCSP(nonce: string): string {
  return [
    "default-src 'none'",
    // nonce covers all script tags (injected below); strict-dynamic trusts scripts
    // Clarity loads dynamically; unsafe-inline is ignored by nonce-aware browsers
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline'`,
    // unsafe-inline needed for inline style= attributes set by Clarity at runtime
    "style-src 'self'",
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
  ].join("; ");
}

const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

export const onRequest = defineMiddleware(async (ctx, next) => {
  const nonce = generateNonce();
  ctx.locals.cspNonce = nonce;

  const response = await next();
  const contentType = response.headers.get("content-type") ?? "";

  if (!import.meta.env.DEV && contentType.includes("text/html")) {
    const html = await response.text();

    // Inject nonce into every <script> and <style> tag that doesn't already have one.
    // This covers Astro's own inlined component scripts and the Font component's <style>.
    const patched = html
      .replace(/<script(?![^>]*\bnonce=)/g, `<script nonce="${nonce}"`)
      .replace(/<style(?![^>]*\bnonce=)/g, `<style nonce="${nonce}"`);

    const headers = new Headers(response.headers);
    headers.set("Content-Security-Policy", buildCSP(nonce));
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);

    return new Response(patched, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  // Non-HTML responses (assets, API): skip CSP, just add security headers
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(k, v);
  }
  return response;
});
