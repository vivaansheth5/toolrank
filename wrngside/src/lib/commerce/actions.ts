"use client";

import { cartActions, cartStore } from "./cart";
import { variantFor } from "./index";
import type { Product } from "./types";
import { toast, ui, toggleSaved } from "../stores";
import { copy } from "../site-config";
import { announce } from "@/components/shell/Announcer";
import { sound } from "@/components/sound/sound";
import { hasFinePointer } from "../device";

/** Add a size to the bag with the standard feedback (toast, live region, sound). */
export function addToBag(p: Product, colourName: string, size: string, opts: { openDrawer?: boolean; quiet?: boolean } = {}) {
  const v = variantFor(p, colourName, size);
  if (!v || !v.availableForSale) return false;
  cartActions.add(p.handle, v.id, 1);
  sound.play("add");
  const count = cartStore.get().lines.reduce((a, l) => a + l.quantity, 0);
  announce(`${p.title} ${p.wrng.type}, ${colourName}, size ${size}, added to bag. ${count} ${count === 1 ? "item" : "items"} in bag.`);
  const desktop = hasFinePointer();
  if (opts.openDrawer && desktop) {
    ui.openCart();
  } else if (!opts.quiet) {
    toast(`${copy.added}: ${p.title} / ${size}`, { action: { label: copy.ctas.viewBag, onClick: ui.openCart } });
  }
  return true;
}

export function toggleSaveWithToast(p: Product) {
  const saved = toggleSaved(p.handle);
  sound.play("peg");
  toast(saved ? `${copy.saved}: ${p.title}` : `${copy.unsaved}: ${p.title}`, {
    action: { label: copy.undo, onClick: () => toggleSaved(p.handle) },
  });
  announce(saved ? `${p.title} pegged to your line.` : `${p.title} removed from your line.`);
  return saved;
}
