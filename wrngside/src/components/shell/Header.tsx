"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { TLink } from "@/components/ui/TLink";
import { Logo } from "@/components/ui/Logo";
import { RollLabel } from "@/components/ui/Roll";
import { nav, ui as uiCopy } from "@/lib/site-config";
import { ui, uiStore } from "@/lib/stores";
import { useStore } from "@/lib/store";
import { useCartCount } from "@/lib/commerce/cart-store";
import { SoundToggle } from "@/components/sound/SoundToggle";
import { SearchIcon } from "@/components/ui/Icons";
import { fill } from "@/lib/format";

/** Rolling bag count: the old number slides up, the new one rises from below. */
function CountRoll({ value }: { value: number }) {
  const [state, setState] = useState({ cur: value, prev: null as number | null, key: 0 });
  const mounted = useRef(0);
  useEffect(() => {
    mounted.current = performance.now();
  }, []);
  useEffect(() => {
    setState((s) => (s.cur === value ? s : { cur: value, prev: performance.now() - mounted.current < 400 ? null : s.cur, key: s.key + 1 }));
  }, [value]);
  return (
    <span className="count-roll tabular" aria-hidden="true">
      {state.prev !== null && (
        <span key={`p${state.key}`} className="count-roll-prev">
          {state.prev}
        </span>
      )}
      <span key={`c${state.key}`} className={state.prev !== null ? "count-roll-cur is-anim" : "count-roll-cur"}>
        {state.cur}
      </span>
    </span>
  );
}

function BagButton() {
  const count = useCartCount();
  const ref = useRef<HTMLButtonElement>(null);
  const last = useRef(count);
  useEffect(() => {
    if (count > last.current && ref.current) {
      const el = ref.current;
      el.classList.remove("bump");
      void el.offsetWidth;
      el.classList.add("bump");
    }
    last.current = count;
  }, [count]);
  return (
    <button ref={ref} type="button" className="hdr-link roll-host bag-btn" data-bag-target onClick={ui.openCart} aria-label={fill(uiCopy.shell.bagLabel, { n: count, items: count === 1 ? uiCopy.shell.item : uiCopy.shell.items })} aria-haspopup="dialog">
      <span aria-hidden="true" className="roll-wrap">
        <RollLabel text={uiCopy.shell.bag} />
      </span>
      <span aria-hidden="true" className="bag-count">
        (<CountRoll value={count} />)
      </span>
    </button>
  );
}

/** Fixed header (difference blend so it reads over anything). Hides on scroll down after 120px. */
export function Header() {
  const menuOpen = useStore(uiStore, (s) => s.menuOpen);
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    let lastY = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const dy = y - lastY;
      if (Math.abs(dy) < 4) return;
      const hide = y > 120 && dy > 0 && !uiStore.get().menuOpen;
      html.dataset.header = hide ? "hidden" : "shown";
      lastY = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.header = "shown";
    ui.closeMenu();
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header" data-menu={menuOpen || undefined}>
      <div className="hdr-row">
        <nav className="hdr-left" aria-label="Primary">
          <button type="button" className="hdr-link hdr-menu-btn roll-host" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={ui.toggleMenu}>
            <RollLabel text={menuOpen ? uiCopy.shell.close : uiCopy.shell.menu} />
          </button>
          <ul className="hdr-nav">
            {nav.left.map((l) => (
              <li key={l.href}>
                <TLink href={l.href} className="hdr-link roll-host" aria-current={isActive(l.href) ? "page" : undefined}>
                  <RollLabel text={l.label} />
                </TLink>
              </li>
            ))}
          </ul>
        </nav>
        <TLink href="/" className="hdr-logo" aria-label={uiCopy.shell.logoLabel}>
          <Logo />
        </TLink>
        <div className="hdr-right">
          <SoundToggle />
          <button type="button" className="hdr-link roll-host hdr-search" onClick={ui.openSearch} aria-label={uiCopy.shell.searchLabel} aria-haspopup="dialog">
            <span className="hdr-search-text" aria-hidden="true">
              <RollLabel text={uiCopy.shell.search} />
            </span>
            <SearchIcon className="hdr-search-icon" />
          </button>
          <TLink href="/account" className="hdr-link roll-host hdr-account">
            <RollLabel text={uiCopy.shell.account} />
          </TLink>
          <BagButton />
        </div>
      </div>
    </header>
  );
}
