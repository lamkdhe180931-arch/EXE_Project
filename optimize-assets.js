// One-off image optimizer (build-time tooling, not shipped).
// Resizes + re-encodes referenced PNG assets IN PLACE (same filenames),
// so no HTML/CSS references need to change. Originals are recoverable via git.
//   node optimize-assets.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Display-driven max widths. Source art is 2000-2160px; the site never shows
// these above ~1200px, logos far smaller. Retina-safe caps below.
const PLAN = {
  'logo-dark.png': 600,
  'logo-light.png': 600,
  'ao-meo-no-1.png': 1200,
  'ao-meo-no-2.png': 1200,
  'mu.png': 1200,
  'mu-xanh.png': 1200,
  'so-tay.png': 1200,
  'ao-artdict.png': 1200,
  'ao-do-de-choi.png': 1200,
  'art-1.png': 1400,
  'art-3.png': 1400,
  'art-4.png': 1400,
};

const dir = path.join(__dirname, 'assets');

(async () => {
  let before = 0, after = 0;
  for (const [file, maxW] of Object.entries(PLAN)) {
    const p = path.join(dir, file);
    if (!fs.existsSync(p)) { console.log(file.padEnd(20), 'MISSING — skip'); continue; }
    const sizeBefore = fs.statSync(p).size;
    const buf = await sharp(p)
      .resize({ width: maxW, withoutEnlargement: true })
      .png({ palette: true, quality: 80, effort: 10, compressionLevel: 9 })
      .toBuffer();
    fs.writeFileSync(p, buf);
    const sizeAfter = fs.statSync(p).size;
    before += sizeBefore; after += sizeAfter;
    const pct = ((1 - sizeAfter / sizeBefore) * 100).toFixed(0);
    console.log(file.padEnd(20),
      (sizeBefore / 1024 / 1024).toFixed(2) + 'MB', '->',
      (sizeAfter / 1024).toFixed(0) + 'KB', `(-${pct}%)`);
  }
  console.log('\nTOTAL', (before / 1024 / 1024).toFixed(2) + 'MB', '->',
    (after / 1024 / 1024).toFixed(2) + 'MB',
    `(-${((1 - after / before) * 100).toFixed(0)}%)`);
})();
