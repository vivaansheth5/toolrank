"use client";

import { useCurrency } from "./CurrencyProvider";
import { SUPPORTED_CURRENCIES, CURRENCY_META } from "@/lib/currency";
import { cn } from "@/lib/utils";

/**
 * Deliberately small and unobtrusive — a convenience, not the product.
 * Manual selection here always overrides auto-detection going forward
 * (CurrencyProvider persists it to cookie + localStorage).
 */
export default function CurrencySelector({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();

  return (
    <label className={cn("items-center", className)}>
      <span className="sr-only">Currency</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as typeof currency)}
        aria-label="Select display currency"
        className="focus-ring cursor-pointer appearance-none rounded-lg border border-border-strong bg-surface py-1.5 pl-2.5 pr-6 text-xs font-medium text-foreground/80 hover:text-foreground"
      >
        {SUPPORTED_CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {CURRENCY_META[code].symbol} {code}
          </option>
        ))}
      </select>
    </label>
  );
}
