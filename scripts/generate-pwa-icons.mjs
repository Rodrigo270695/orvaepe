/**
 * Genera iconos PNG para PWA desde public/logo/orvae-icon-negative-512.png
 *
 * - `icon-{n}.png` → purpose **any** (escritorio / pestaña): mismo recorte que antes.
 * - `icon-maskable-{n}.png` → purpose **maskable** (Android/iOS home): fondo BLANCO,
 *   logo más pequeño centrado en zona segura (~56% del lado) para que al aplicar
 *   máscara circular/squircle no se recorte y, al ser el logo azul, tenga más contraste.
 *
 * Ejecutar: pnpm run pwa:icons
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

function svgWhiteBackground(size) {
    return Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="100%" height="100%" fill="#ffffff"/>
</svg>`,
        'utf8',
    );
}

await mkdir(outDir, { recursive: true });

for (const size of sizes) {
    const destAny = path.join(outDir, `icon-${size}.png`);
    await sharp(src)
        .resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(destAny);
    console.log(`OK ${destAny}`);

    /** Logo cabe en círculo inscrito en ~80% del canvas (recomendación maskable W3C). */
    const logoBox = Math.max(16, Math.round(size * 0.56));
    const logoBuf = await sharp(src)
        .resize(logoBox, logoBox, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();

    const bgBuf = await sharp(svgWhiteBackground(size))
        .resize(size, size)
        .png()
        .toBuffer();

    const destMask = path.join(outDir, `icon-maskable-${size}.png`);
    await sharp(bgBuf)
        .composite([{ input: logoBuf, gravity: 'center' }])
        .png()
        .toFile(destMask);
    console.log(`OK ${destMask}`);
}

console.log('Iconos PWA generados (any + maskable).');
