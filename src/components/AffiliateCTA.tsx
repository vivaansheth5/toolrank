"use client";

import { ExternalLink } from "lucide-react";
import { trackOutboundClick } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { CtaPlacement, Tool } from "@/data/types";

/**
 * The one component every outbound monetization button in ToolDhundho must go
 * through. It fires a trackOutboundClick event, then opens the link — so
 * every CTA is measurable the same way without duplicating tracking code
 * at each call site.
 */
export default function AffiliateCTA({
  tool,
  href,
  isAffiliate,
  placement,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  tool: Tool;
  href: string;
  isAffiliate: boolean;
  placement: CtaPlacement;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
}) {
  function handleClick() {
    trackOutboundClick({
      toolId: tool.id,
      toolName: tool.name,
      placement,
      destinationType: isAffiliate ? "affiliate" : "official",
      destinationUrl: href,
    });
  }

  return (
    <a
      href={href}
      target="_blank"
      rel={
        isAffiliate
          ? "noopener noreferrer nofollow sponsored"
          : "noopener noreferrer nofollow"
      }
      onClick={handleClick}
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all",
        size === "sm" ? "px-3.5 py-2 text-xs" : "px-4 py-2.5 text-sm",
        variant === "primary"
          ? "bg-accent-warm text-accent-warm-foreground shadow-glow-warm hover:-translate-y-0.5 hover:bg-accent-warm-hover"
          : "border border-border-strong text-foreground hover:bg-stone-50",
        className
      )}
    >
      {children}
      <ExternalLink size={14} />
    </a>
  );
}
