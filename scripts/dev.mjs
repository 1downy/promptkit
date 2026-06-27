#!/usr/bin/env node
// Start the Next.js dev server.
// Run: node scripts/dev.mjs

import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const dev = spawn('npx next dev', {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});

dev.on('close', (code) => {
  process.exit(code ?? 0);
});
