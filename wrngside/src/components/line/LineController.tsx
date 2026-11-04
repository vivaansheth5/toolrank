"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LineEngine, type EngineData } from "./LineEngine";
import { useNavigate } from "@/components/shell/PageTransition";
import { launchFlight } from "@/lib/flight";
import { prefsStore, setPref, toast } from "@/lib/stores";
import { codes, copy } from "@/lib/site-config";
import { fill } from "@/lib/format";

const CATEGORY: Record<string, string> = { tees: "TEES", outerwear: "OUTERWEAR", bottoms: "BOTTOMS", extras: "EXTRAS" };

/** Mounts THE LINE engine on the server-rendered scene. */
export function LineController({ data }: { data: EngineData & { dropNumber: string } }) {
  const ref = useRef<HTMLSpanElement>(null);
  const router = useRouter();
  const navigate = useNavigate();
  const deps = useRef({ router, navigate });
  useEffect(() => {
    deps.current = { router, navigate };
  });

  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>(".line");
    if (!root) return;
    const n = data.garments.length;
    const pad = (v: number) => String(v).padStart(2, "0");
    const engine = new LineEngine(root, data, {
      navigateToProduct: (handle, source, cutout, angle) => {
        launchFlight(handle, source, cutout, angle);
        void deps.current.navigate(`/products/${handle}`, { flight: true });
      },
      quickAdd: async (handle, colour, size) => {
        const [{ getProductSync }, { addToBag }] = await Promise.all([import("@/lib/commerce"), import("@/lib/commerce/actions")]);
        const p = getProductSync(handle);
        return p ? addToBag(p, colour, size) : false;
      },
      prefetch: (href) => deps.current.router.prefetch(href),
      hudLabel: (i) => {
        if (i < 0) return { category: fill(copy.hero.hudStart, { drop: data.dropNumber }), count: `00 / ${pad(n)}` };
        if (i >= n) return { category: copy.hero.hudEnd, count: `${pad(n)} / ${pad(n)}` };
        return { category: CATEGORY[data.garments[i].category] ?? "", count: `${pad(i + 1)} / ${pad(n)}` };
      },
      hintSeen: () => prefsStore.get().lineHintSeen,
      markHintSeen: () => setPref("lineHintSeen", true),
      copyEgg: () => {
        void navigator.clipboard?.writeText(codes.powerCut.code).catch(() => {});
        toast(`${copy.powerCut.found} ${codes.powerCut.code} COPIED.`);
      },
    });
    engine.init();
    return () => engine.destroy();
  }, [data]);

  return <span ref={ref} hidden />;
}
