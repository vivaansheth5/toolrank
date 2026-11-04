import { formatPrice } from "@/lib/format";

export function Price({ amount, compareAt, className = "" }: { amount: number; compareAt?: number | null; className?: string }) {
  return (
    <span className={`price t-mono-lg ${className}`}>
      {compareAt && compareAt > amount && (
        <>
          <s className="price-was" aria-hidden="true">
            {formatPrice(compareAt)}
          </s>
          <span className="sr-only">Was {formatPrice(compareAt)}, now </span>
        </>
      )}
      <span>{formatPrice(amount)}</span>
    </span>
  );
}
