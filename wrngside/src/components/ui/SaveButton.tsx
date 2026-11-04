"use client";

import { PegIcon } from "./Icons";
import { useIsSaved } from "@/lib/stores";
import { toggleSaveWithToast } from "@/lib/commerce/actions";
import type { Product } from "@/lib/commerce/types";
import { ui } from "@/lib/site-config";
import { fill } from "@/lib/format";

/** The save icon is a clothes peg: saving "pegs" a product to YOUR LINE. */
export function SaveButton({ product, className = "", withLabel = false }: { product: Product; className?: string; withLabel?: boolean }) {
  const saved = useIsSaved(product.handle);
  return (
    <button
      type="button"
      className={`save-btn ${className}`}
      aria-pressed={saved}
      aria-label={fill(saved ? ui.common.unpegLabel : ui.common.pegLabel, { title: product.title })}
      data-saved={saved || undefined}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaveWithToast(product);
      }}
    >
      <PegIcon filled={saved} size={20} />
      {withLabel && <span className="t-meta">{saved ? ui.common.pegged : ui.common.peg}</span>}
    </button>
  );
}
