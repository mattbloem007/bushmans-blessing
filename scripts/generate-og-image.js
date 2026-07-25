#!/usr/bin/env node
/**
 * One-off: rasterize the branded static/og-image.svg to a 1200x630 PNG.
 * SVG-based og:image isn't supported by Twitter/X — this PNG is what
 * Seo.js falls back to by default. Re-run after editing the SVG.
 */

const path = require('path')
const sharp = require('sharp')

const SRC = path.resolve(__dirname, '../static/og-image.svg')
const DEST = path.resolve(__dirname, '../static/og-image.png')

sharp(SRC, { density: 144 })
  .resize(1200, 630)
  .png()
  .toFile(DEST)
  .then(() => console.log(`✓  Wrote ${DEST}`))
  .catch(err => {
    console.error('✗  Failed:', err.message)
    process.exit(1)
  })
