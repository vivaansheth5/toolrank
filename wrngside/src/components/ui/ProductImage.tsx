"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

/**
 * Product image on a dust well. Fades in from a blurred colour placeholder and
 * never pops. `tint` seeds the placeholder until real blurDataURLs exist.
 *
 * Priority images (the first row, often the LCP element) are visible from the
 * server HTML and paint the moment they arrive: their fade would otherwise
 * wait for JavaScript to hydrate.
 */
export function ProductImage({
  src,
  alt,
  sizes,
  tint = "#8c8984",
  priority = false,
  className = "",
  fit = "cover",
  onReady,
}: {
  src: string;
  alt: string;
  sizes: string;
  tint?: string;
  priority?: boolean;
  className?: string;
  fit?: "cover" | "contain";
  onReady?: () => void;
}) {
  const [loaded, setLoaded] = useState(priority);
  const ref = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete && img.naturalWidth > 0) {
        setLoaded(true);
        onReady?.();
      }
    },
    [onReady],
  );
  return (
    <div className={`pimg ${className}`} data-loaded={loaded || undefined} style={{ "--tint": tint } as React.CSSProperties}>
      <span className="pimg-ph" aria-hidden="true" />
      <Image
        ref={ref}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={priority}
        loading={priority ? "eager" : "lazy"}
        draggable={false}
        className="pimg-img"
        style={{ objectFit: fit }}
        onLoad={() => {
          setLoaded(true);
          onReady?.();
        }}
      />
    </div>
  );
}
