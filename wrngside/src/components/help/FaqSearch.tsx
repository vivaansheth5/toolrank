"use client";

import { useMemo, useState } from "react";
import { faq, ui } from "@/lib/site-config";
import { Accordion } from "@/components/ui/Accordion";

/** Searchable FAQ accordions. */
export function FaqSearch() {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return faq;
    return faq.filter((f) => `${f.q} ${f.a} ${(f.tags ?? []).join(" ")}`.toLowerCase().includes(t));
  }, [q]);
  return (
    <div className="faq">
      <div className="field">
        <label htmlFor="faq-q">{ui.help.faq.label}</label>
        <input id="faq-q" type="search" className="input" placeholder={ui.help.faq.placeholder} value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
      </div>
      <p className="t-meta text-muted" aria-live="polite">
        {list.length} {list.length === 1 ? ui.help.faq.answer : ui.help.faq.answers}
      </p>
      {list.length ? (
        <Accordion key={q} items={list.map((f) => ({ title: f.q.toUpperCase(), content: <p>{f.a}</p> }))} defaultOpen={q ? 0 : -1} />
      ) : (
        <p className="t-h3">{ui.help.faq.empty}</p>
      )}
    </div>
  );
}
