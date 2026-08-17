#!/usr/bin/env node
/**
 * Bundles third-party libraries that need to run in the browser but ship no
 * ready-to-use browser build. Currently just `qrcode`, for the sync-code
 * feature — bundled rather than hand-written so the actual QR encoding (finder
 * patterns, Reed-Solomon error correction, mask selection) comes from a
 * battle-tested library instead of a one-off reimplementation.
 *
 * Output goes to src/vendor/, which Eleventy passthrough-copies to /vendor/.
 * Not committed — CI runs this before the site build, same as `npm ci`.
 */
import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';

mkdirSync('src/vendor', { recursive: true });

await build({
  entryPoints: ['node_modules/qrcode/lib/browser.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  globalName: 'QRCode',
  platform: 'browser',
  outfile: 'src/vendor/qrcode.js',
});

console.log('wrote src/vendor/qrcode.js');
