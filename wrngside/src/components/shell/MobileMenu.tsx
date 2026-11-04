"use client";

import { useRef } from "react";
import { nav, contact, site } from "@/lib/site-config";
import { ui, uiStore } from "@/lib/stores";
import { useStore } from "@/lib/store";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { TLink } from "@/components/ui/TLink";
import { Clock } from "./Clock";
import { InstagramIcon, MailIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { SoundToggle } from "@/components/sound/SoundToggle";

/** Full-screen ink overlay: clip-path wipe from the top, staggered display lines. */
export function MobileMenu() {
  const open = useStore(uiStore, (s) => s.menuOpen);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, { onEscape: ui.closeMenu });
  useScrollLock(open);
  return (
    <div id="mobile-menu" ref={ref} className="menu theme-night" data-open={open} role="dialog" aria-modal="true" aria-label="Menu" inert={!open} data-lenis-prevent>
      <nav className="menu-nav wrap" aria-label="Menu">
        <ul>
          {nav.mobile.map((l, i) => (
            <li key={l.href} style={{ "--i": i } as React.CSSProperties}>
              <TLink href={l.href} className="menu-link t-h1" onClick={() => ui.closeMenu()}>
                <span>{l.label}</span>
              </TLink>
            </li>
          ))}
        </ul>
        <button type="button" className="menu-search t-meta" onClick={ui.openSearch}>
          SEARCH THE WIRE →
        </button>
      </nav>
      <div className="menu-foot wrap t-meta">
        <a href={contact.instagram} target="_blank" rel="noreferrer" className="menu-social">
          <InstagramIcon size={16} /> INSTAGRAM
        </a>
        <a href={`https://wa.me/${contact.whatsappNumber}`} target="_blank" rel="noreferrer" className="menu-social">
          <WhatsAppIcon size={16} /> WHATSAPP
        </a>
        <a href={`mailto:${contact.email}`} className="menu-social">
          <MailIcon size={16} /> EMAIL
        </a>
        <span className="menu-sound">
          <SoundToggle /> SOUND
        </span>
        <span className="menu-clock">
          <Clock prefix={`${site.city} `} />
        </span>
      </div>
    </div>
  );
}
