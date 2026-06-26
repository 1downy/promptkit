#!/usr/bin/env node
// Generates public/sitemap.xml from the prompt data.
// Run: node scripts/generate-sitemap.mjs

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://promptkit.qzz.io';

// Dynamic import of the built system-prompts module
const mod = await import('../src/lib/promptkit/system-prompts.ts');
const { ALL_ENTRIES } = mod;

const urls = [
  `  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`,
  ...ALL_ENTRIES.map((entry) => `  <url>
    <loc>${BASE_URL}/model/${entry.id}</loc>
    <lastmod>${entry.lastVerified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

writeFileSync(resolve(__dirname, '../public/sitemap.xml'), xml);
console.log(`✓ Generated sitemap.xml with ${urls.length} URLs`);
