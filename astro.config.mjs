// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://sakura.phwu.work",
  output: "server",
  adapter: cloudflare(),

  i18n: {
    defaultLocale: "en",
    locales: ["en", { codes: ["zh-TW"], path: "zh" }],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  fonts: [
    {
      provider: fontProviders.google(),
      name: "Noto Sans",
      cssVariable: "--font-sans",
      weights: [400, 500, 700],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "Noto Sans TC",
      cssVariable: "--font-sans-tc",
      weights: [400, 500, 700],
      subsets: ["chinese-traditional"],
    },
  ],

  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
      config: {
        avif: { effort: 8, quality: 75 },
        webp: { effort: 6, quality: 80 },
      },
    },
  },

  security: {
    csp: {
      algorithm: "SHA-256",
      scriptDirective: {
        resources: ["'self'", "https://www.clarity.ms"],
      },
      directives: [
        "default-src 'self'",
        "connect-src 'self' https://*.clarity.ms https://dc.services.visualstudio.com",
        "img-src 'self' data: https://*.clarity.ms",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
