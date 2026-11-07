"use client";

import { useId, useState, type ReactNode } from "react";
import { PlusIcon } from "./Icons";

/** Disclosure accordion with animated height (grid-rows trick, no measuring). */
export function Accordion({ items, defaultOpen = -1 }: { items: { title: string; content: ReactNode; id?: string }[]; defaultOpen?: number }) {
  const [open, setOpen] = useState<number>(defaultOpen);
  const base = useId();
  return (
    <div className="acc">
      {items.map((it, i) => {
        const isOpen = open === i;
        const hid = `${base}-h${i}`;
        const pid = `${base}-p${i}`;
        return (
          <div key={it.title} className="acc-item" data-open={isOpen || undefined} id={it.id}>
            <h3 className="acc-h">
              <button type="button" id={hid} className="acc-btn t-meta" aria-expanded={isOpen} aria-controls={pid} onClick={() => setOpen(isOpen ? -1 : i)}>
                <span>{it.title}</span>
                <PlusIcon className="acc-icon" />
              </button>
            </h3>
            <div id={pid} role="region" aria-labelledby={hid} className="acc-panel" inert={!isOpen}>
              <div className="acc-inner">{it.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
