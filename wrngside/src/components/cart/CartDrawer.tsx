"use client";

import { useRef, useState } from "react";
import { ui, uiStore, toast } from "@/lib/stores";
import { useStore } from "@/lib/store";
import { useCart, useCartCount, cartActions } from "@/lib/commerce/cart";
import { getProductSync, variantFor } from "@/lib/commerce";
import { addToBag } from "@/lib/commerce/actions";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { commerce, copy } from "@/lib/site-config";
import { formatPrice } from "@/lib/format";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/ui/Icons";
import { TLink } from "@/components/ui/TLink";
import { ProductImage } from "@/components/ui/ProductImage";
import { ChargeMeter } from "./ChargeMeter";
import { announce } from "@/components/shell/Announcer";
import { useNavigate } from "@/components/shell/PageTransition";

export function CartDrawer() {
  const open = useStore(uiStore, (s) => s.cartOpen);
  const count = useCartCount();
  const panel = useRef<HTMLElement>(null);
  useFocusTrap(panel, open, { onEscape: ui.closeCart });
  useScrollLock(open);

  return (
    <div className="drawer-root" data-open={open}>
      <div className="drawer-backdrop" onClick={ui.closeCart} aria-hidden="true" />
      <aside ref={panel} className="drawer theme-day" role="dialog" aria-modal="true" aria-labelledby="cart-title" inert={!open} data-lenis-prevent>
        <header className="drawer-head">
          <h2 id="cart-title" className="t-h3">
            YOUR BAG <span className="t-mono tabular">({count})</span>
          </h2>
          <button type="button" className="icon-btn" onClick={ui.closeCart} aria-label="Close bag">
            <CloseIcon />
          </button>
        </header>

        <CartBody />
      </aside>
    </div>
  );
}

