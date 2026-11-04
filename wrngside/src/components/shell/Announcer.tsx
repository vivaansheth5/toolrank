"use client";

import { useEffect, useState } from "react";

/** Polite live region for cart updates and other non-visual announcements. */
let push: ((msg: string) => void) | null = null;
export function announce(msg: string) {
  push?.(msg);
}

export function Announcer() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    push = (m) => {
      setMsg("");
      window.setTimeout(() => setMsg(m), 60);
    };
    return () => {
      push = null;
    };
  }, []);
  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {msg}
    </div>
  );
}
