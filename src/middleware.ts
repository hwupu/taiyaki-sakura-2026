import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (_ctx, next) => {
  const response = await next();
  // Start with 1-year max-age; add includeSubDomains + preload once ready for the preload list
  response.headers.set('Strict-Transport-Security', 'max-age=31536000');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
});
