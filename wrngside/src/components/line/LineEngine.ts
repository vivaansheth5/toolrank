"use client";

/**
 * THE LINE engine. One frame subscriber (the shared gsap.ticker loop) does
 * everything per frame: reads the line position (pinned scroll on desktop,
 * native scrollLeft on touch), integrates the physics (damped pendulums per
 * garment, modal cable wobble, wind, gusts, cursor air), and writes transforms
 * only for what's on screen. Nothing per-frame touches React state.
 */
import { gsap } from "@/lib/gsap";
import { addFrame } from "@/lib/frame-loop";
import { getScrollY, scrollToY, setWheelMapper, getNavType, getLenis } from "@/lib/scroll";
import { FINE_POINTER, REDUCED_MOTION, isLowEndDevice } from "@/lib/device";
import { sound } from "@/components/sound/sound";

export interface EngineData {
  endX: number;
  spans: { x0: number; x1: number; sag: number }[];
  garments: {
    handle: string;
    category: string;
    x: number;
    span: number;
    u: number;
    w: number;
    h: number;
    top: number;
    tag: number;
    weight: number;
    hang: string;
    cutout: string;
    title: string;
    colour: string;
  }[];
  poles: { x: number; transformer: boolean }[];
  lamp: { dx: number; y: number };
  perches: { span: number; u: number }[];
  y0: number;
}

export interface EngineDeps {
  navigateToProduct: (handle: string, source: HTMLElement, cutout: string, angle: number) => void;
  quickAdd: (handle: string, colour: string, size: string) => Promise<boolean>;
  prefetch: (href: string) => void;
  hudLabel: (index: number) => { category: string; count: string };
  markHintSeen: () => void;
  hintSeen: () => boolean;
  copyEgg: () => void;
}

type Mode = "desktop" | "touch" | "static";
const NM = 5; // cable modes per span
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface G {
  i: number;
  handle: string;
  li: HTMLLIElement;
  link: HTMLAnchorElement;
  body: HTMLElement;
  img: HTMLElement;
  tag: HTMLElement;
  shadow: HTMLElement | null;
  pegs: SVGElement[];
  x: number;
  span: number;
  u: number;
  weight: number;
  pegStyle: boolean;
  angle: number;
  vel: number;
  tagAngle: number;
  tagVel: number;
  hover: number;
  hoverTarget: number;
  drop: number;
  phase: number;
  stiff: number;
  damp: number;
  max: number;
  xPx: number;
  lampDxPx: number;
  lastT: string;
  lastTag: string;
  lastShadow: string;
  prefetched: boolean;
}

interface S {
  x0: number;
  x1: number;
  sag: number;
  q: Float64Array;
  qd: Float64Array;
  force: Float64Array;
  paths: SVGPathElement[];
  lastD: string;
}

interface Crow {
  el: HTMLElement;
  span: number;
  u: number;
  state: "perched" | "flying" | "away" | "landing";
  ox: number;
  oy: number;
  dir: number;
  returnAt: number;
  last: string;
}

export class LineEngine {
  private root: HTMLElement;
  private data: EngineData;
  private deps: EngineDeps;
  mode: Mode = "touch";
  private stage!: HTMLElement;
  private pin!: HTMLElement;
  private scroller!: HTMLElement;
  private track!: HTMLElement;
  private nights: HTMLElement[] = [];
  private light!: HTMLElement;
  private layers: { el: HTMLElement; depth: number; amp: number; mx: number; my: number; last: string }[] = [];
  private gs: G[] = [];
  private ss: S[] = [];
  private crows: Crow[] = [];
  private hud = { cat: null as HTMLElement | null, count: null as HTMLElement | null, fill: null as SVGPathElement | null, spark: null as HTMLElement | null, lastCat: "", lastCount: "", lastP: -1 };
  private hint: HTMLElement | null = null;

  // metrics (px)
  private P = 1;
  private H = 1;
  private V = 1;
  private sPx = 1;
  private travel = 1;
  private pinStart = 0;
  // state
  private pos = 0;
  private lastPos = 0;
  private vel = 0;
  private time = 0;
  private started = 0;
  private mouse = { x: -9999, y: -9999, nx: 0, ny: 0, inside: false };
  private lineOffset = { x: 0, y: 0 };
  private dragging = false;
  private dragMoved = false;
  private throwing = false;
  private idle = 0;
  private snapped = false;
  private hovered = -1;
  private gust = { t0: -100, next: 6 + Math.random() * 6 };
  private lite = false;
  private sda = false;
  private fps = { frames: 0, acc: 0 };
  private destroyed = false;
  private interacted = false;
  private power = { cut: false, clicks: 0, lastClick: 0, hoverTimer: 0, timer: 0, startPos: 0 };
  private cleanup: (() => void)[] = [];
  private frame: { setActive: (v: boolean) => void; remove: () => void } | null = null;
  private draggable: { kill: () => void; applyBounds: (b: object) => void; update: () => void; isThrowing: boolean; tween?: { kill: () => void } } | null = null;
  private introPending = false;

  constructor(root: HTMLElement, data: EngineData, deps: EngineDeps) {
    this.root = root;
    this.data = data;
    this.deps = deps;
  }

  /* ───────────────────────── setup ───────────────────────── */

