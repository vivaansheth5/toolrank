import { cn } from "@/lib/utils";
import type { PricingModel } from "@/data/types";

const STYLES: Record<PricingModel, string> = {
  Free: "bg-success-soft text-success",
  Freemium: "bg-accent-soft text-accent",
  Paid: "bg-stone-100 text-stone-700",
  "Free Trial": "bg-warning-soft text-warning",
};

export default function PricingBadge({
  model,
  className,
}: {
  model: PricingModel;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STYLES[model],
        className
      )}
    >
      {model}
    </span>
  );
}
