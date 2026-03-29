/**
 * Genera iconos PNG para PWA desde public/logo/orvae-icon-negative-512.png
 *
 * - `icon-{n}.png` → purpose **any** (escritorio / pestaña / barra de tareas): círculo
 *   blanco centrado (estilo Httpie), esquinas transparentes, logo más presente.
 * - `icon-maskable-{n}.png` → purpose **maskable** (Android/iOS al instalar): fondo
 *   blanco a todo el cuadrado y logo más grande que antes (~68% del lado) para que
 *   compita visualmente con Netflix/Brave (puede acercarse al borde en máscaras muy redondas).
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

/** Escritorio: círculo blanco (radio relativo al lado del canvas). */
const ANY_CIRCLE_RADIUS_RATIO = 0.42;
/** Logo dentro del círculo (any): ~58% del lado para que llene bien el badge. */
const ANY_LOGO_RATIO = 0.58;

/** Móvil/tablet maskable: logo más grande (antes ~56%). */
const MASKABLE_LOGO_RATIO = 0.68;

function svgWhiteFullSquare(size) {
    return Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="100%" height="100%" fill="#ffffff"/>
</svg>`,
        'utf8',
    );
}

function svgWhiteCircle(size) {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * ANY_CIRCLE_RADIUS_RATIO;
    return Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff"/>
</svg>`,
        'utf8',
    );
}

await mkdir(outDir, { recursive: true });

for (const size of sizes) {
    const destAny = path.join(outDir, `icon-${size}.png`);

    const logoAnyBox = Math.max(16, Math.round(size * ANY_LOGO_RATIO));
    const logoAnyBuf = await sharp(src)
        .resize(logoAnyBox, logoAnyBox, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();

    const circleBuf = await sharp(Buffer.from(svgWhiteCircle(size)))
        .resize(size, size)
        .png()
        .toBuffer();

    await sharp({
        create: {
            width: size,
            height: size,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    })
        .composite([
            { input: circleBuf, gravity: 'center' },
            { input: logoAnyBuf, gravity: 'center' },
        ])
        .png()
        .toFile(destAny);
    console.log(`OK ${destAny}`);

    const logoMaskBox = Math.max(16, Math.round(size * MASKABLE_LOGO_RATIO));
    const logoMaskBuf = await sharp(src)
        .resize(logoMaskBox, logoMaskBox, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();

    const bgBuf = await sharp(Buffer.from(svgWhiteFullSquare(size)))
        .resize(size, size)
        .png()
        .toBuffer();

    const destMask = path.join(outDir, `icon-maskable-${size}.png`);
    await sharp(bgBuf)
        .composite([{ input: logoMaskBuf, gravity: 'center' }])
        .png()
        .toFile(destMask);
    console.log(`OK ${destMask}`);
}

console.log('Iconos PWA generados (any + maskable).');