  init() {
    const q = <T extends Element>(sel: string) => this.root.querySelector<T>(sel)!;
    this.stage = q<HTMLElement>("[data-line-stage]");
    this.pin = q<HTMLElement>("[data-line-pin]");
    this.scroller = q<HTMLElement>("[data-line-scroller]");
    this.track = q<HTMLElement>("[data-line-track]");
    this.nights = [...this.root.querySelectorAll<HTMLElement>(".night")];
    this.light = q<HTMLElement>(".light");
    this.hint = q<HTMLElement>("[data-line-hint]");
    this.hud.cat = q<HTMLElement>("[data-hud-cat]");
    this.hud.count = q<HTMLElement>("[data-hud-count]");
    this.hud.fill = q<SVGPathElement>("[data-hud-fill]");
    this.hud.spark = q<HTMLElement>("[data-hud-spark]");

    const reduced = window.matchMedia(REDUCED_MOTION).matches;
    const fine = window.matchMedia(FINE_POINTER).matches;
    this.mode = reduced ? "static" : fine ? "desktop" : "touch";
    this.stage.dataset.mode = this.mode;
    if (this.mode !== "static" && isLowEndDevice()) this.setLite(true);

    const amps: Record<string, number> = { "0.04": 6, "0.12": 8, "0.3": 12, "0.8": 16, "1.6": 24 };
    this.root.querySelectorAll<HTMLElement>(".lyr[data-depth]").forEach((el) => {
      const depth = Number(el.dataset.depth);
      this.layers.push({ el, depth, amp: amps[String(depth)] ?? 10, mx: 0, my: 0, last: "" });
    });

    this.data.spans.forEach((s, i) => {
      const paths = [...this.root.querySelectorAll<SVGPathElement>(`[data-span="${i}"], [data-span-hi="${i}"]`)];
      this.ss.push({ ...s, q: new Float64Array(NM), qd: new Float64Array(NM), force: new Float64Array(NM), paths, lastD: "" });
    });

    this.data.garments.forEach((d, i) => {
      const li = this.root.querySelector<HTMLLIElement>(`.g[data-g="${i}"]`)!;
      const w = clamp((d.weight - 0.1) / 0.8, 0, 1);
      this.gs.push({
        i,
        handle: d.handle,
        li,
        link: li.querySelector<HTMLAnchorElement>(".g-link")!,
        body: li.querySelector<HTMLElement>(".g-body")!,
        img: li.querySelector<HTMLElement>(".g-img")!,
        tag: li.querySelector<HTMLElement>(".tag")!,
        shadow: this.root.querySelector<HTMLElement>(`[data-shadow="${i}"]`),
        pegs: [...li.querySelectorAll<SVGElement>(".peg")],
        x: d.x,
        span: d.span,
        u: d.u,
        weight: d.weight,
        pegStyle: d.hang === "pegs" && d.w > 60,
        angle: 0,
        vel: 0,
        tagAngle: 0,
        tagVel: 0,
        hover: 0,
        hoverTarget: 0,
        drop: 0,
        phase: Math.random() * 100,
        // Brief: tees stiffness 50 / damping 4 / max 14°; outerwear 32 / 3.6 / 8°.
        stiff: lerp(54, 30, w),
        damp: lerp(4.2, 3.5, w),
        max: lerp(15, 7.5, w),
        xPx: 0,
        lampDxPx: 0,
        lastT: "",
        lastTag: "",
        lastShadow: "",
        prefetched: false,
      });
    });

    this.root.querySelectorAll<HTMLElement>(".crow").forEach((el, i) => {
      const p = this.data.perches[i];
      this.crows.push({ el, span: p.span, u: p.u, state: "perched", ox: 0, oy: 0, dir: 1, returnAt: 0, last: "" });
    });

    // Touch: compositor-driven parallax where supported.
    if (this.mode === "touch" && typeof CSS !== "undefined" && CSS.supports("animation-timeline: scroll()")) {
      this.sda = true;
      this.stage.classList.add("sda");
    }

    this.measure();
    this.bind();
    if (document.documentElement.hasAttribute("data-loading") && this.mode !== "static") this.prepareIntro();
    this.restoreMemory();

    this.frame = addFrame("the-line", (t, dt) => this.tick(t, dt), 10);
    const io = new IntersectionObserver(([e]) => this.frame?.setActive(e.isIntersecting), { rootMargin: "120px" });
    io.observe(this.pin);
    this.cleanup.push(() => io.disconnect());
    this.started = performance.now() / 1000;

    if (this.mode === "desktop") void this.setupDrag();
    if (!this.deps.hintSeen()) {
      const id = window.setTimeout(() => !this.interacted && !this.destroyed && this.hint?.setAttribute("data-show", ""), 1400);
      this.cleanup.push(() => window.clearTimeout(id));
    }
    this.makeShadows();
    this.scheduleFgCrow();
  }

  destroy() {
    this.destroyed = true;
    this.frame?.remove();
    this.draggable?.kill();
    setWheelMapper(null);
    this.cleanup.forEach((f) => f());
    window.clearTimeout(this.power.timer);
    window.clearTimeout(this.power.hoverTimer);
  }

  setLite(v: boolean) {
    this.lite = v;
    if (v) this.stage.dataset.lite = "";
    else delete this.stage.dataset.lite;
  }

  /* ───────────────────────── measuring ───────────────────────── */

  private probe(expr: string) {
    const el = document.createElement("div");
    el.style.cssText = `position:absolute;visibility:hidden;width:${expr};height:0;`;
    this.stage.appendChild(el);
    const w = el.getBoundingClientRect().width;
    el.remove();
    return w;
  }

  measure() {
    const prevTravel = this.travel;
    const prevPinStart = this.pinStart;
    // Where we are now (read live: this.pos may be a frame stale).
    const prevPos = this.mode === "desktop" ? clamp(getScrollY() - prevPinStart, 0, prevTravel) : this.scroller.scrollLeft;
    this.P = this.probe("var(--P)");
    this.sPx = this.probe("calc(var(--s) * 100)") / 100;
    this.H = this.stage.clientHeight;
    this.V = this.stage.clientWidth;
    const trackW = this.track.getBoundingClientRect().width;
    this.travel = Math.max(1, this.mode === "desktop" ? trackW - this.V : this.scroller.scrollWidth - this.scroller.clientWidth);
    this.pinStart = this.pin.getBoundingClientRect().top + window.scrollY;
    this.stage.style.setProperty("--max-scroll", `${this.travel}px`);
    this.gs.forEach((g) => {
      g.xPx = g.x * this.P;
      // Nearest lamp (lamps sit at pole x + 0.092H).
      let best = Infinity;
      this.data.poles.forEach((p) => {
        const dx = g.xPx - (p.x * this.P + this.data.lamp.dx * this.H);
        if (Math.abs(dx) < Math.abs(best)) best = dx;
      });
      g.lampDxPx = best;
      if (g.shadow) {
        // Longer, softer and fainter the further from a lamp.
        const far = clamp(Math.abs(best) / (1.25 * this.P), 0, 1);
        g.shadow.style.opacity = String(lerp(0.52, 0.16, far));
        g.shadow.dataset.blur = String(Math.round(lerp(10, 22, far)));
      }
    });
    // Keep the same place on the line through resizes (only if the length changed).
    if (prevTravel > 1 && Math.abs(prevTravel - this.travel) > 1 && prevPos > 0) {
      const p = prevPos / prevTravel;
      if (this.mode === "desktop") {
        const y = getScrollY();
        if (y >= prevPinStart && y <= prevPinStart + prevTravel) scrollToY(this.pinStart + p * this.travel, { immediate: true });
      } else this.scroller.scrollLeft = p * this.travel;
    }
  }

