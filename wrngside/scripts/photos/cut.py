"""Cut every garment view out of the 4x-upscaled product sheets.

usage: python -I cut.py UP4_DIR OUT_DIR [stage1|stage2|all] [image numbers...]

Each sheet is split into rows (original-pixel y ranges below); each row holds
N garments left to right. A coarse mask per row (isnet) finds the pieces;
pieces that touch are split along a minimum-cost seam that follows the visible
edge between them.

stage1 (heavy, ~7 GB, run alone): per garment crop, cache two mattes
(BiRefNet and isnet) plus the seam ownership and body axis.
stage2 (light): combine the mattes with a background-colour key, fill holes,
mirror back a sleeve hidden by the neighbour, decontaminate the edge against
the local background and save RGBA masters: OUT/{handle}/{colour}/{view}.png
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

K = 4  # upscale factor of the sheets
_sessions = {}
KINDS = json.loads((Path(__file__).parent / "kinds.json").read_text())


def session(name):
    if name not in _sessions:
        import onnxruntime as ort

        so = ort.SessionOptions()
        so.enable_cpu_mem_arena = False
        so.enable_mem_pattern = False
        _sessions[name] = new_session(name, sess_opts=so)
    return _sessions[name]

T = lambda h, c: [f"{h}/{c}/front", f"{h}/{c}/back"]
SIDES = lambda h, c: [f"{h}/{c}/front", f"{h}/{c}/back", f"{h}/{c}/side-left", f"{h}/{c}/side-right"]

SPEC = {
    1: [((40, 262), T("flash-studded-tank", "black"))],
    2: [((8, 240), T("eight-ball-tank", "black")), ((355, 580), T("07-archives-tank", "black"))],
    3: [((20, 340), T("blessed-sweatpants", "sky-blue")), ((385, 650), SIDES("starfall-sweatpants", "black-red"))],
    4: [((20, 316), SIDES("euphoria-sweatpants", "heather-grey")), ((355, 690), T("prowl-sweatpants", "black"))],
    5: [((4, 332), T("crazy-days-sweatpants", "black")), ((375, 688), SIDES("baroque-sweatpants", "black"))],
    6: [((40, 296), T("portugal-07-jersey", "cream-red")), ((378, 632), T("portugal-07-long-sleeve-jersey", "cream-red"))],
    7: [((20, 296), T("argentina-10-long-sleeve-jersey", "sky-blue")), ((388, 672), T("spain-19-jersey", "red-yellow"))],
    8: [((28, 354), T("away-days-23-jersey", "navy-pink")), ((400, 690), T("argentina-10-jersey", "sky-blue"))],
    9: [((18, 291), T("germany-11-polo", "white-black")), ((404, 702), T("france-10-jersey", "white-red"))],
    10: [((18, 264), T("japan-18-polo", "white-black")), ((378, 652), T("england-07-polo", "white-red"))],
    11: [((44, 299), T("angel-wings-denim-jacket", "light-wash")), ((416, 673), T("starlit-nights-jacket", "washed-black"))],
    12: [((26, 299), T("blossom-denim-jacket", "light-wash")), ((368, 641), T("baroque-denim-jacket", "washed-black"))],
    13: [((28, 332), T("amour-amor-hoodie", "washed-brown")), ((358, 526), ["one-of-1-hoodie/black/front"]), ((526, 697), ["one-of-1-hoodie/black/back"])],
    14: [((8, 316), T("dragon-hoodie", "black")), ((347, 666), T("batfang-hoodie", "washed-black"))],
    15: [((44, 305), T("obscura-layered-tee", "black-grey")), ((382, 619), T("obscura-layered-tee", "black"))],
    16: [((72, 337), T("black-hole-tee", "washed-black")), ((365, 628), T("night-web-system-tee", "black"))],
    17: [((64, 437), T("perception-tee", "black"))],
}
# Rows where the x range is limited (detail panels sit to the right).
XRANGE = {(4, 1): (0, 352), (3, 1): (60, 460), (5, 1): (0, 520)}


def matte(rgb, model):
    """rembg alpha (uint8) for an RGB crop."""
    out = remove(Image.fromarray(rgb), session=session(model), post_process_mask=False)
    return np.array(out)[:, :, 3]


def dp_seam(C, max_step=2, lat=0.03):
    H, W = C.shape
    acc = C[0].copy()
    back = np.zeros((H, W), np.int8)
    for y in range(1, H):
        best = np.full(W, np.inf, np.float32)
        arg = np.zeros(W, np.int8)
        for d in range(-max_step, max_step + 1):
            sh = np.full(W, np.inf, np.float32)
            if d > 0:
                sh[d:] = acc[: W - d]
            elif d < 0:
                sh[: W + d] = acc[-d:]
            else:
                sh[:] = acc
            val = sh + lat * abs(d)
            m = val < best
            best[m] = val[m]
            arg[m] = d
        acc = best + C[y]
        back[y] = arg
    x = int(np.argmin(acc))
    path = np.zeros(H, int)
    path[-1] = x
    for y in range(H - 1, 0, -1):
        x = x - int(back[y, x])
        path[y - 1] = x
    return path


def split_component(mask, gray, n):
    """Split one merged component (bool HxW, already cropped to the row) into n parts."""
    H, W = mask.shape
    ys, xs = np.nonzero(mask)
    xa, xb = xs.min(), xs.max() + 1
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    E = np.sqrt(gx * gx + gy * gy)
    E = np.clip(E / (np.percentile(E[mask], 97) + 1e-6), 0, 1)
    cost = mask.astype(np.float32) * (1.0 - 0.85 * E) + 0.002
    cols = np.convolve(mask.sum(0).astype(float), np.ones(15) / 15, mode="same")
    span = xb - xa
    seams = []
    for j in range(1, n):
        c0 = xa + span * j / n
        band = int(span * 0.14)
        lo, hi = int(max(xa + 1, c0 - band)), int(min(xb - 1, c0 + band))
        c = lo + int(np.argmin(cols[lo:hi]))
        b2 = int(span * 0.09)
        x0, x1 = max(0, c - b2), min(W, c + b2)
        path = dp_seam(cost[:, x0:x1].astype(np.float32))
        seams.append(x0 + path)
    xx = np.arange(W)[None, :]
    part = np.zeros((H, W), np.int32)
    for s in seams:
        part += (xx > s[:, None]).astype(np.int32)
    return [mask & (part == k) for k in range(n)], seams


def largest(mask, keep_frac=0.02):
    n, lab, st, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8)
    if n <= 1:
        return mask
    areas = st[1:, cv2.CC_STAT_AREA]
    big = areas.max()
    keep = np.zeros(n, bool)
    keep[1:] = areas >= big * keep_frac
    # only keep islands touching the biggest's bbox neighbourhood
    return keep[lab]


def stage1_row(img, ni, ri, y0, y1, names, cache):
    """Split a row into garments and cache both mattes for each crop."""
    if all((cache / f"{n.replace('/', '__')}.npz").exists() for n in names):
        print(f"  row {ri}: cached", flush=True)
        return
    Hf, Wf, _ = img.shape
    xr = XRANGE.get((ni, ri))
    X0, X1 = (xr[0] * K, xr[1] * K) if xr else (0, Wf)
    Y0, Y1 = y0 * K, min(y1 * K, Hf)
    row = img[Y0:Y1, X0:X1]
    # Union of both mattes: isnet misses white bodies on pale backdrops,
    # BiRefNet sometimes drops plain black next to a loud print.
    a = np.maximum(matte(row, "isnet-general-use"), matte(row, "birefnet-general-lite"))
    m = a > 128
    n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8), 8)
    comps = [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > 0.004 * m.size and st[i, cv2.CC_STAT_HEIGHT] > 0.25 * m.shape[0]]
    comps.sort(key=lambda i: st[i, cv2.CC_STAT_LEFT])
    N = len(names)
    gray = cv2.cvtColor(row, cv2.COLOR_RGB2GRAY).astype(np.float32)
    widths = [st[i, cv2.CC_STAT_WIDTH] for i in comps]
    total_w = sum(widths)
    counts = [max(1, round(w / total_w * N)) for w in widths] if comps else []
    while sum(counts) > N:
        counts[int(np.argmin([w / c for w, c in zip(widths, counts)]))] -= 1
    while sum(counts) < N:
        counts[int(np.argmax([w / c for w, c in zip(widths, counts)]))] += 1
    parts, was_split = [], []
    for i, c in zip(comps, counts):
        cm = lab == i
        if c == 1:
            parts.append(cm)
            was_split.append(False)
        else:
            ps, _ = split_component(cm, gray, c)
            parts.extend(ps)
            was_split.extend([True] * c)
    if len(parts) != N:
        raise SystemExit(f"image {ni} row {ri}: got {len(parts)} parts for {N}")
    parts = [largest(p) for p in parts]
    dists = [cv2.distanceTransform((~p).astype(np.uint8), cv2.DIST_L2, 5) for p in parts]
    owner = np.argmin(np.stack(dists), axis=0)
    for k, (p, name) in enumerate(zip(parts, names)):
        dest = cache / f"{name.replace('/', '__')}.npz"
        if dest.exists():
            continue
        ys, xs = np.nonzero(p)
        bx0, bx1, by0, by1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        pad = int(0.04 * max(bx1 - bx0, by1 - by0))
        axis = -1.0
        if was_split[k]:
            # Body axis from the hem rows (sleeves never reach them); the crop
            # is symmetric about it so a hidden sleeve can be mirrored back.
            hem = [y for y in range(by1 - 1, by0 + int((by1 - by0) * 0.8), -1) if p[y].any()]
            mids = [(np.nonzero(p[y])[0].min() + np.nonzero(p[y])[0].max()) / 2 for y in hem[3:]]
            axis = float(np.median(mids))
            R = int(max(axis - bx0, bx1 - axis)) + pad
            bx0, bx1 = int(axis - R) + pad, int(axis + R) - pad
        cx0, cy0 = max(0, bx0 - pad), max(0, by0 - pad)
        cx1, cy1 = min(row.shape[1], bx1 + pad), min(row.shape[0], by1 + pad)
        crop = row[cy0:cy1, cx0:cx1]
        a_bi = matte(crop, "birefnet-general-lite")
        a_is = matte(crop, "isnet-general-use")
        own = owner[cy0:cy1, cx0:cx1] == k
        np.savez_compressed(
            dest, box=np.array([X0 + cx0, Y0 + cy0, X0 + cx1, Y0 + cy1]), own=own, axis=np.array([axis - cx0 if axis >= 0 else -1.0]),
            a_bi=a_bi, a_is=a_is, img=np.array([ni]),
        )
        print(f"  cached {name}", flush=True)


def fill_holes(mask, crop, B):
    """Fill enclosed holes that look like fabric, not background, and any tiny
    enclosed hole (a matte dropout in white fabric)."""
    inv = (~mask).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(inv, 4)
    H, W = mask.shape
    out = mask.copy()
    d = np.linalg.norm(crop.astype(np.float32) - B[None, None, :], axis=2)
    total = max(1, int(mask.sum()))
    for i in range(1, n):
        x, y, w, h, area = st[i]
        if x == 0 or y == 0 or x + w >= W or y + h >= H:
            continue  # touches the border: outside
        region = lab == i
        if area < 0.0025 * total or np.median(d[region]) > 28:
            out |= region
    return out


def stage2_one(entry, up4_imgs, out_dir):
    name = entry.stem.replace("__", "/")
    z = np.load(entry)
    x0, y0, x1, y1 = z["box"]
    ni = int(z["img"][0])
    crop = up4_imgs(ni)[y0:y1, x0:x1]
    own = z["own"]
    own = cv2.morphologyEx(own.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)).astype(bool)
    a_bi = z["a_bi"].astype(np.float32) / 255
    a_is = z["a_is"].astype(np.float32) / 255
    ml = np.maximum(a_bi, a_is)
    # Background colour and how clean it is (studio sweep vs concrete).
    bgm = (ml < 0.02) & own
    if bgm.sum() < 200:
        bgm = ml < 0.02
    bg_px = crop[bgm].astype(np.float32)
    B = np.median(bg_px, axis=0)
    C = crop.astype(np.float32)
    # A smooth backdrop field (sweeps darken toward the floor, panels vignette):
    # blur the background pixels only, normalised by their weight.
    wgt = cv2.erode(bgm.astype(np.uint8), np.ones((7, 7), np.uint8)).astype(np.float32)
    sig = max(C.shape[:2]) / 18
    num = cv2.GaussianBlur(C * wgt[:, :, None], (0, 0), sig)
    den = cv2.GaussianBlur(wgt, (0, 0), sig)[:, :, None]
    Bf = np.where(den > 1e-3, num / np.maximum(den, 1e-3), B[None, None, :])
    d = np.linalg.norm(C - Bf, axis=2)
    # How clean the backdrop is right around the garment (panel edges and
    # captions further out don't count).
    ring = cv2.dilate((ml > 0.5).astype(np.uint8), np.ones((61, 61), np.uint8)).astype(bool) & bgm
    spread = float(np.percentile(d[ring if ring.sum() > 200 else bgm], 95))
    lo = max(34.0, spread * 1.6)
    a_key = np.clip((d - lo) / 50.0, 0, 1)
    if spread > 22:
        # Busy background: only let the key refine the edge of the ML mask.
        near_ml = cv2.dilate((ml > 0.5).astype(np.uint8), np.ones((15, 15), np.uint8)).astype(bool)
        a_key = a_key * near_ml
    a = np.maximum(ml, a_key) * own
    # Background that the mattes swallowed (the gap between trouser legs):
    # flood in from the border through pixels that match the backdrop.
    kind = KINDS.get(name.split("/")[0], ["tee"])[0]
    light = float(np.median(C.mean(2)[ml > 0.9])) > 170 if (ml > 0.9).any() else False
    # White and pale tops shade into the backdrop: flooding would eat folds.
    if kind == "sweatpants" or (spread <= 22 and not light):
        bgish = (d < max(11.0, min(spread, 22) * 1.15)).astype(np.uint8)
        nb, lb = cv2.connectedComponents(bgish, connectivity=4)
        border = np.unique(np.concatenate([lb[0], lb[-1], lb[:, 0], lb[:, -1]]))
        outside = np.isin(lb, border[border > 0])
        if kind == "sweatpants":
            # The gap between the legs is closed off by the floor shadow under
            # the hems, so it never touches the border: drop any sizeable
            # backdrop-coloured pocket in the lower part of the trousers.
            ys_, xs_ = np.nonzero(a > 0.5)
            top_y = ys_.min() + 0.3 * (ys_.max() - ys_.min())
            st_ = cv2.connectedComponentsWithStats(bgish, connectivity=4)[2]
            for i in range(1, nb):
                x, y, w, h, area = st_[i]
                if area > 0.0006 * bgish.size and y + h / 2 > top_y:
                    outside |= lb == i
        outside = cv2.morphologyEx(outside.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)).astype(bool)
        a = a * ~outside
    core = largest(a > 0.5, keep_frac=0.004)
    core = fill_holes(core, crop, B)
    near = cv2.dilate(core.astype(np.uint8), np.ones((9, 9), np.uint8)).astype(bool)
    a = np.maximum(a, core.astype(np.float32)) * near * own
    aa = np.clip((a - 0.06) / 0.88, 0, 1)
    # Dark garments: a pale rim of backdrop or floor glow along the edge reads
    # as a white outline. Drop edge pixels that look like the backdrop.
    lum = C.mean(2)
    if np.median(lum[core]) < 110:
        inner = cv2.erode((aa > 0.5).astype(np.uint8), np.ones((9, 9), np.uint8)).astype(bool)
        rim = (aa > 0) & ~inner
        pale = rim & (d < max(30.0, min(spread, 60.0)))
        aa = np.where(pale, 0.0, aa)
        # The light line under a dark hem (the backdrop's floor glow caught in
        # the photo): per column, a short pale run at the very bottom with dark
        # fabric right above it goes.
        dark_ref = float(np.median(lum[core]))
        solid = aa > 0.5
        has = solid.any(0)
        bottom = np.where(has, solid.shape[0] - 1 - np.argmax(solid[::-1], axis=0), -1)
        for x in np.nonzero(has)[0]:
            b = int(bottom[x])
            y = b
            while y > b - 26 and y >= 0 and lum[y, x] > dark_ref + 70:
                y -= 1
            if b - y >= 2 and y > b - 26 and y >= 0 and lum[y, x] < dark_ref + 40:
                aa[y + 1 : b + 1, x] = 0.0
        aa = cv2.GaussianBlur(aa, (0, 0), 0.7)
    safe = np.maximum(aa, 0.05)[:, :, None]
    F = (C - (1 - safe) * Bf) / safe
    edge = (aa > 0) & (aa < 0.98)
    Cout = C.copy()
    Cout[edge] = np.clip(F[edge], 0, 255)
    filled = 0
    ax0 = float(z["axis"][0])
    if ax0 >= 0 and kind != "sweatpants":  # sleeves only
        W_ = aa.shape[1]
        solid = aa > 0.5
        rows = np.nonzero(solid.any(1))[0]
        top, bot = int(rows.min()), int(rows.max())
        # Centre line from the collar (top 3%), which the neighbour never covers.
        band = solid[top : top + max(4, int(0.03 * (bot - top)))]
        xs_ = np.nonzero(band.any(0))[0]
        ax = (xs_.min() + xs_.max()) / 2 if xs_.size else ax0
        X = np.arange(W_) - ax
        near = cv2.dilate(solid.astype(np.uint8), np.ones((61, 61), np.uint8)).astype(bool)
        notown = (~own) & near
        lc, rc = int(notown[:, : int(ax)].sum()), int(notown[:, int(ax) :].sum())
        if max(lc, rc) > 500:
            sgn = 1 if rc > lc else -1  # the side the neighbour was on
            clean = sgn * X < 0
            # Body half-width and full reach, measured on the untouched side.
            r0, r1 = top + int(0.6 * (bot - top)), top + int(0.9 * (bot - top))
            edges = [np.abs(X[np.nonzero(solid[y] & clean)[0]]).max() for y in range(r0, r1) if (solid[y] & clean).any()]
            torso = float(np.median(edges)) if edges else 0.3 * W_
            cl = np.nonzero(solid.any(0) & clean)[0]
            reach = float(np.abs(X[cl]).max()) if cl.size else torso
            src = np.round(2 * ax - np.arange(W_)).astype(int)
            ok = (src >= 0) & (src < W_)
            mir_a = np.zeros_like(aa)
            mir_c = np.zeros_like(Cout)
            mir_a[:, ok] = aa[:, src[ok]]
            mir_c[:, ok] = Cout[:, src[ok]]
            hidden = (~own) & (mir_a > aa + 0.05)
            hidden = cv2.morphologyEx(hidden.astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8)).astype(bool)
            filled = int(hidden.sum())
            side = sgn * X
            # The body is symmetric: where the mirror has body and this side
            # doesn't (white fabric the matte lost against a pale backdrop),
            # take the body back with the photo's own pixels. Rows below the
            # armpits only, inside the measured body width.
            body_rows = np.zeros(aa.shape[0], bool)
            body_rows[top + int(0.45 * (bot - top)) : bot + 1] = True
            body = body_rows[:, None] & (np.abs(X) <= torso * 0.985)[None, :] & (mir_a > aa + 0.1) & (d > 12)
            if body.any():
                aa = np.where(body, np.maximum(aa, mir_a), aa)
                Cout = np.where(body[:, :, None], C, Cout)
            # ...and the other way round: below the sleeves, anything on the
            # near side that the far side doesn't mirror is backdrop or the
            # neighbour's body.
            low = np.zeros(aa.shape[0], bool)
            low[top + int(0.55 * (bot - top)) : bot + 1] = True
            extra = low[:, None] & (side > 0)[None, :] & (aa > mir_a + 0.3)
            if extra.any():
                aa = np.where(extra, mir_a, aa)
            if filled > 1500:
                # Part of the near sleeve was hidden: rebuild everything past
                # the body edge as a mirror of the far sleeve (patching only the
                # hidden bit leaves a doubled cuff).
                ramp = np.clip((side - torso * 1.01) / 14.0, 0, 1)[None, :]
                aa = aa * (1 - ramp) + mir_a * ramp
                Cout = Cout * (1 - ramp[:, :, None]) + mir_c * ramp[:, :, None]
            elif filled:
                soft = cv2.GaussianBlur(hidden.astype(np.float32), (0, 0), 1.5)
                aa = np.maximum(aa, mir_a * soft)
                Cout = Cout * (1 - soft[:, :, None]) + mir_c * soft[:, :, None]
            # Nothing of this garment reaches further out than its far side.
            cut = np.clip(1 - (side - reach * 1.03) / 10.0, 0, 1)[None, :]
            aa = aa * np.where(side[None, :] > 0, cut, 1.0)
    rgba = np.dstack([Cout, aa * 255]).astype(np.uint8)
    ys2, xs2 = np.nonzero(aa > 0.02)
    rgba = rgba[ys2.min(): ys2.max() + 1, xs2.min(): xs2.max() + 1]
    dest = Path(out_dir) / f"{name}.png"
    dest.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba).save(dest)
    print(f"  {name}: {rgba.shape[1]}x{rgba.shape[0]} bg={B.astype(int).tolist()} spread={spread:.0f}{' mirrored ' + str(filled) if filled else ''}", flush=True)


def main():
    up4, out_dir = sys.argv[1], sys.argv[2]
    stage = sys.argv[3] if len(sys.argv) > 3 else "all"
    which = [int(v) for v in sys.argv[4:]] or sorted(SPEC)
    cache = Path(out_dir).parent / "cache"
    cache.mkdir(parents=True, exist_ok=True)
    imgs = {}

    def get(ni):
        if ni not in imgs:
            imgs[ni] = np.array(Image.open(f"{up4}/src_{ni}.png").convert("RGB"))
        return imgs[ni]

    if stage in ("stage1", "all"):
        for ni in which:
            print(f"image {ni}", flush=True)
            for ri, ((y0, y1), names) in enumerate(SPEC[ni]):
                stage1_row(get(ni), ni, ri, y0, y1, names, cache)
            imgs.clear()
    if stage in ("stage2", "all"):
        for entry in sorted(cache.glob("*.npz")):
            if int(np.load(entry)["img"][0]) in which:
                stage2_one(entry, get, out_dir)


if __name__ == "__main__":
    main()
