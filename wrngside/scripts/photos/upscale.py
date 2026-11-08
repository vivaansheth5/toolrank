"""Real-ESRGAN x4plus (ncnn, CPU) upscaler with overlapping tiles.
usage: python -I upscale.py MODEL_DIR IN OUT [x0 y0 x1 y1]"""
import sys, time
import numpy as np
import ncnn
from PIL import Image

def load(model_dir, threads=4):
    net = ncnn.Net()
    net.opt.use_vulkan_compute = False
    net.opt.num_threads = threads
    net.load_param(f"{model_dir}/realesrgan-x4plus.param")
    net.load_model(f"{model_dir}/realesrgan-x4plus.bin")
    return net

def upscale(net, rgb, tile=160, pad=16, scale=4):
    H, W, _ = rgb.shape
    out = np.zeros((H * scale, W * scale, 3), np.float32)
    for y0 in range(0, H, tile):
        for x0 in range(0, W, tile):
            y1, x1 = min(y0 + tile, H), min(x0 + tile, W)
            py0, px0, py1, px1 = max(y0 - pad, 0), max(x0 - pad, 0), min(y1 + pad, H), min(x1 + pad, W)
            crop = np.ascontiguousarray(rgb[py0:py1, px0:px1])
            m = ncnn.Mat.from_pixels(crop, ncnn.Mat.PixelType.PIXEL_RGB, px1 - px0, py1 - py0)
            m.substract_mean_normalize([], [1 / 255.0] * 3)
            ex = net.create_extractor()
            ex.input("data", m)
            _, o = ex.extract("output")
            o = np.array(o).transpose(1, 2, 0)
            oy, ox = (y0 - py0) * scale, (x0 - px0) * scale
            out[y0 * scale:y1 * scale, x0 * scale:x1 * scale] = o[oy:oy + (y1 - y0) * scale, ox:ox + (x1 - x0) * scale]
    return np.clip(out * 255 + 0.5, 0, 255).astype(np.uint8)

if __name__ == "__main__":
    model_dir, src, dst = sys.argv[1:4]
    im = Image.open(src).convert("RGBA")
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    im = Image.alpha_composite(bg, im).convert("RGB")
    if len(sys.argv) > 4:
        im = im.crop(tuple(int(v) for v in sys.argv[4:8]))
    t = time.time()
    out = upscale(load(model_dir), np.array(im))
    Image.fromarray(out).save(dst)
    print(f"{src} {im.size} -> {out.shape[1]}x{out.shape[0]} in {time.time() - t:.1f}s")
