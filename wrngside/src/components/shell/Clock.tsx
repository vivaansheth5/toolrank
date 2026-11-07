"use client";

import { useEffect, useState } from "react";
import { formatIstClock } from "@/lib/format";

/** Live IST clock. Renders a stable placeholder until mounted (no hydration mismatch). */
export function Clock({ prefix = "", suffix = " IST" }: { prefix?: string; suffix?: string }) {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setT(formatIstClock(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="tabular" suppressHydrationWarning>
      {prefix}
      {t ?? "--:-- --"}
      {suffix}
    </span>
  );
}
