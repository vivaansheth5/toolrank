/** Torn wheat-paste edge along the top of the daylight page (LIGHTS ON). */
export function TornEdge() {
  // Deterministic jagged edge with paper fibres.
  const pts: string[] = [];
  let s = 7;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let x = 0; x <= 1000; x += 8 + r() * 14) pts.push(`${x.toFixed(1)} ${(10 + r() * 28 + (r() > 0.85 ? 10 : 0)).toFixed(1)}`);
  pts.push("1000 20");
  const d = `M0 46 L0 20 L${pts.join(" L")} L1000 46 Z`;
  const fibre = `M${pts.join(" L")}`;
  return (
    <div className="tear-edge" aria-hidden="true">
      <svg viewBox="0 0 1000 46" preserveAspectRatio="none">
        <path d={d} fill="currentColor" />
        <path d={fibre} fill="none" stroke="#fffaf0" strokeWidth="1.6" vectorEffect="non-scaling-stroke" opacity="0.9" />
      </svg>
    </div>
  );
}