  /* ───────────────────────── input ───────────────────────── */

  private on<K extends keyof HTMLElementEventMap>(el: EventTarget, type: K | string, fn: (e: never) => void, opts?: AddEventListenerOptions) {
    el.addEventListener(type, fn as EventListener, opts);
    this.cleanup.push(() => el.removeEventListener(type, fn as EventListener, opts));
  }

  private bind() {
    // Resize (debounced); ignore mobile address-bar height changes.
    let rt = 0;
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (this.mode !== "desktop" && w === lastW && Math.abs(h - lastH) < 160) return;
        lastW = w;
        lastH = h;
        this.measure();
      }, 150);
    });
    ro.observe(this.stage);
    this.cleanup.push(() => ro.disconnect());
    void document.fonts?.ready.then(() => !this.destroyed && this.measure());

    // Trackpad sideways swipes move the line while pinned.
    if (this.mode === "desktop") {
      setWheelMapper((d) => {
        if (!this.isPinned()) return;
        if (Math.abs(d.deltaX) > Math.abs(d.deltaY)) d.deltaY = d.deltaX;
        if (this.throwing) this.draggable?.tween?.kill();
      });
    }

    // Pointer: hover, cursor air, crows.
    this.on(this.stage, "pointermove", (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        if (this.power.cut) this.setTorch(e.clientX, e.clientY);
        return;
      }
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.ny = (e.clientY / window.innerHeight) * 2 - 1;
      this.mouse.inside = true;
      if (this.power.cut) this.setTorch(e.clientX, e.clientY);
    });
    this.on(this.stage, "pointerleave", () => {
      this.mouse.inside = false;
      this.setHover(-1);
    });
    const list = this.root.querySelector(".garments")!;
    if (this.mode === "desktop") {
      this.on(list, "pointerover", (e: PointerEvent) => {
        if (e.pointerType !== "mouse" || this.dragging) return;
        const li = (e.target as Element).closest<HTMLLIElement>(".g");
        if (li) this.setHover(Number(li.dataset.g));
      });
      this.on(list, "pointerout", (e: PointerEvent) => {
        const to = e.relatedTarget as Element | null;
        if (!to || !to.closest(".g")) this.setHover(-1);
      });
    }

    // Clicks: garments, quick add, skip, transformer, egg code, nav buttons.
    this.on(this.root, "click", (e: MouseEvent) => this.onClick(e), { capture: true });

    // Keyboard.
    this.on(window, "keydown", (e: KeyboardEvent) => this.onKey(e));
    this.on(list, "focusin", (e: FocusEvent) => {
      const li = (e.target as Element).closest<HTMLLIElement>(".g");
      if (!li) return;
      const i = Number(li.dataset.g);
      const center = this.pos + this.V / 2;
      if (Math.abs(this.gs[i].xPx - center) > this.P * 0.2) this.goTo(i, true);
    });

    // Transformer Easter egg.
    const tr = this.root.querySelector<HTMLElement>("[data-action='transformer']");
    if (tr) {
      this.on(tr, "pointerenter", () => {
        window.clearTimeout(this.power.hoverTimer);
        this.power.hoverTimer = window.setTimeout(() => this.spark(tr, 14), 2000);
      });
      this.on(tr, "pointerleave", () => window.clearTimeout(this.power.hoverTimer));
    }

    // Touch & static: track the scroller; first interaction hides the hint.
    if (this.mode !== "desktop") {
      this.on(this.scroller, "scroll", () => this.markInteracted(), { passive: true });
    }
    this.on(this.stage, "pointerdown", () => this.markInteracted(), { passive: true });
  }

  private markInteracted() {
    if (this.interacted) return;
    this.interacted = true;
    this.hint?.removeAttribute("data-show");
    this.deps.markHintSeen();
  }

  private isPinned() {
    const y = getScrollY();
    return y >= this.pinStart - 2 && y <= this.pinStart + this.travel + 2;
  }

  private async setupDrag() {
    const [{ Draggable }, { InertiaPlugin }] = await Promise.all([import("gsap/Draggable"), import("gsap/InertiaPlugin")]);
    if (this.destroyed) return;
    gsap.registerPlugin(Draggable, InertiaPlugin);
    const proxy = document.createElement("div");
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const d = Draggable.create(proxy, {
      type: "x",
      trigger: this.stage,
      inertia: true,
      bounds: { minX: -this.travel, maxX: 0 },
      edgeResistance: 0.85,
      minimumMovement: 6,
      allowContextMenu: true,
      dragClickables: true,
      clickableTest: (el: Element) => Boolean(el.closest?.(".tag, button, .end-board, .egg-code")),
      throwResistance: 1600,
      maxDuration: 1.6,
      onPress() {
        gsap.set(proxy, { x: -self.pos });
        this.update();
        this.applyBounds({ minX: -self.travel, maxX: 0 });
        self.dragging = true;
        self.dragMoved = false;
      },
      onDragStart() {
        self.dragMoved = true;
        self.markInteracted();
        self.setHover(-1);
        self.stage.classList.add("is-dragging");
      },
      onDrag() {
        self.setPosFromDrag(-this.x);
      },
      onRelease() {
        self.dragging = false;
        self.stage.classList.remove("is-dragging");
        self.throwing = this.isThrowing;
      },
      onThrowUpdate() {
        self.setPosFromDrag(-this.x);
      },
      onThrowComplete() {
        self.throwing = false;
      },
    })[0];
    this.draggable = d as unknown as LineEngine["draggable"];
  }

  private setPosFromDrag(p: number) {
    if (!this.isPinned() && !this.dragging && !this.throwing) return;
    scrollToY(this.pinStart + clamp(p, 0, this.travel), { immediate: true });
  }

  private onKey(e: KeyboardEvent) {
    if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey) return;
    const t = e.target as HTMLElement;
    if (t.closest("input, textarea, select, [contenteditable], [role='dialog']")) return;
    if (this.power.cut && e.key === "Escape") {
      this.restorePower();
      return;
    }
    const within = this.root.contains(document.activeElement);
    const active = within || (this.mode === "desktop" && this.isPinned());
    if (!active) return;
    const cur = this.currentIndex();
    const n = this.gs.length;
    let target: number | null = null;
    if (e.key === "ArrowRight") target = Math.min(n, cur + 1);
    else if (e.key === "ArrowLeft") target = Math.max(-1, cur - 1);
    else if (e.key === "Home" && (within || this.pos > 2)) target = -1;
    else if (e.key === "End" && (within || this.pos < this.travel - 2)) target = n;
    if (target === null) return;
    e.preventDefault();
    this.markInteracted();
    this.goTo(target);
    if (within && target >= 0 && target < n) this.gs[target].link.focus({ preventScroll: true });
  }

  /** Index of the garment nearest the centre (-1 before the first, n after the last). */
  private currentIndex() {
    const c = this.pos + this.V / 2;
    if (c < this.gs[0].xPx - this.P * 0.5) return -1;
    if (c > this.gs[this.gs.length - 1].xPx + this.P * 0.5) return this.gs.length;
    let best = 0;
    this.gs.forEach((g, i) => {
      if (Math.abs(g.xPx - c) < Math.abs(this.gs[best].xPx - c)) best = i;
    });
    return best;
  }

  private targetPosFor(i: number) {
    if (i < 0) return 0;
    if (i >= this.gs.length) return this.travel;
    const anchor = this.mode === "desktop" ? 0.5 : 0.43;
    return clamp(this.gs[i].xPx - this.V * anchor, 0, this.travel);
  }

  goTo(i: number, fromFocus = false) {
    const p = this.targetPosFor(i);
    if (this.mode === "desktop") {
      this.draggable?.tween?.kill();
      scrollToY(this.pinStart + p, { duration: fromFocus ? 0.7 : 0.9, easing: (t) => 1 - Math.pow(1 - t, 3) });
    } else {
      this.scroller.scrollTo({ left: p, behavior: this.mode === "static" ? "auto" : "smooth" });
    }
  }

  private setHover(i: number) {
    if (i === this.hovered) return;
    const prev = this.gs[this.hovered];
    if (prev) {
      prev.hoverTarget = 0;
      prev.li.classList.remove("is-hover");
    }
    this.hovered = i;
    const list = this.root.querySelector(".garments")!;
    const g = this.gs[i];
    if (g) {
      g.hoverTarget = 1;
      g.li.classList.add("is-hover");
      list.classList.add("has-hover");
      this.impulse(g.span, g.u, 70);
      sound.play("peg");
    } else {
      list.classList.remove("has-hover");
    }
  }

  private onClick(e: MouseEvent) {
    const t = e.target as HTMLElement;
    const action = t.closest<HTMLElement>("[data-action]");
    if (action) {
      const a = action.dataset.action;
      if (a === "quick-add") {
        // No stopPropagation: Draggable must see the native click, or it
        // replays a synthetic one 50ms later (double add).
        e.preventDefault();
        const li = action.closest<HTMLLIElement>(".g");
        void this.deps.quickAdd(action.dataset.handle!, action.dataset.colour!, action.dataset.size!).then((ok) => {
          if (ok && li) {
            li.classList.remove("is-snap");
            void li.offsetWidth;
            li.classList.add("is-snap");
            const g = this.gs[Number(li.dataset.g)];
            if (g) {
              g.vel += 40;
              this.impulse(g.span, g.u, 120);
            }
          }
        });
        return;
      }
      if (a === "skip") {
        e.preventDefault();
        const next = document.getElementById("after-line");
        if (next) {
          const y = next.getBoundingClientRect().top + window.scrollY;
          scrollToY(y, { duration: 1.2 });
          window.setTimeout(() => next.querySelector<HTMLElement>("[tabindex='-1'], h2")?.focus({ preventScroll: true }), 900);
        }
        return;
      }
      if (a === "transformer") {
        e.preventDefault();
        this.transformerClick(action);
        return;
      }
      if (a === "copy-egg") {
        e.preventDefault();
        this.deps.copyEgg();
        return;
      }
      if (a === "prev" || a === "next") {
        this.goTo(this.currentIndex() + (a === "next" ? 1 : -1));
        return;
      }
      if (a === "shop" && this.dragMoved) {
        e.preventDefault();
        return;
      }
    }
    const link = t.closest<HTMLAnchorElement>(".g-link");
    if (!link) return;
    e.preventDefault();
    if (this.dragMoved) return;
    const li = link.closest<HTMLLIElement>(".g")!;
    const g = this.gs[Number(li.dataset.g)];
    // Touch: first tap flips the tag, second opens the product.
    if (this.mode !== "desktop" && !li.classList.contains("is-flipped")) {
      this.root.querySelectorAll(".g.is-flipped").forEach((n) => n.classList.remove("is-flipped"));
      li.classList.add("is-flipped");
      this.impulse(g.span, g.u, 80);
      return;
    }
    this.open(g);
  }

  private open(g: G) {
    try {
      sessionStorage.setItem("wrng:line", JSON.stringify({ i: g.i, t: Date.now() }));
    } catch {
      /* private mode */
    }
    sound.play("peg");
    g.pegs.forEach((p) => p.setAttribute("data-open", ""));
    // The peg opens, the garment drops 6px, then flies.
    gsap.to(g, { drop: 6, duration: 0.14, ease: "power2.in" });
    window.setTimeout(() => {
      g.body.style.visibility = "hidden";
      if (g.shadow) g.shadow.style.visibility = "hidden";
      this.deps.navigateToProduct(g.handle, g.img, this.data.garments[g.i].cutout, this.bodyAngle(g));
    }, 150);
  }

  private bodyAngle(g: G) {
    return this.visualAngle(g);
  }

  /** Pegged pieces can't pivot freely: they shear more than they turn (less so on touch, where the sway is the point). */
  private visualAngle(g: G) {
    return g.pegStyle ? g.angle * (this.mode === "touch" ? 0.6 : 0.35) : g.angle;
  }

  /* ───────────────────────── memory & intro ───────────────────────── */

  private restoreMemory() {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem("wrng:line");
    } catch {
      return;
    }
    if (!raw) return;
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const isBack = getNavType() === "pop" || nav?.type === "back_forward";
    if (!isBack) return;
    const { i, t } = JSON.parse(raw) as { i: number; t: number };
    if (Date.now() - t > 30 * 60 * 1000 || !this.gs[i]) return;
    const p = this.targetPosFor(i);
    requestAnimationFrame(() => {
      if (this.mode === "desktop") {
        scrollToY(this.pinStart + p, { immediate: true });
        getLenis()?.resize();
      } else this.scroller.scrollLeft = p;
      this.pos = this.lastPos = p;
      this.gs[i].body.style.visibility = "";
    });
  }

  private prepareIntro() {
    this.introPending = true;
    this.stage.classList.add("lamps-off");
    this.gs.forEach((g) => (g.drop = -this.H * 1.1));
    const onIntro = () => this.runIntro();
    window.addEventListener("wrng:intro", onIntro, { once: true });
    this.cleanup.push(() => window.removeEventListener("wrng:intro", onIntro));
  }

  private runIntro() {
    if (!this.introPending) return;
    this.introPending = false;
    const light = this.light;
    const setLamp = (v: number, warm = 0.15) => {
      light.style.setProperty("--lamp", String(v));
      light.style.setProperty("--warm", String(warm));
    };
    this.stage.classList.remove("lamps-off");
    setLamp(0);
    sound.play("flicker");
    const warm = { v: 0 };
    // Lamp: on 60ms, off 90ms, on 40ms, off 220ms, then steady, warming pink → sodium in 400ms.
    const tl = gsap.timeline();
    tl.call(() => setLamp(0.8, 0.1))
      .to({}, { duration: 0.06 })
      .call(() => setLamp(0))
      .to({}, { duration: 0.09 })
      .call(() => setLamp(0.9, 0.15))
      .to({}, { duration: 0.04 })
      .call(() => setLamp(0))
      .to({}, { duration: 0.22 })
      .call(() => setLamp(1, 0))
      .to(warm, { v: 1, duration: 0.4, ease: "none", onUpdate: () => light.style.setProperty("--warm", warm.v.toFixed(3)) });
    // Garments drop onto the cable one by one (70ms stagger); the cable dips under each.
    const visible = this.gs.filter((g) => g.xPx - this.pos > -this.P && g.xPx - this.pos < this.V + this.P);
    const rest = this.gs.filter((g) => !visible.includes(g));
    rest.forEach((g) => (g.drop = 0));
    visible.forEach((g, k) => {
      tl.to(g, { drop: 0, duration: 0.5, ease: "power3.in", onComplete: () => this.land(g) }, 0.62 + k * 0.07);
    });
  }

  private land(g: G) {
    this.impulse(g.span, g.u, 260);
    g.vel += (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 20);
    sound.play("peg");
  }

  /* ───────────────────────── physics ───────────────────────── */

  private impulse(span: number, u: number, strength: number) {
    const s = this.ss[span];
    if (!s) return;
    for (let n = 0; n < NM; n++) s.qd[n] += strength * Math.sin((n + 1) * Math.PI * u) * Math.pow(n + 1, 0.25);
  }

  private disp(s: S, u: number) {
    let d = 0;
    for (let n = 0; n < NM; n++) d += s.q[n] * Math.sin((n + 1) * Math.PI * u);
    return d;
  }

  private cableY(s: S, u: number) {
    return (this.data.y0 + 4 * u * (1 - u) * s.sag) * this.H + this.disp(s, u);
  }

  private stepCables(dt: number) {
    const w1 = 2 * Math.PI * 1.25;
    const speed = Math.abs(this.vel);
    for (const s of this.ss) {
      s.force.fill(0);
      // Moving the line bows the cable a little; stopping lets it spring back.
      const len = (s.x1 - s.x0) * this.P;
      s.force[0] += Math.min(speed, 4000) * 0.0045 * (len / 1000) * w1 * w1;
    }
    for (const g of this.gs) {
      if (g.hover < 0.01) continue;
      const s = this.ss[g.span];
      for (let n = 0; n < NM; n++) s.force[n] += 560 * g.hover * Math.sin((n + 1) * Math.PI * g.u);
    }
    const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
    const h = dt / steps;
    for (const s of this.ss) {
      for (let k = 0; k < steps; k++) {
        for (let n = 0; n < NM; n++) {
          const w = w1 * (n + 1) * (1 + 0.04 * n);
          const z = 0.06 + 0.015 * n;
          s.qd[n] += (-w * w * s.q[n] - 2 * z * w * s.qd[n] + s.force[n]) * h;
          s.q[n] += s.qd[n] * h;
        }
      }
    }
  }

  private wind(g: G, t: number) {
    const p = g.phase;
    const n = Math.sin(t * 2 * Math.PI * 0.3 + p) * 0.6 + Math.sin(t * 2 * Math.PI * 0.47 + p * 1.7) * 0.3 + Math.sin(t * 2 * Math.PI * 0.13 + p * 2.3) * 0.1;
    return n * 1.2 * (1 - g.weight * 0.5);
  }

  private gustAt(g: G, t: number, screenX: number) {
    const speed = this.V * 1.3;
    const arrival = this.gust.t0 + (screenX + this.V * 0.2) / speed;
    const tau = t - arrival;
    if (tau < 0 || tau > 1.6) return 0;
    const env = Math.pow(Math.sin((Math.PI * tau) / 1.6), 2);
    return -4.5 * (1 - g.weight * 0.6) * env;
  }

  /* ───────────────────────── frame ───────────────────────── */

  private tick(t: number, dt: number) {
    if (this.destroyed) return;
    this.time = t;
    const m = this.mode;
    // 1. Position.
    if (m === "desktop") this.pos = clamp(getScrollY() - this.pinStart, 0, this.travel);
    else this.pos = this.scroller.scrollLeft;
    const raw = (this.pos - this.lastPos) / Math.max(dt, 1 / 240);
    this.lastPos = this.pos;
    this.vel += (raw - this.vel) * (1 - Math.exp(-dt * 14));
    if (!this.interacted && Math.abs(raw) > 30) this.markInteracted();

    if (m === "static") {
      this.writeStatic();
      this.updateHud();
      return;
    }

    // 2. Camera: mouse parallax (desktop, heavily lerped), scroll parallax.
    const k = 1 - Math.pow(1 - 0.06, dt * 60);
    const mx = m === "desktop" && !this.lite && this.mouse.inside ? this.mouse.nx : 0;
    const my = m === "desktop" && !this.lite && this.mouse.inside ? this.mouse.ny : 0;
    this.lineOffset.x += (-mx * 14 - this.lineOffset.x) * k;
    this.lineOffset.y += (-my * 8 - this.lineOffset.y) * k;
    if (m === "desktop") {
      const tr = `translate3d(${(-this.pos + this.lineOffset.x).toFixed(2)}px, ${this.lineOffset.y.toFixed(2)}px, 0)`;
      this.track.style.transform = tr;
      for (const n of this.nights) n.style.transform = tr;
      this.light.style.transform = tr;
    } else if (!this.sda) {
      const tr = `translate3d(${(-this.pos).toFixed(2)}px, 0, 0)`;
      for (const n of this.nights) n.style.transform = tr;
      this.light.style.transform = tr;
    }
    for (const L of this.layers) {
      L.mx += (-mx * L.amp - L.mx) * k;
      L.my += (-my * L.amp * 0.5 - L.my) * k;
      if (this.sda && m === "touch") continue;
      const depth = this.lite && L.depth === 0.12 ? 0.04 : L.depth;
      const s = `translate3d(${(-this.pos * depth + L.mx).toFixed(2)}px, ${L.my.toFixed(2)}px, 0)`;
      if (s !== L.last) {
        L.el.style.transform = s;
        L.last = s;
      }
    }

    // 3. Physics.
    this.stepCables(dt);
    const vScreen = -this.vel;
    if (t > this.gust.next && !this.introPending) {
      this.gust.t0 = t;
      this.gust.next = t + 8 + Math.random() * 6;
    }
    // Swiping on a phone: the pieces trail the swipe a little harder than on
    // desktop, so a slow drag already sways them, but a flick is capped lower
    // so they swing slightly rather than fly.
    const kV = m === "touch" ? 0.007 : 0.004;
    const maxK = m === "touch" ? 0.6 : 1;
    for (const g of this.gs) {
      const screenX = g.xPx - this.pos + this.lineOffset.x;
      const visible = screenX > -this.V * 0.5 && screenX < this.V * 1.5;
      // Hover easing.
      g.hover += (g.hoverTarget - g.hover) * (1 - Math.exp(-dt * 10));
      // Target angle: trail the movement, plus wind, gusts and cursor air.
      let target = clamp(kV * vScreen, -g.max * maxK, g.max * maxK);
      target += this.wind(g, t) + this.gustAt(g, t, screenX);
      if (m === "desktop" && this.mouse.inside && visible) {
        const cy = (this.data.y0 + 0.2) * this.H + this.lineOffset.y;
        const dx = this.mouse.x - screenX;
        const dy = this.mouse.y - cy;
        const dist = Math.hypot(dx, dy * 0.6);
        if (dist < 160) target += 3 * Math.pow(1 - dist / 160, 2) * Math.sign(dx || 1);
      }
      g.vel += (g.stiff * (target - g.angle) - g.damp * g.vel) * dt;
      g.angle += g.vel * dt;
      // Swing tag: a lighter pendulum that lags the garment.
      const tagTarget = clamp(kV * 1.4 * vScreen, -22, 22) + this.wind(g, t + 0.4) * 1.6 - g.vel * 0.05;
      g.tagVel += (36 * (tagTarget - g.tagAngle) - 3.1 * g.tagVel) * dt;
      g.tagAngle += g.tagVel * dt;

      if (!visible) continue;
      if (!g.prefetched && screenX > -this.V * 0.2 && screenX < this.V * 1.2) {
        g.prefetched = true;
        this.deps.prefetch(`/products/${g.handle}`);
      }
      const s = this.ss[g.span];
      const dy = this.disp(s, g.u) + g.drop;
      const r = this.visualAngle(g);
      const sk = g.pegStyle ? -g.angle * (m === "touch" ? 0.45 : 0.65) : 0;
      const sc = 1 + 0.04 * g.hover;
      const tr = `translate3d(0,${dy.toFixed(2)}px,0) rotate(${r.toFixed(3)}deg) skewX(${sk.toFixed(3)}deg) scale(${sc.toFixed(4)})`;
      if (tr !== g.lastT) {
        g.body.style.transform = tr;
        g.lastT = tr;
      }
      const tagDy = this.disp(s, clamp(g.u + (this.data.garments[g.i].tag * this.sPx) / ((s.x1 - s.x0) * this.P), 0, 1)) + g.drop;
      const tt = `translate3d(0,${tagDy.toFixed(2)}px,0) rotate(${g.tagAngle.toFixed(3)}deg)`;
      if (tt !== g.lastTag) {
        g.tag.style.transform = tt;
        g.lastTag = tt;
      }
      if (g.shadow) {
        // Coming forward: the shadow moves further away, grows and softens.
        const away = Math.sign(g.lampDxPx || 1);
        const ox = away * 16 * g.hover;
        const oy = 10 * g.hover;
        const st = `translate3d(${ox.toFixed(2)}px,${(dy + oy).toFixed(2)}px,0) rotate(${r.toFixed(3)}deg) skewX(${sk.toFixed(3)}deg) scale(${(1 + 0.07 * g.hover).toFixed(4)})`;
        if (st !== g.lastShadow) {
          g.shadow.style.transform = st;
          g.lastShadow = st;
        }
      }
    }

    // 4. Cables (only spans with energy, only when on screen).
    for (let i = 0; i < this.ss.length; i++) {
      const s = this.ss[i];
      const x0 = s.x0 * this.P - this.pos;
      const x1 = s.x1 * this.P - this.pos;
      if (x1 < -this.V * 0.2 || x0 > this.V * 1.2) continue;
      let e = 0;
      for (let n = 0; n < NM; n++) e += Math.abs(s.q[n]);
      if (e < 0.02 && s.lastD) continue;
      const pts: string[] = [];
      const N = 28;
      for (let k2 = 0; k2 <= N; k2++) {
        const u = k2 / N;
        const xx = (s.x0 + (s.x1 - s.x0) * u) * 1000;
        const yy = (this.cableY(s, u) / this.H) * 1000;
        pts.push(`${xx.toFixed(1)} ${yy.toFixed(2)}`);
      }
      const d = `M${pts.join("L")}`;
      if (d !== s.lastD) {
        s.paths.forEach((p) => p.setAttribute("d", d));
        s.lastD = d;
      }
    }

    // 5. Crows, snapping, HUD, frame-rate watchdog.
    if (!this.lite) this.updateCrows(t, dt);
    if (m === "desktop") this.updateSnap(dt);
    this.updateHud();
    this.watchdog(dt, t);
    if (this.power.cut && Math.abs(this.pos - this.power.startPos) > this.P * 0.9) this.restorePower();
  }

  private writeStatic() {
    // Reduced motion: no parallax; the wall and lights move 1:1 with the content.
    const tr = `translate3d(${(-this.pos).toFixed(1)}px,0,0)`;
    for (const n of this.nights) n.style.transform = tr;
    this.light.style.transform = tr;
    for (const L of this.layers) {
      const s = L.depth === 0.8 ? tr : "none";
      if (s !== L.last) {
        L.el.style.transform = s;
        L.last = s;
      }
    }
  }

  private updateSnap(dt: number) {
    if (this.dragging || this.throwing || !this.isPinned()) {
      this.idle = 0;
      return;
    }
    if (Math.abs(this.vel) > 30) {
      this.snapped = false;
      this.idle = 0;
      return;
    }
    if (Math.abs(this.vel) < 6) this.idle += dt;
    if (this.idle < 0.15 || this.snapped) return;
    this.snapped = true;
    if (this.pos < this.P * 0.25 || this.pos > this.travel - this.P * 0.25) return;
    const c = this.pos + this.V / 2;
    let best: G | null = null;
    for (const g of this.gs) if (!best || Math.abs(g.xPx - c) < Math.abs(best.xPx - c)) best = g;
    if (!best) return;
    const dist = best.xPx - c;
    if (Math.abs(dist) < this.P * 0.3 && Math.abs(dist) > 1.5) {
      scrollToY(this.pinStart + clamp(this.pos + dist, 0, this.travel), { duration: 0.5, easing: (x) => 1 - Math.pow(1 - x, 3) });
    }
  }

  private updateHud() {
    const p = clamp(this.pos / this.travel, 0, 1);
    if (Math.abs(p - this.hud.lastP) > 0.0008) {
      this.hud.lastP = p;
      this.hud.fill?.style.setProperty("stroke-dasharray", `${p.toFixed(4)} 1`);
      if (this.hud.spark) {
        this.hud.spark.style.left = `${(p * 100).toFixed(2)}%`;
        this.hud.spark.style.top = `${((4 + 14 * 4 * p * (1 - p) * 0.5) / 20) * 100}%`;
      }
    }
    const idx = this.currentIndex();
    const { category, count } = this.deps.hudLabel(idx);
    if (count !== this.hud.lastCount && this.hud.count) {
      this.hud.count.textContent = count;
      this.hud.lastCount = count;
    }
    if (category !== this.hud.lastCat && this.hud.cat) {
      const el = this.hud.cat;
      el.textContent = category;
      el.classList.remove("roll");
      void el.offsetWidth;
      el.classList.add("roll");
      this.hud.lastCat = category;
    }
  }

  private watchdog(dt: number, t: number) {
    if (this.lite || this.mode === "static" || t - this.started < 2.5 || document.hidden) return;
    this.fps.frames++;
    this.fps.acc += dt;
    if (this.fps.acc >= 2) {
      const fps = this.fps.frames / this.fps.acc;
      this.fps.frames = 0;
      this.fps.acc = 0;
      if (fps < 50) this.setLite(true);
    }
  }

  /* ───────────────────────── crows ───────────────────────── */

  private updateCrows(t: number, dt: number) {
    void dt;
    for (const c of this.crows) {
      const s = this.ss[c.span];
      const baseX = (s.x0 + (s.x1 - s.x0) * c.u) * this.P;
      const screenX = baseX - this.pos + this.lineOffset.x;
      if (c.state === "perched") {
        const restY = (this.data.y0 + 4 * c.u * (1 - c.u) * s.sag) * this.H;
        const near = this.mode === "desktop" && this.mouse.inside && Math.hypot(this.mouse.x - screenX, this.mouse.y - restY) < 130;
        if ((near || Math.abs(this.vel) > 1700) && screenX > -100 && screenX < this.V + 100) this.flyAway(c, t);
      } else if (c.state === "away" && t > c.returnAt) {
        this.returnCrow(c);
      }
      const dy = c.state === "perched" || c.state === "landing" ? this.disp(s, c.u) : 0;
      const tr = `translate3d(${c.ox.toFixed(1)}px,${(c.oy + dy).toFixed(1)}px,0) scaleX(${c.dir})`;
      if (tr !== c.last) {
        c.el.style.transform = tr;
        c.last = tr;
      }
    }
  }

  private flyAway(c: Crow, t: number) {
    c.state = "flying";
    c.dir = Math.random() > 0.5 ? 1 : -1;
    c.el.classList.add("is-flying");
    this.impulse(c.span, c.u, -40);
    gsap.to(c, { ox: c.dir * this.V * (0.5 + Math.random() * 0.4), duration: 1.8, ease: "power1.in" });
    gsap.to(c, {
      oy: -this.H * (0.55 + Math.random() * 0.2),
      duration: 1.8,
      ease: "power2.out",
      onComplete: () => {
        c.state = "away";
        c.returnAt = t + 8 + Math.random() * 4;
      },
    });
  }

  private returnCrow(c: Crow) {
    // Land somewhere near the current view, away from the garments.
    const viewL = this.pos / this.P;
    const viewR = (this.pos + this.V) / this.P;
    const candidates = this.ss.filter((s) => s.x1 > viewL - 1 && s.x0 < viewR + 1);
    const s = candidates[Math.floor(Math.random() * candidates.length)] ?? this.ss[0];
    const span = this.ss.indexOf(s);
    let u = 0.5;
    for (let tries = 0; tries < 12; tries++) {
      u = 0.12 + Math.random() * 0.76;
      const x = s.x0 + (s.x1 - s.x0) * u;
      if (!this.gs.some((g) => Math.abs(g.x - x) < 0.32)) break;
    }
    c.span = span;
    c.u = u;
    const x = s.x0 + (s.x1 - s.x0) * u;
    c.el.style.setProperty("--x", String(x));
    c.el.style.setProperty("--y", String(this.data.y0 + 4 * u * (1 - u) * s.sag));
    c.dir = Math.random() > 0.5 ? 1 : -1;
    c.ox = -c.dir * this.V * 0.4;
    c.oy = -this.H * 0.6;
    c.state = "landing";
    gsap.to(c, { ox: 0, duration: 1.5, ease: "power2.out" });
    gsap.to(c, {
      oy: 0,
      duration: 1.5,
      ease: "power3.out",
      onComplete: () => {
        c.state = "perched";
        c.el.classList.remove("is-flying");
        this.impulse(span, u, 50);
      },
    });
  }

  private scheduleFgCrow() {
    if (this.mode === "static") return;
    const fg = this.root.querySelector<HTMLElement>(".fg-crow");
    if (!fg) return;
    const run = () => {
      if (this.destroyed) return;
      if (!this.lite && !document.hidden) {
        const fromLeft = Math.random() > 0.5;
        const ltr = fromLeft ? 1 : -1;
        gsap.fromTo(
          fg,
          { x: fromLeft ? -200 : this.V + 200, y: this.H * (0.05 + Math.random() * 0.2), opacity: 0.85, scaleX: ltr },
          { x: fromLeft ? this.V + 300 : -300, y: `-=${this.H * 0.12}`, duration: 2.6 + Math.random(), ease: "none", onComplete: () => void gsap.set(fg, { opacity: 0 }) },
        );
      }
      const id = window.setTimeout(run, 18000 + Math.random() * 20000);
      this.cleanup.push(() => window.clearTimeout(id));
    };
    const id = window.setTimeout(run, 9000);
    this.cleanup.push(() => window.clearTimeout(id));
  }

  /* ───────────────────────── shadows ───────────────────────── */

  /** Pre-blur each cast shadow once into a small canvas; per frame only transforms change. */
  private makeShadows() {
    const work = () => {
      this.gs.forEach((g) => {
        const host = g.shadow;
        const img = host?.querySelector("img");
        if (!host || !img) return;
        const draw = () => {
          if (this.destroyed || !img.naturalWidth) return;
          const w = host.clientWidth;
          const h = host.clientHeight;
          if (!w || !h) return;
          const scale = 0.3;
          const c = document.createElement("canvas");
          c.width = Math.ceil(w * 1.24 * scale);
          c.height = Math.ceil(h * 1.24 * scale);
          const ctx = c.getContext("2d");
          if (!ctx) return;
          const blur = Number(host.dataset.blur || 14) * scale;
          if ("filter" in ctx) {
            ctx.filter = `brightness(0) blur(${blur.toFixed(1)}px)`;
            ctx.drawImage(img, w * 0.12 * scale, h * 0.12 * scale, w * scale, h * scale);
          } else {
            const ctx2 = ctx as CanvasRenderingContext2D;
            ctx2.drawImage(img, w * 0.12 * scale, h * 0.12 * scale, w * scale, h * scale);
            ctx2.globalCompositeOperation = "source-in";
            ctx2.fillStyle = "#000";
            ctx2.fillRect(0, 0, c.width, c.height);
          }
          host.replaceChildren(c);
        };
        if (img.complete && img.naturalWidth) draw();
        else img.addEventListener("load", draw, { once: true });
      });
    };
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (idle) idle(work);
    else window.setTimeout(work, 300);
  }

  /* ───────────────────────── Easter egg ───────────────────────── */

  private spark(origin: HTMLElement, count = 8) {
    const host = this.root.querySelector<HTMLElement>(".sparks");
    if (!host) return;
    const r = origin.getBoundingClientRect();
    const sr = this.stage.getBoundingClientRect();
    const cx = r.left + r.width * 0.5 - sr.left;
    const cy = r.top + r.height * 0.1 - sr.top;
    sound.play("spark");
    for (let i = 0; i < count; i++) {
      const b = document.createElement("span");
      b.className = "spark-bit";
      host.appendChild(b);
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      const d = 30 + Math.random() * 70;
      gsap.fromTo(
        b,
        { x: cx, y: cy, rotation: (a * 180) / Math.PI + 90, opacity: 1 },
        { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d + 40, opacity: 0, duration: 0.4 + Math.random() * 0.4, ease: "power2.out", onComplete: () => b.remove() },
      );
    }
  }

  private transformerClick(el: HTMLElement) {
    const now = performance.now();
    if (now - this.power.lastClick > 3000) this.power.clicks = 0;
    this.power.lastClick = now;
    this.power.clicks++;
    this.spark(el, 4 + this.power.clicks * 2);
    if (this.power.cut) {
      this.restorePower();
      return;
    }
    if (this.power.clicks >= 5) {
      this.power.clicks = 0;
      this.cutPower();
    }
  }

  private setTorch(x: number, y: number) {
    const r = this.stage.getBoundingClientRect();
    this.stage.style.setProperty("--tx", `${x - r.left}px`);
    this.stage.style.setProperty("--ty", `${y - r.top}px`);
  }

  private cutPower() {
    this.power.cut = true;
    this.power.startPos = this.pos;
    sound.play("flicker");
    const tl = gsap.timeline();
    tl.call(() => this.stage.classList.add("power-cut"))
      .to({}, { duration: 0.08 })
      .call(() => this.stage.classList.remove("power-cut"))
      .to({}, { duration: 0.06 })
      .call(() => this.stage.classList.add("power-cut"));
    const egg = this.root.querySelector<HTMLElement>(".egg-code-btn");
    egg?.setAttribute("tabindex", "0");
    egg?.removeAttribute("aria-hidden");
    window.clearTimeout(this.power.timer);
    this.power.timer = window.setTimeout(() => this.restorePower(), 25000);
  }

  restorePower() {
    if (!this.power.cut) return;
    this.power.cut = false;
    window.clearTimeout(this.power.timer);
    const egg = this.root.querySelector<HTMLElement>(".egg-code-btn");
    egg?.setAttribute("tabindex", "-1");
    egg?.setAttribute("aria-hidden", "true");
    const tl = gsap.timeline();
    tl.call(() => this.stage.classList.remove("power-cut"))
      .to({}, { duration: 0.05 })
      .call(() => this.stage.classList.add("power-cut"))
      .to({}, { duration: 0.09 })
      .call(() => this.stage.classList.remove("power-cut"));
    sound.play("flicker");
  }
}
