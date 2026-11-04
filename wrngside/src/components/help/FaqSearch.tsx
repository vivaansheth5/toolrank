"use client";

import { useMemo, useState } from "react";
import { faq } from "@/lib/site-config";
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
        <label htmlFor="faq-q">Search the FAQ</label>
        <input id="faq-q" type="search" className="input" placeholder="COD, restock, sizes…" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
      </div>
      <p className="t-meta text-muted" aria-live="polite">
        {list.length} {list.length === 1 ? "ANSWER" : "ANSWERS"}
      </p>
      {list.length ? (
        <Accordion key={q} items={list.map((f) => ({ title: f.q.toUpperCase(), content: <p>{f.a}</p> }))} defaultOpen={q ? 0 : -1} />
      ) : (
        <p className="t-h3">NOTHING ON THAT. ASK US ON WHATSAPP.</p>
      )}
    </div>
  );
}
