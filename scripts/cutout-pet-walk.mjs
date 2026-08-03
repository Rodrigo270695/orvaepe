/**
 * Cutout walk frames: chroma green + remove teal ground plank.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const assets = path.resolve(
    'C:/Users/rodri/.cursor/projects/d-Programacion-Laravel-LaraReact-vetsaas/assets',
);
const outDir = path.join(root, 'public/images/vetsaas-pet-walk');

function isGreenScreen(r, g, b) {
    const maxRB = Math.max(r, b);
    const dominance = g - maxRB;
    if (dominance > 45 && g > 100) return true;
    if (dominance > 35 && g > 140 && g > r * 1.35 && g > b * 1.35) return true;
    if (g > 180 && r < 120 && b < 120 && dominance > 30) return true;
    return false;
}

/** Dark teal / forest green plank under the pet */
function isGroundPlank(r, g, b, y, height) {
    const inLower = y > height * 0.72;
    if (!inLower) return false;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    // Solid dark teal blocks (not white body, not cyan LEDs)
    const tealish = g > r + 8 && g >= b - 5 && g < 140 && lum < 95 && lum > 18;
    const veryDarkTeal = g > r && g > 25 && g < 90 && lum < 70 && Math.abs(g - b) < 40;
    return tealish || veryDarkTeal;
}

async function cutout(src, dest) {
    const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;
    const px = Buffer.from(data);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = y * width + x;
            const o = i * channels;
            const r = px[o];
            const g = px[o + 1];
            const b = px[o + 2];

            if (isGreenScreen(r, g, b) || isGroundPlank(r, g, b, y, height)) {
                px[o] = 0;
                px[o + 1] = 0;
                px[o + 2] = 0;
                px[o + 3] = 0;
                continue;
            }

            const dominance = g - Math.max(r, b);
            if (dominance > 20 && g > 90 && px[o + 3] > 0) {
                const factor = Math.min(1, (dominance - 20) / 60);
                px[o + 1] = Math.round(g * (1 - factor * 0.55) + Math.max(r, b) * factor * 0.55);
                px[o + 3] = Math.max(40, Math.round(px[o + 3] * (1 - factor * 0.35)));
            }
        }
    }

    await sharp(px, { raw: { width, height, channels } })
        .png()
        .trim({ threshold: 2 })
        .extend({
            top: 6,
            bottom: 6,
            left: 6,
            right: 6,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toFile(dest);
}

fs.mkdirSync(outDir, { recursive: true });

for (const n of [1, 2, 3, 4]) {
    const src = path.join(assets, `vetsaas-pet-walk-0${n}.png`);
    const dest = path.join(outDir, `frame-0${n}.png`);
    if (!fs.existsSync(src)) {
        console.error('missing', src);
        process.exit(1);
    }
    await cutout(src, dest);
    console.log('ok', dest);
}
