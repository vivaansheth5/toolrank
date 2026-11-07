"""PROWL close-ups from sheet 4: crop the three detail panels from the 4x
sheet, run a second Real-ESRGAN pass, cover-crop to 4:5 and save as WebP.
usage: python -I details.py MODEL_DIR UP4_DIR PUBLIC_PRODUCTS_DIR"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
sys.path.insert(0, str(Path(__file__).parent))
from upscale import load, upscale

model_dir, up4, public = sys.argv[1:4]
K = 4
PANELS = {"detail-print": (359, 365, 441, 469), "detail-waist": (359, 486, 441, 574), "detail-fabric": (359, 593, 441, 679)}
net = load(model_dir)
sheet = np.array(Image.open(f"{up4}/src_4.png").convert("RGB"))
out = Path(public) / "prowl-sweatpants" / "black"
out.mkdir(parents=True, exist_ok=True)
for name, (x0, y0, x1, y1) in PANELS.items():
    inset = 2 * K
    crop = sheet[y0 * K + inset : y1 * K - inset, x0 * K + inset : x1 * K - inset]
    big = Image.fromarray(upscale(net, np.ascontiguousarray(crop)))
    w, h = big.size
    # cover-crop to 4:5
    if w / h > 0.8:
        nw = int(h * 0.8); big = big.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / 0.8); big = big.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    big = big.resize((1000, 1250), Image.LANCZOS)
    big.save(out / f"{name}.webp", "WEBP", quality=84, method=6)
    print(name, crop.shape, "->", big.size)
