# Product photo pipeline

How the product images in `public/products/` were made from the supplied
product sheets (screenshots with several garments each). Python 3.11+.

```bash
python -m venv .venv && .venv/bin/pip install rembg onnxruntime opencv-python-headless pillow numpy ncnn
```

1. **Upscale** each sheet 4× with Real-ESRGAN x4plus (ncnn, runs on CPU). Get
   `realesrgan-x4plus.param/.bin` from the `realesrgan-ncnn-vulkan` release on
   GitHub (`xinntao/Real-ESRGAN`, v0.2.5.0, the `models/` folder).

   ```bash
   .venv/bin/python -I upscale.py MODELS_DIR sheets/3.png up4/src_3.png
   ```

2. **Cut out** every garment view. `SPEC` in `cut.py` lists each sheet's rows
   (y ranges in the original pixels) and which product, colour and view sits
   where, left to right. Garments that touch are split along the edge between
   them; a sleeve hidden behind its neighbour is mirrored back from the other
   side. Output: RGBA masters, `masters/{handle}/{colour}/{view}.png`.

   ```bash
   .venv/bin/python -I cut.py up4 masters
   ```

3. **Build the web images**: transparent cut-outs, 4:5 shots on dust, the
   night shot on the wire, plus `measure.json` with each product's `dims` and
   `hold` for `src/lib/commerce/mock/catalog.ts`. `kinds.json` maps each
   handle to `[kind, hangStyle]` from the catalog.

   ```bash
   .venv/bin/python -I assets.py masters ../../public/products measure.json
   .venv/bin/python -I details.py MODELS_DIR up4 ../../public/products   # PROWL close-ups
   ```

4. Rerun `npm run campaign` and `npm run og -- http://localhost:3000`.

With original photography (one garment per photo) skip the splitting: put each
photo through BiRefNet (`rembg`, model `birefnet-general-lite`) and step 3.
Keep the file names and nothing else in the site changes.