/** Bag contents: shared by the drawer and the /cart page. */
export function CartBody({ page = false }: { page?: boolean }) {
  const cart = useCart();
  const navigate = useNavigate();
  const [noteOpen, setNoteOpen] = useState(Boolean(cart.note));
  const subtotal = Number(cart.cost.subtotalAmount.amount);
  const upsell = getProductSync(commerce.upsellHandle);
  const showUpsell = upsell && upsell.availableForSale && !cart.lines.some((l) => l.merchandise.product.handle === upsell.handle);
  const upsellSize = upsell?.wrng.sizes.find((s) => s.available)?.label;
  void page;
  return (
    <>
        {cart.lines.length === 0 ? (
        <div className="drawer-empty">
          <svg viewBox="0 0 300 120" className="empty-wire" aria-hidden="true">
            <path d="M0 30 Q150 70 300 30" />
            <path d="M140 52 l4 -14 m8 14 l-4 -14" className="peg" />
          </svg>
          <p className="t-h2">{copy.emptyBag}</p>
          <TLink href="/" className="btn btn-signal" onClick={ui.closeCart}>
            {copy.ctas.shopTheLine}
          </TLink>
        </div>
      ) : (
        <>
          <ChargeMeter subtotal={subtotal} />
          <ul className="drawer-lines" aria-label="Items in your bag">
            {cart.lines.map((l) => {
              const p = getProductSync(l.merchandise.product.handle);
              const size = l.merchandise.selectedOptions.find((o) => o.name === "Size")?.value;
              const colour = l.merchandise.selectedOptions.find((o) => o.name === "Colour")?.value;
              const unit = Number(l.cost.amountPerQuantity.amount);
              const stock = p && colour && size ? (variantFor(p, colour, size)?.quantityAvailable ?? commerce.maxQtyPerLine) : commerce.maxQtyPerLine;
              const max = Math.min(commerce.maxQtyPerLine, stock);
              return (
                <li key={l.id} className="line-item">
                  <TLink href={`/products/${l.merchandise.product.handle}`} className="line-item-img" onClick={ui.closeCart} tabIndex={-1} aria-hidden="true">
                    <ProductImage src={l.merchandise.product.featuredImage.url} alt="" sizes="96px" tint={p?.wrng.colours[0].hex} />
                  </TLink>
                  <div className="line-item-body">
                    <div className="line-item-top">
                      <TLink href={`/products/${l.merchandise.product.handle}`} className="line-item-title" onClick={ui.closeCart}>
                        {l.merchandise.product.title} <span className="text-muted">{p?.wrng.type}</span>
                      </TLink>
                      <span className="t-mono-lg tabular">{formatPrice(Number(l.cost.totalAmount.amount))}</span>
                    </div>
                    <p className="t-meta text-muted">
                      {colour} · SIZE {size} {l.quantity > 1 && `· ${formatPrice(unit)} EACH`}
                    </p>
                    <div className="line-item-actions">
                      <div className="stepper" role="group" aria-label={`Quantity for ${l.merchandise.product.title}`}>
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={l.quantity <= 1}
                          onClick={() => {
                            cartActions.update(l.id, l.quantity - 1);
                            announce(`Quantity ${l.quantity - 1}`);
                          }}
                        >
                          <MinusIcon />
                        </button>
                        <span className="tabular" aria-live="polite">
                          {l.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={l.quantity >= max}
                          onClick={() => {
                            cartActions.update(l.id, l.quantity + 1);
                            announce(`Quantity ${l.quantity + 1}`);
                          }}
                        >
                          <PlusIcon />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="t-meta link-u"
                        onClick={() => {
                          const snap = cartActions.remove(l.id);
                          announce(`${l.merchandise.product.title} removed from bag.`);
                          if (snap) toast(`${copy.removed}: ${l.merchandise.product.title}`, { action: { label: copy.undo, onClick: () => cartActions.restore(snap) }, duration: 5000 });
                        }}
                      >
                        REMOVE
                      </button>
                    </div>
                    {l.quantity >= max && max < commerce.maxQtyPerLine && <p className="t-meta text-muted">THAT&apos;S ALL WE HAVE IN {size}.</p>}
                  </div>
                </li>
              );
            })}
          </ul>

          {showUpsell && upsellSize && (
            <div className="upsell">
              <div className="upsell-img">
                <ProductImage src={upsell.featuredImage.url} alt="" sizes="64px" tint={upsell.wrng.colours[0].hex} />
              </div>
              <p className="t-meta">FINISH THE FIT</p>
              <button type="button" className="btn btn-sm" onClick={() => addToBag(upsell, upsell.wrng.colours[0].name, upsellSize, { quiet: true })}>
                ADD {upsell.title} {upsell.wrng.type.split(" ")[0].toUpperCase()} — {formatPrice(upsell.wrng.price)}
              </button>
            </div>
          )}

          <div className="note">
            <button type="button" className="t-meta note-toggle" aria-expanded={noteOpen} onClick={() => setNoteOpen((v) => !v)}>
              {noteOpen ? "— " : "+ "}ADD A NOTE TO YOUR ORDER
            </button>
            {noteOpen && (
              <textarea className="input" rows={3} maxLength={500} placeholder="Gift? Delivery instructions? Tell us." defaultValue={cart.note} onBlur={(e) => cartActions.setNote(e.target.value)} aria-label="Order note" />
            )}
          </div>

          <footer className="drawer-foot">
            <div className="drawer-total">
              <span className="t-meta">SUBTOTAL</span>
              <span className="t-mono-lg tabular">{formatPrice(subtotal)}</span>
            </div>
            <button
              type="button"
              className="btn btn-signal btn-block"
              onClick={() => {
                ui.closeCart();
                void navigate(cart.checkoutUrl);
              }}
            >
              {copy.ctas.checkout} — {formatPrice(subtotal)}
            </button>
            <ul className="pay-row" aria-label="Payment methods">
              {commerce.paymentMethods.map((m) => (
                <li key={m} className="pay-chip">
                  {m}
                </li>
              ))}
            </ul>
            <p className="t-meta text-muted">Taxes included. Shipping calculated at checkout.</p>
          </footer>
        </>
      )}
    </>
  );
}
