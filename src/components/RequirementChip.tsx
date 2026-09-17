"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RequirementChip({
  emoji,
  label,
  active = false,
  onClick,
  removable = false,
  onRemove,
  size = "md",
}: {
  emoji?: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
  size?: "sm" | "md";
}) {
  const interactive = Boolean(onClick);
  const Tag = interactive ? "button" : "span";

  return (
    <Tag
      type={interactive ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "focus-ring inline-flex items-center gap-1.5 rounded-full border font-medium transition-all",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
        active
          ? "border-accent bg-accent-soft text-accent shadow-sm"
          : "border-border bg-surface text-foreground/80",
        interactive && !active && "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm"
      )}
    >
      {emoji && <span aria-hidden="true">{emoji}</span>}
      {label}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="focus-ring -mr-1 rounded-full text-muted hover:text-foreground"
          aria-label={`Remove ${label}`}
        >
          <X size={13} />
        </button>
      )}
    </Tag>
  );
}
