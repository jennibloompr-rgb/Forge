// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

// The Forge ships as a static-first site with a single server endpoint
// (/api/unlock) that captures partner leads and returns the tier data.
// Keeping that data server-side is deliberate: partner pricing must never
// appear in the initially-rendered, crawlable HTML (see the handoff README).
//
// The endpoint runs as a Netlify Function; every page is prerendered static.
export default defineConfig({
  site: 'https://weforgepartnerships.com',
  output: 'static',
  adapter: netlify(),
  trailingSlash: 'never',
});
