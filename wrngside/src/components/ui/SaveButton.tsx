"use client";

import { PegIcon } from "./Icons";
import { useIsSaved } from "@/lib/stores";
import { toggleSaveWithToast } from "@/lib/commerce/actions";
import type { Product } from "@/lib/commerce/types";

/** The save icon is a clothes peg: saving "pegs" a product to YOUR LINE. */
export function SaveButton({ product, className = "", withLabel = false }: { product: Product; className?: string; withLabel?: boolean }) {
  const saved = useIsSaved(product.handle);
  return (
    <button
      type="button"
      className={`save-btn ${className}`}
      aria-pressed={saved}
      aria-label={saved ? `Unpeg ${product.title} from your line` : `Peg ${product.title} to your line`}
      data-saved={saved || undefined}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaveWithToast(product);
      }}
    >
      <PegIcon filled={saved} size={20} />
      {withLabel && <span className="t-meta">{saved ? "PEGGED" : "PEG IT"}</span>}
    </button>
  );
}
