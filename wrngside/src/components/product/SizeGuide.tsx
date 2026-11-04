"use client";

import { useRef, useState } from "react";
import { sizeCharts, modelInfo, type SizeChartKey, ui } from "@/lib/site-config";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { CloseIcon } from "@/components/ui/Icons";
import { fill } from "@/lib/format";

/** Measurement table with a cm/in toggle and a how-to-measure diagram. */
export function SizeGuideTable({ chart }: { chart: SizeChartKey }) {
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const c = sizeCharts[chart];
  const fmt = (v: number) => (unit === "cm" ? String(v) : (v / 2.54).toFixed(1));
  const isMeasure = !["onesize", "socks"].includes(chart);
  return (
    <div className="sg">
      {isMeasure && (
        <div className="seg" role="radiogroup" aria-label="Units">
          {(["cm", "in"] as const).map((u) => (
            <button key={u} type="button" role="radio" aria-checked={unit === u} className="seg-btn" onClick={() => setUnit(u)}>
              {u.toUpperCase()}
            </button>
          ))}
        </div>
      )}
      {chart === "onesize" ? (
        <p>{c.note}</p>
      ) : (
        <div className="sg-table-wrap" data-lenis-prevent>
          <table className="sg-table">
            <caption className="sr-only">{fill(ui.product.sizeGuideDrawer.caption, { unit: chart === "socks" ? ui.product.sizeGuideDrawer.unitNames.shoe : ui.product.sizeGuideDrawer.unitNames[unit] })}</caption>
            <thead>
              <tr>
                <th scope="col">{ui.product.sizeGuideDrawer.size}</th>
                {c.columns.map((col) => (
                  <th key={col} scope="col">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.rows.map((r) => (
                <tr key={r.size}>
                  <th scope="row">{r.size}</th>
                  {r.values.map((v, i) => (
                    <td key={i} className="tabular">
                      {chart === "socks" && i < 2 ? v : fmt(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {isMeasure && (
        <>
          <p className="t-meta text-muted">{c.note}</p>
          <figure className="sg-diagram">
            <svg viewBox="0 0 320 220" role="img" aria-label="How to measure: chest across the body below the armholes, length from the shoulder to the hem, shoulder seam to seam, sleeve from the shoulder seam to the cuff.">
              <path d="M110 30 L80 38 L30 80 L52 112 L82 92 L82 200 L238 200 L238 92 L268 112 L290 80 L240 38 L210 30 Q160 52 110 30 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M84 98 H236" stroke="#ff3b1f" strokeWidth="1.5" markerStart="url(#a)" markerEnd="url(#a)" />
              <text x="160" y="92" textAnchor="middle" className="svg-mono" fontSize="10" fill="currentColor">{ui.product.sizeGuideDrawer.chest}</text>
              <path d="M250 40 V198" stroke="#ff3b1f" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="256" y="150" className="svg-mono" fontSize="10" fill="currentColor">{ui.product.sizeGuideDrawer.length}</text>
              <path d="M82 36 H238" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
              <text x="160" y="24" textAnchor="middle" className="svg-mono" fontSize="10" fill="currentColor">{ui.product.sizeGuideDrawer.shoulder}</text>
              <path d="M240 40 L288 80" stroke="#ff3b1f" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="276" y="56" className="svg-mono" fontSize="10" fill="currentColor">{ui.product.sizeGuideDrawer.sleeve}</text>
              <defs>
                <marker id="a" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto">
                  <circle cx="3" cy="3" r="2" fill="#ff3b1f" />
                </marker>
              </defs>
            </svg>
            <figcaption className="t-meta">{ui.product.sizeGuideDrawer.howTo}</figcaption>
          </figure>
          <p className="sg-model">{modelInfo.default}</p>
        </>
      )}
    </div>
  );
}

export function SizeGuideDrawer({ open, onClose, chart, title }: { open: boolean; onClose: () => void; chart: SizeChartKey; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, { onEscape: onClose });
  useScrollLock(open);
  return (
    <div className="drawer-root" data-open={open}>
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="drawer theme-day" role="dialog" aria-modal="true" aria-labelledby="sg-title" inert={!open} data-lenis-prevent>
        <header className="drawer-head">
          <h2 id="sg-title" className="t-h3">
            {ui.product.sizeGuideDrawer.title} <span className="t-meta text-muted">{title}</span>
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close size guide">
            <CloseIcon />
          </button>
        </header>
        <div className="drawer-pad">
          <SizeGuideTable chart={chart} />
        </div>
      </div>
    </div>
  );
}
