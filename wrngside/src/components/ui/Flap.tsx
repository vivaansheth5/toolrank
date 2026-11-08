import { pad2 } from "@/lib/format";
import "./flap.css";

/**
 * A two-digit flap that flips when its value changes. `null` (before the
 * browser knows the time) shows dashes rather than a made-up number.
 */
export function Flap({ value, label }: { value: number | null; label: string }) {
  const v = value === null ? "--" : pad2(value);
  return (
    <span className="flap">
      <span className="flap-digits tabular" aria-hidden="true">
        {v.split("").map((d, i) => (
          <span key={`${i}-${d}`} className="flap-d">
            {d}
          </span>
        ))}
      </span>
      <span className="flap-label t-meta">{label}</span>
    </span>
  );
}
