import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const logoPath = join(publicDir, 'logo.png');

const BRAND_BLUE = { r: 46, g: 93, b: 167, alpha: 1 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

async function generateFromLogo() {
  if (!existsSync(logoPath)) {
    console.warn('logo.png not found — skipping logo-based icons');
    return false;
  }

  const sizes = [192, 512];

  for (const size of sizes) {
  // Standard icon — white background, logo centered
    await sharp(logoPath)
      .resize(size, size, {
        fit: 'contain',
        background: WHITE,
      })
      .png()
      .toFile(join(publicDir, `pwa-${size}x${size}.png`));

    console.log(`Created pwa-${size}x${size}.png from logo`);
  }

  // Maskable icon — blue background, logo at 80% safe zone
  const maskableSize = 512;
  const inner = Math.round(maskableSize * 0.72);
  await sharp(logoPath)
    .resize(inner, inner, {
      fit: 'contain',
      background: WHITE,
    })
    .extend({
      top: Math.floor((maskableSize - inner) / 2),
      bottom: Math.ceil((maskableSize - inner) / 2),
      left: Math.floor((maskableSize - inner) / 2),
      right: Math.ceil((maskableSize - inner) / 2),
      background: BRAND_BLUE,
    })
    .png()
    .toFile(join(publicDir, 'pwa-maskable-512x512.png'));

  console.log('Created pwa-maskable-512x512.png from logo');

  // Favicon 32x32
  await sharp(logoPath)
    .resize(32, 32, { fit: 'contain', background: WHITE })
    .png()
    .toFile(join(publicDir, 'favicon-32.png'));

  console.log('Created favicon-32.png from logo');
  return true;
}

await generateFromLogo();
