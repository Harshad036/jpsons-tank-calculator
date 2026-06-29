import { existsSync, unlinkSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

/** Matches --bg in index.css (#f4f7fb) */
const PAGE_BG = { r: 244, g: 247, b: 251, alpha: 1 };
const PAGE_BG_HEX = '#f4f7fb';

/**
 * Replace near-white pixels so PNG backgrounds blend with the app page.
 */
async function replaceNearWhiteBg(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const threshold = 228;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i] = PAGE_BG.r;
      data[i + 1] = PAGE_BG.g;
      data[i + 2] = PAGE_BG.b;
      data[i + 3] = 255;
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .flatten({ background: PAGE_BG })
    .png()
    .toFile(outputPath);
}

async function processAsset(filename) {
  const path = join(publicDir, filename);
  if (!existsSync(path)) {
    console.warn(`Skipping ${filename} — file not found`);
    return;
  }

  const tempPath = join(publicDir, `_process_${filename}`);
  await replaceNearWhiteBg(path, tempPath);
  unlinkSync(path);
  renameSync(tempPath, path);
  console.log(`Processed ${filename} with page background ${PAGE_BG_HEX}`);
}

const assets = ['logo.png', 'mixing-tank.png', 'jacketed-mixing-tank.png', 'agitator.png'];

for (const asset of assets) {
  await processAsset(asset);
}
