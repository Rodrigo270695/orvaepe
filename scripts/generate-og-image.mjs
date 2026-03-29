/**
 * Genera imagen Open Graph recomendada 1200×630 (PNG) para previews en redes y buscadores.
 * Ejecutar: pnpm run seo:og-image
 *
 * Usa el logo horizontal claro sobre fondo oscuro (coherente con theme-color del sitio).
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const W = 1200;
const H = 630;
const BG = { r: 15, g: 23, b: 42 }; // #0f172a (manifest background_color oscuro)

const candidates = [
    path.join(root, 'public/logo/orvae-logo-h-transparent-light.png'),
    path.join(root, 'public/logo/orvae-logo-h-transparent-dark.png'),
    path.join(root, 'public/icons/pwa/icon-512.png'),
];

const outDir = path.join(root, 'public/images/og');
const outFile = path.join(outDir, 'orvae-og-default.png');

await mkdir(outDir, { recursive: true });

let logoPath = null;
for (const p of candidates) {
    try {
        await sharp(p).metadata();
        logoPath = p;
        break;
    } catch {
        /* siguiente candidato */
    }
}

if (!logoPath) {
    console.error('No se encontró ningún logo para la imagen OG.');
    process.exit(1);
}

const base = sharp({
    create: {
        width: W,
        height: H,
        channels: 3,
        background: BG,
    },
});

const logoSharp = sharp(logoPath);
const meta = await logoSharp.metadata();
const srcW = meta.width ?? 512;
const maxLogoW = path.basename(logoPath).includes('icon') ? 280 : 720;
const scale = Math.min(1, maxLogoW / srcW);
const targetW = Math.round(srcW * scale);

const resizedBuf = await logoSharp
    .resize({
        width: targetW,
        fit: 'inside',
        withoutEnlargement: true,
    })
    .png()
    .toBuffer();

const rmeta = await sharp(resizedBuf).metadata();
const tw = rmeta.width ?? targetW;
const th = rmeta.height ?? 200;
const left = Math.round((W - tw) / 2);
const top = Math.round((H - th) / 2);

await base
    .composite([{ input: resizedBuf, left, top }])
    .png({ compressionLevel: 9 })
    .toFile(outFile);

console.log(`OK ${outFile} (${W}×${H}) desde ${path.relative(root, logoPath)}`);
