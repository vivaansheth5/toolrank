/**
 * Headline line reveal: each line rises from 110% inside an overflow-hidden
 * mask (60ms stagger). "mount" plays on mount (CSS, no JS needed); "inview"
 * waits for the RevealObserver.
 */
export function Lines({ lines, mode = "inview", delay = 0, className = "" }: { lines: string[]; mode?: "mount" | "inview"; delay?: number; className?: string }) {
  return (
    <span className={`lines ${className}`} data-mode={mode} style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      {lines.map((l, i) => (
        <span key={i} className="ln" style={{ "--i": i } as React.CSSProperties}>
          <span>{l}</span>
        </span>
      ))}
    </span>
  );
}
