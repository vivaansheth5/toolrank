import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // This app lives in a sub-folder of another repo; pin the workspace root.
  turbopack: { root: path.resolve(__dirname) },
  outputFileTracingRoot: path.resolve(__dirname),
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 80],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920, 2560],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  // Art in public/ keeps its file name when it's replaced (real photos and
  // scene plates drop into the same paths), so cache for a day and refresh
  // in the background rather than forever.
  async headers() {
    const cache = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];
    return ["/scene/:path*", "/products/:handle/:colour/:file", "/campaign/:path*", "/textures/:path*", "/og/:path*"].map((source) => ({ source, headers: cache }));
  },
};

export default nextConfig;
