/**
 * WRNGSIDE wordmark with the mirrored N (И) as the brand device. On hover,
 * letters flip one by one (rotateY 180°, 30ms stagger) to their mirrored
 * "wrong side" and back. Replace with the supplied SVG when it arrives.
 */
export function Logo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const letters = "WRNGSIDE".split("");
  return (
    <span className={`logo logo-${size} ${className}`} aria-label="WRNGSIDE" role="img">
      {letters.map((ch, i) => (
        <span key={i} className={`logo-ch${ch === "N" && i === 2 ? " logo-n" : ""}`} style={{ "--i": i } as React.CSSProperties} aria-hidden="true">
          {ch}
        </span>
      ))}
    </span>
  );
}
