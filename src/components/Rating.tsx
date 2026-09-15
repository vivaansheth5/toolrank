import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Rating({
  value,
  reviewCount,
  size = "sm",
  className,
}: {
  value: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const starSize = size === "md" ? 18 : 14;
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(value);
          return (
            <Star
              key={i}
              size={starSize}
              className={filled ? "fill-amber-400 text-amber-400" : "fill-none text-border-strong"}
              strokeWidth={1.5}
            />
          );
        })}
      </div>
      <span className={cn("font-medium text-foreground", size === "md" ? "text-sm" : "text-xs")}>
        {value.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className="text-xs text-muted">({reviewCount.toLocaleString()})</span>
      )}
      <span className="sr-only">{value.toFixed(1)} out of 5 stars</span>
    </div>
  );
}
