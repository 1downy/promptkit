#!/usr/bin/env node
/**
 * Post-build CSS optimizer.
 *
 * 1. Inlines critical CSS via Critters (extracts above-the-fold styles)
 * 2. Converts remaining <link rel="stylesheet"> to non-blocking:
 *    <link rel="stylesheet" media="print" onload="this.media='all'">
 *
 * Run: node scripts/optimize-css.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const htmlPath = resolve(root, 'out/index.html');

let html = readFileSync(htmlPath, 'utf8');

// --- Step 1: Inline critical CSS via Critters ---
// Critters works on the final HTML. It extracts <link> stylesheets,
// determines above-the-fold selectors, and inlines them in <style>.
const critters = (await import('critters')).default;
const critter = new critters({
  path: resolve(root, 'out'),
  // don't change external URLs — just inline critical CSS
  reduceInlineStyles: true,
  // keep preload links; we handle async loading in step 2
  preload: 'media',
  // log what's happening
  logLevel: 'warn',
});

html = await critter.process(html);

// --- Step 2: Make remaining external stylesheets non-blocking ---
// After Critters, any remaining <link rel="stylesheet"> is non-critical.
// Convert them to <link rel="stylesheet" media="print" onload="this.media='all'">
// to prevent render blocking.
html = html.replace(
  /<link\s+([^>]*?)rel="stylesheet"([^>]*?)>/gi,
  (match, before, after) => {
    // Skip if already async or inline
    if (match.includes('media=') || match.includes('onload=')) return match;
    return `<link ${before}rel="stylesheet" media="print" onload="this.media='all'; this.onload=null" ${after}>`;
  },
);

writeFileSync(htmlPath, html);

const origSize = readFileSync(htmlPath, 'utf8').length;
console.log(`✓ CSS optimized: ${(origSize / 1024).toFixed(1)}KB written to out/index.html`);
