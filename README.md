# Taiyaki Sakura

Minecraft server website — bilingual (EN / 中文), deployed on Cloudflare Workers via Astro 6.4 SSR.

## Commands

| Command | Action |
| :--- | :--- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start local dev server at `localhost:4321` |
| `pnpm build` | Build for production to `./dist/` |
| `pnpm preview` | Preview production build locally |
| `pnpm optimize-images` | Convert `src/images/*.png` → AVIF + WebP + PNG in `public/images/` |

## Image optimization

Images are **not** optimized automatically on `dev` or `build`. Run `pnpm optimize-images` manually after adding or changing source images in `src/images/`.

Source images live in `src/images/` and are not served directly — the optimized outputs in `public/images/` are what gets deployed. Commit both the source and the optimized outputs.

## i18n

- `/` — English (default, no prefix)
- `/zh/` — Traditional Chinese

## Deployment

Deployed to Cloudflare Workers. Run `npx wrangler deploy` after `pnpm build`, or push to the branch connected to your Cloudflare Pages / Workers CI.
