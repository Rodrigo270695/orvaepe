/**
 * Green-screen only cutout — never keys white/black body parts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = path.resolve(
    'C:/Users/rodri/.cursor/projects/d-Programacion-Laravel-LaraReact-vetsaas/assets/vetsaas-robot-pet-chroma.png',
);
const out = path.join(root, 'public/images/vetsaas-robot-pet.png');

if (!fs.existsSync(src)) {
    console.error('missing', src);
    process.exit(1);
}

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const px = Buffer.from(data);

function isGreenScreen(r, g, b) {
    // Subject can have teal metal: those have lower green dominance vs pure #0f0 screen
    const maxRB = Math.max(r, b);
    const dominance = g - maxRB;
    // Strong chroma green (screen)
    if (dominance > 45 && g > 100) return true;
    // Mid green screen (slightly darker/shaded)
    if (dominance > 35 && g > 140 && g > r * 1.35 && g > b * 1.35) return true;
    // Bright saturated green
    if (g > 180 && r < 120 && b < 120 && dominance > 30) return true;
    return false;
}

let keyed = 0;
for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const r = px[o];
    const g = px[o + 1];
    const b = px[o + 2];

    if (isGreenScreen(r, g, b)) {
        px[o] = 0;
        px[o + 1] = 0;
        px[o + 2] = 0;
        px[o + 3] = 0;
        keyed++;
        continue;
    }

    // Despill green fringe on kept pixels (only if clearly contaminated)
    const dominance = g - Math.max(r, b);
    if (dominance > 20 && g > 90 && px[o + 3] > 0) {
        const factor = Math.min(1, (dominance - 20) / 60);
        px[o + 1] = Math.round(g * (1 - factor * 0.55) + Math.max(r, b) * factor * 0.55);
        px[o + 3] = Math.max(40, Math.round(px[o + 3] * (1 - factor * 0.35)));
    }
}

// Flood only pure transparent-connected green leftovers from edges
const visited = new Uint8Array(width * height);
const stack = [];
const tryPush = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (visited[i]) return;
    const o = i * channels;
    const a = px[o + 3];
    const r = px[o];
    const g = px[o + 1];
    const b = px[o + 2];
    if (a === 0 || isGreenScreen(r, g, b)) {
        visited[i] = 1;
        stack.push(i);
    }
};
for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
}
for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
}
while (stack.length) {
    const i = stack.pop();
    px[i * channels + 3] = 0;
    px[i * channels] = 0;
    px[i * channels + 1] = 0;
    px[i * channels + 2] = 0;
    const x = i % width;
    const y = (i / width) | 0;
    tryPush(x + 1, y);
    tryPush(x - 1, y);
    tryPush(x, y + 1);
    tryPush(x, y - 1);
}

await sharp(px, { raw: { width, height, channels } })
    .png()
    .trim({ threshold: 2 })
    .extend({
        top: 24,
        bottom: 24,
        left: 24,
        right: 24,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toFile(out);

const check = await sharp(out).ensureAlpha().metadata();
console.log({ out, keyedPct: Math.round((100 * keyed) / (width * height)), meta: check });
