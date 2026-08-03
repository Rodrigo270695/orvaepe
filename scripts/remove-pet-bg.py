"""Remove checkerboard / mint glow background from VetSaaS robot pet."""
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

SRC = Path(
    r"C:\Users\rodri\.cursor\projects\d-Programacion-Laravel-LaraReact-vetsaas\assets"
    r"\c__Users_rodri_AppData_Roaming_Cursor_User_workspaceStorage_64a9479b11ccb4cf284e1907d54a5231_images_image-24863655-cb96-402c-a46a-024ee9ad9b3e.png"
)
OUT = Path(r"D:\Programacion\Laravel\LaraReact\orvaepe\public\images\vetsaas-robot-pet.png")
ASSETS = Path(
    r"C:\Users\rodri\.cursor\projects\d-Programacion-Laravel-LaraReact-vetsaas\assets\vetsaas-robot-pet.png"
)


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    arr = np.asarray(im).astype(np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    chroma = mx - mn

    near_white = (r > 230) & (g > 230) & (b > 230)
    near_gray = (np.abs(r - g) < 18) & (np.abs(g - b) < 18) & (lum > 160) & (lum < 230)
    mint_soft = (g >= 220) & (r >= 210) & (b >= 210) & (g >= r) & (lum > 215)

    h, w = lum.shape
    visited = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    def try_push(y: int, x: int) -> None:
        if y < 0 or x < 0 or y >= h or x >= w or visited[y, x]:
            return
        if lum[y, x] < 175:
            return
        visited[y, x] = True
        q.append((y, x))

    for x in range(w):
        try_push(0, x)
        try_push(h - 1, x)
    for y in range(h):
        try_push(y, 0)
        try_push(y, w - 1)

    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if ny < 0 or nx < 0 or ny >= h or nx >= w or visited[ny, nx]:
                continue
            if not (
                lum[ny, nx] >= 190
                or near_gray[ny, nx]
                or near_white[ny, nx]
                or mint_soft[ny, nx]
            ):
                continue
            is_teal = (
                g[ny, nx] > r[ny, nx] + 15
                and b[ny, nx] > 80
                and chroma[ny, nx] > 40
                and lum[ny, nx] < 210
            )
            is_face = lum[ny, nx] < 80
            if is_teal or is_face:
                continue
            visited[ny, nx] = True
            q.append((ny, nx))

    alpha = np.where(visited, 0, 255).astype(np.uint8)
    black_face = (lum < 55) & (chroma < 40)
    teal = (g > r + 20) & (chroma > 35) & (lum < 200)
    white_body = (lum > 210) & (chroma < 25) & (~visited)
    alpha = np.where(black_face | teal | white_body, 255, alpha)
    alpha = np.where(visited & ~(black_face | teal), 0, alpha)

    alpha_img = Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(radius=1.2))
    alpha = np.array(alpha_img)

    out_arr = arr.copy()
    out_arr[:, :, 3] = alpha
    for c in range(3):
        out_arr[:, :, c] = np.where(alpha < 8, 0, out_arr[:, :, c])

    result = Image.fromarray(out_arr.astype(np.uint8), "RGBA")
    bbox = result.getbbox()
    if bbox:
        result = result.crop(bbox)
        pad = 24
        canvas = Image.new("RGBA", (result.width + pad * 2, result.height + pad * 2), (0, 0, 0, 0))
        canvas.paste(result, (pad, pad), result)
        result = canvas

    OUT.parent.mkdir(parents=True, exist_ok=True)
    result.save(OUT)
    result.save(ASSETS)
    opaque = int(100 * (np.array(result)[:, :, 3] > 10).mean())
    print(f"saved {OUT} size={result.size} opaque%={opaque}")


if __name__ == "__main__":
    main()
