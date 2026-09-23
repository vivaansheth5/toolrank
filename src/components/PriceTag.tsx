"use client";

import { useCurrency } from "./CurrencyProvider";
import { localizeVendorPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { CurrencyCode } from "@/data/types";

/**
 * The single place every vendor price string gets localized for display.
 * Renders the primary (converted/official/original, per priority order)
 * price, and — whenever that primary price differs from what the vendor
 * actually charges — the real original price underneath, so a converted
 * figure is never mistaken for an official one.
 */
export default function PriceTag({
  vendorPriceString,
  vendorCurrency,
  countryPrices,
  fallback,
  primaryClassName,
  secondaryClassName,
  showOriginal = true,
  className,
}: {
  vendorPriceString?: string;
  vendorCurrency?: CurrencyCode;
  countryPrices?: Partial<Record<CurrencyCode, { amount: number; currency: CurrencyCode; official: true }>>;
  /** Shown when there's no price string at all — never a fabricated figure. */
  fallback?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
  showOriginal?: boolean;
  className?: string;
}) {
  const { currency } = useCurrency();
  const localized = localizeVendorPrice(vendorPriceString, currency, {
    vendorCurrency,
    countryPrice: countryPrices?.[currency],
  });

  if (!localized) {
    return fallback ? <span className={cn(primaryClassName, className)}>{fallback}</span> : null;
  }

  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span className={primaryClassName}>{localized.primary}</span>
      {showOriginal && localized.secondary && (
        <span className={cn("mt-0.5 text-xs font-normal text-muted", secondaryClassName)}>
          {localized.isOfficial ? "Vendor price: " : "Original vendor price: "}
          {localized.secondary}
        </span>
      )}
    </span>
  );
}
