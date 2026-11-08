"use client";

import { useEffect, useRef, useState } from "react";
import { dismissToast, toastStore, type Toast } from "@/lib/stores";
import { useStore } from "@/lib/store";

function ToastItem({ t }: { t: Toast }) {
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<number>(0);
  const start = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLeaving(true), t.duration ?? 3000);
  };
  useEffect(() => {
    start();
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!leaving) return;
    const id = window.setTimeout(() => dismissToast(t.id), 240);
    return () => window.clearTimeout(id);
  }, [leaving, t.id]);
  return (
    <div className="toast" data-leaving={leaving || undefined} onPointerEnter={() => window.clearTimeout(timer.current)} onPointerLeave={start}>
      <span>{t.message}</span>
      {t.action && (
        <button
          type="button"
          className="toast-action"
          onClick={() => {
            t.action!.onClick();
            setLeaving(true);
          }}
        >
          {t.action.label}
        </button>
      )}
    </div>
  );
}

export function Toaster() {
  const toasts = useStore(toastStore);
  return (
    <div className="toaster" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} />
      ))}
    </div>
  );
}
