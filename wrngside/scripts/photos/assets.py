"""Build the storefront's product images from the RGBA masters.

usage: python -I assets.py MASTERS_DIR PUBLIC_PRODUCTS_DIR MEASURE_JSON [handle ...]

Per product colour, into PUBLIC/{handle}/{colour}/:
  cutout.webp       front view on transparent (THE LINE, Your Line, drop teaser)
  cutout-back.webp  back view on transparent (campaign art)
  front.webp, back.webp, side-*.webp   4:5 shots on dust, 12% padding
  model-1.webp      the piece hanging on a wire at night under a sodium lamp
and MEASURE_JSON: dims (cm) and hold (pegs, dropCm) measured off the front.
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageFilter

FW, FH = 1000, 1250  # 4:5 frame
PAD = 0.12  # matches lib/flight.ts landing box
DUST = np.array([0xDC, 0xD7, 0xCE], np.float32)

# Garment length on the line (cm), by kind; width follows the photo.
LENGTH_CM = {"tee": 74, "tank": 70, "layered": 74, "jersey": 72, "longjersey": 74, "polo": 72, "hoodie": 76, "jacket": 68, "sweatpants": 104}
LENGTH_OVERRIDE = {"one-of-1-hoodie": 64}


def rng(seed):
    return np.random.default_rng(seed)


def load(path):
    return np.array(Image.open(path).convert("RGBA")).astype(np.float32) / 255.0


def fit(rgba, box_w, box_h):
    h, w = rgba.shape[:2]
    k = min(box_w / w, box_h / h)
    im = Image.fromarray((rgba * 255).astype(np.uint8))
    im = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
    return np.array(im).astype(np.float32) / 255.0


def place(canvas_h, canvas_w, rgba, x, y):
    """RGBA layer the size of the canvas with rgba pasted at (x, y)."""
    layer = np.zeros((canvas_h, canvas_w, 4), np.float32)
    h, w = rgba.shape[:2]
    x0, y0 = max(0, x), max(0, y)
    x1, y1 = min(canvas_w, x + w), min(canvas_h, y + h)
    layer[y0:y1, x0:x1] = rgba[y0 - y : y1 - y, x0 - x : x1 - x]
    return layer


def over(dst_rgb, layer, opacity=1.0):
    a = layer[:, :, 3:4] * opacity
    return dst_rgb * (1 - a) + layer[:, :, :3] * a


def shadow(layer, dx, dy, blur, opacity, colour=(0, 0, 0)):
    a = layer[:, :, 3]
    a = np.roll(np.roll(a, dy, axis=0), dx, axis=1)
    a = cv2.GaussianBlur(a, (0, 0), blur)
    s = np.zeros_like(layer)
    s[:, :, :3] = np.array(colour, np.float32) / 255.0
    s[:, :, 3] = a
    return s, opacity


def grain(h, w, seed, strength):
    n = rng(seed).random((h, w)).astype(np.float32)
    n = cv2.GaussianBlur(n, (0, 0), 0.6)
    return np.clip(1.4 * n - 0.8, 0, 1)[:, :, None] * strength


def vignette(h, w, inner=0.6, amount=0.09, cy=0.45):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx - w * 0.5) / (w * 0.75)) ** 2 + ((yy - h * cy) / (h * 0.75)) ** 2)
    v = np.clip((r - inner) / (1 - inner), 0, 1)
    return (v * amount)[:, :, None]


def on_dust(rgba, seed):
    """A 4:5 product shot on dust, like scripts/art productFrame."""
    g = fit(rgba, FW * (1 - 2 * PAD), FH * (1 - 2 * PAD))
    h, w = g.shape[:2]
    layer = place(FH, FW, g, (FW - w) // 2, (FH - h) // 2)
    img = np.ones((FH, FW, 3), np.float32) * DUST / 255.0
    yy = np.linspace(0, 1, FH, dtype=np.float32)[:, None, None]
    # floor light: white 16% at the top fading to black 4% at the bottom
    img = img * (1 - 0.16 * (1 - yy)) + 1.0 * 0.16 * (1 - yy)
    img = img * (1 - 0.04 * yy)
    for dx, dy, blur, op in ((12, 32, 32, 0.16), (5, 11, 10, 0.18)):
        s, o = shadow(layer, dx, dy, blur, op)
        img = over(img, s, o)
    img = over(img, layer)
    img = img * (1 - vignette(FH, FW))
    img = img * (1 - grain(FH, FW, seed, 0.10))
    return img


def night(rgba, seed, hanger=False):
    """The piece on a wire at night under a sodium lamp (model-1 slot)."""
    H, W = FH, FW
    yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
    top, mid, bot = np.array([0x0E, 0x0F, 0x16]), np.array([0x1B, 0x17, 0x14]), np.array([0x0B, 0x0B, 0x0B])
    t = np.clip(yy / 0.55, 0, 1)
    u = np.clip((yy - 0.55) / 0.45, 0, 1)
    bg = np.where(yy < 0.55, top * (1 - t) + mid * t, mid * (1 - u) + bot * u)[:, None, :].repeat(W, 1) / 255.0
    img = bg.astype(np.float32)
    img[int(H * 0.38) : int(H * 0.94)] = np.array([0x24, 0x20, 0x1C]) / 255.0
    img[int(H * 0.38) : int(H * 0.38) + 7] *= 0.5
    img[int(H * 0.93) :] = np.array([0x0D, 0x0D, 0x0D]) / 255.0
    # sodium lamp glow
    Y, X = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.sqrt(((X - W * 0.72) / W) ** 2 + ((Y - H * 0.06) / H) ** 2) / 0.75
    glow = np.clip(1 - r, 0, 1) ** 1.6
    lamp = np.array([1.0, 0.6, 0.235], np.float32)
    img = img + glow[:, :, None] * lamp * 0.42
    hot = np.exp(-(((X - W * 0.76) / 70) ** 2 + ((Y - H * 0.03) / 70) ** 2))
    img = img + hot[:, :, None] * np.array([1.0, 0.82, 0.6]) * 0.5
    # wires
    wires = np.zeros((H, W), np.uint8)
    for (y0, ym, y1, th) in ((0.238, 0.262, 0.236, 6), (0.18, 0.214, 0.176, 4)):
        xs = np.linspace(-20, W + 20, 200)
        tt = (xs + 20) / (W + 40)
        ys = (1 - tt) ** 2 * y0 * H + 2 * (1 - tt) * tt * ym * H + tt**2 * y1 * H
        pts = np.stack([xs, ys], 1).astype(np.int32)
        cv2.polylines(wires, [pts], False, 255, th, cv2.LINE_AA)
    img = img * (1 - (wires[:, :, None] / 255.0) * 0.92)
    # the garment: warm key light from the lamp side, hung from the main wire
    g = fit(rgba, W * 0.66, H * 0.6)
    gh, gw = g.shape[:2]
    warm = g.copy()
    warm[:, :, :3] = np.clip(g[:, :, :3] * np.array([1.0, 0.9, 0.78]) * 0.92 + 0.02, 0, 1)
    gx = (W - gw) // 2
    gy = int(H * 0.25) + (int(H * 0.04) if hanger else -int(gh * 0.03))
    layer = place(H, W, warm, gx, gy)
    s, o = shadow(layer, 58, 38, 20, 0.55)
    img = over(img, s, o)
    if hanger:
        hook = np.zeros((H, W), np.uint8)
        cx = W // 2
        cv2.ellipse(hook, (cx + 10, gy - 28), (18, 18), 0, 180, 470, 255, 4, cv2.LINE_AA)
        cv2.line(hook, (cx, gy - 12), (cx, gy + 8), 255, 4, cv2.LINE_AA)
        img = over(img, np.dstack([np.ones((H, W, 3)) * np.array([0.55, 0.57, 0.58]), hook / 255.0]).astype(np.float32))
    img = over(img, layer)
    # grain and a touch of black
    n = rng(seed).random((H, W)).astype(np.float32)
    img = img + (np.clip(1.6 * n - 0.85, 0, 1) * 0.045)[:, :, None]
    img = img * 0.92
    return np.clip(img, 0, 1)


def save_webp(arr, path, q=84, alpha=False):
    path.parent.mkdir(parents=True, exist_ok=True)
    arr8 = (np.clip(arr, 0, 1) * 255 + 0.5).astype(np.uint8)
    im = Image.fromarray(arr8, "RGBA" if alpha else "RGB")
    im.save(path, "WEBP", quality=q, method=6, **({"alpha_quality": 90} if alpha else {}))


def cutout(rgba, max_h=1100):
    h, w = rgba.shape[:2]
    if h > max_h:
        rgba = fit(rgba, w * max_h / h + 1, max_h)
    return rgba


def top_profile(alpha):
    h, w = alpha.shape
    m = alpha > 0.5
    t = np.where(m.any(0), m.argmax(0), h)
    return t


def measure(rgba, handle, kind, hang):
    a = rgba[:, :, 3]
    h, w = a.shape
    Lcm = LENGTH_OVERRIDE.get(handle, LENGTH_CM[kind])
    cm = Lcm / h
    t = top_profile(a)

    def depth(f):
        x = int(np.clip(f * w, 0, w - 1))
        return float(np.median(t[max(0, x - 3) : x + 4]))

    if kind == "sweatpants":
        row = a[int(h * 0.02)] > 0.5
        xs = np.nonzero(row)[0]
        wl, wr = xs.min(), xs.max()
        pegs = [(wl + 0.1 * (wr - wl)) / w, (wr - 0.1 * (wr - wl)) / w]
        drop = max(depth(pegs[0]), depth(pegs[1]))
    elif kind == "tank":
        # the straps: the highest fabric either side of the neck
        lo = [int(w * 0.18), int(w * 0.44)]
        xl = lo[0] + int(np.argmin(t[lo[0] : lo[1]]))
        xr = w - 1 - (lo[0] + int(np.argmin(t[::-1][lo[0] : lo[1]])))
        pegs = [xl / w, xr / w]
        drop = max(depth(pegs[0]), depth(pegs[1]))
    elif hang == "hanger":
        pegs = [0.3, 0.7]
        drop = (depth(0.3) + depth(0.7)) / 2
    else:
        pegs = [0.28, 0.72]
        drop = max(depth(0.28), depth(0.72))
    return {
        "dims": {"w": round(w * cm, 1), "h": round(h * cm, 1)},
        "hold": {"pegs": [round(p, 3) for p in pegs], "dropCm": round(drop * cm, 1)},
    }


def main():
    masters, public, measure_path = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
    only = set(sys.argv[4:])
    kinds = json.loads((Path(__file__).parent / "kinds.json").read_text())
    measures = json.loads(measure_path.read_text()) if measure_path.exists() else {}
    for hdir in sorted(p for p in masters.iterdir() if p.is_dir()):
        handle = hdir.name
        if only and handle not in only:
            continue
        kind, hang, lead = kinds[handle]
        for cdir in sorted(p for p in hdir.iterdir() if p.is_dir()):
            colour = cdir.name
            out = public / handle / colour
            seed = abs(hash((handle, colour))) % 10000
            front = load(cdir / "front.png")
            save_webp(cutout(front), out / "cutout.webp", q=88, alpha=True)
            back_p = cdir / "back.png"
            if back_p.exists():
                save_webp(cutout(load(back_p)), out / "cutout-back.webp", q=86, alpha=True)
            for view in sorted(cdir.glob("*.png")):
                save_webp(on_dust(load(view), seed), out / f"{view.stem}.webp", q=84)
            # THE LINE, the night shot and the measurements use the side the print is on.
            hung = load(cdir / f"{lead}.png") if (cdir / f"{lead}.png").exists() else front
            save_webp(night(hung, seed, hanger=hang == "hanger"), out / "model-1.webp", q=78)
            if colour == sorted(p.name for p in hdir.iterdir() if p.is_dir())[0] or handle not in measures:
                measures[handle] = measure(hung, handle, kind, hang)
            print(handle, colour, measures[handle], flush=True)
    measure_path.write_text(json.dumps(measures, indent=1))


if __name__ == "__main__":
    main()
