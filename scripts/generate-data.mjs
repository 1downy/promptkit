#!/usr/bin/env node
// Generates public/data.json from the prompt data.
// Run: node scripts/generate-data.mjs

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const mod = await import('../src/lib/promptkit/system-prompts.ts');
const { ALL_ENTRIES, UNIQUE_PROVIDERS } = mod;

const payload = {
  entries: ALL_ENTRIES,
  providers: UNIQUE_PROVIDERS,
};

const out = resolve(__dirname, '../public/data.json');
writeFileSync(out, JSON.stringify(payload));
console.log(`✓ Generated data.json (${(Buffer.byteLength(JSON.stringify(payload)) / 1024 / 1024).toFixed(1)}MB)`);
