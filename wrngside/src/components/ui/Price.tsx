import { formatPrice, fill } from "@/lib/format";
import { ui } from "@/lib/site-config";

export function Price({ amount, compareAt, className = "" }: { amount: number; compareAt?: number | null; className?: string }) {
  return (
    <span className={`price t-mono-lg ${className}`}>
      {compareAt && compareAt > amount && (
        <>
          <s className="price-was" aria-hidden="true">
            {formatPrice(compareAt)}
          </s>
          <span className="sr-only">{fill(ui.common.was, { price: formatPrice(compareAt) })}</span>
        </>
      )}
      <span>{formatPrice(amount)}</span>
    </span>
  );
}
