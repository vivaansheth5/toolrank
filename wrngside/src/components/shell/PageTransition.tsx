"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/device";
import { getLenis, setNavType } from "@/lib/scroll";
import { hasPendingFlight } from "@/lib/flight";
import { sound } from "@/components/sound/sound";

type Navigate = (href: string, opts?: { flight?: boolean; replace?: boolean }) => Promise<void>;
const Ctx = createContext<Navigate>(async () => {});
export const useNavigate = () => useContext(Ctx);

const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/**
 * "Power cut" page transitions: the screen dips to black with a quick flicker,
 * the route changes underneath, then the new page plays its reveals.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const overlay = useRef<HTMLDivElement>(null);
  const waiter = useRef<(() => void) | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    waiter.current?.();
    waiter.current = null;
  }, [pathname]);

  useEffect(() => {
    const onPop = () => setNavType("pop");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback<Navigate>(
    async (href, opts = {}) => {
      const url = new URL(href, window.location.href);
      const samePath = url.pathname === window.location.pathname;
      setNavType("push");
      if (busy.current) return;
      if (samePath || prefersReducedMotion() || !overlay.current) {
        if (opts.replace) router.replace(href);
        else router.push(href);
        return;
      }
      busy.current = true;
      const html = document.documentElement;
      const el = overlay.current;
      html.setAttribute("data-transitioning", "");
      el.style.pointerEvents = "auto";
      sound.play("flicker");
      // Dip to black with a 120ms flicker.
      await new Promise<void>((resolve) => {
        const tl = gsap.timeline({ onComplete: resolve });
        if (opts.flight) tl.to(el, { opacity: 0.94, duration: 0.45, ease: "wipe" });
        else tl.to(el, { opacity: 0.9, duration: 0.05, ease: "none" }).to(el, { opacity: 0.25, duration: 0.04, ease: "none" }).to(el, { opacity: 1, duration: 0.05, ease: "none" }).to({}, { duration: 0.08 });
      });
      const arrived = new Promise<void>((resolve) => {
        waiter.current = resolve;
        window.setTimeout(resolve, 5000);
      });
      if (opts.replace) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
      await arrived;
      await frame();
      await frame();
      const lenis = getLenis();
      if (url.hash) {
        document.querySelector(url.hash)?.scrollIntoView();
      } else if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
      else window.scrollTo(0, 0);
      ScrollTrigger.refresh();
      // Power back on.
      await new Promise<void>((resolve) => {
        gsap
          .timeline({ onComplete: resolve })
          .to(el, { opacity: 0.35, duration: 0.05, ease: "none" })
          .to(el, { opacity: 1, duration: 0.05, ease: "none" })
          .call(() => {
            html.removeAttribute("data-transitioning");
            window.dispatchEvent(new Event("wrng:page-enter"));
          })
          .to(el, { opacity: 0, duration: hasPendingFlight() ? 0.6 : 0.42, ease: "ui" });
      });
      el.style.pointerEvents = "none";
      busy.current = false;
    },
    [router],
  );

  return (
    <Ctx.Provider value={navigate}>
      {children}
      <div ref={overlay} className="power-overlay" aria-hidden="true" />
    </Ctx.Provider>
  );
}
