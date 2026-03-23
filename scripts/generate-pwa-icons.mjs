/**
 * Genera iconos PNG para PWA desde public/logo/orvae-icon-negative-512.png
 * Ejecutar: npm run pwa:icons
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'public/logo/orvae-icon-negative-512.png');
const outDir = path.join(root, 'public/icons/pwa');

/** Tamaños habituales PWA + Apple touch */
const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

await mkdir(outDir, { recursive: true });

for (const size of sizes) {
    const dest = path.join(outDir, `icon-${size}.png`);
    await sharp(src)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(dest);
    console.log(`OK ${dest}`);
}

console.log('Iconos PWA generados.');
