import Link from "next/link";
import { Trophy } from "lucide-react";
import ToolLogo, { CATEGORY_ACCENT, CATEGORY_COLORS } from "./ToolLogo";
import { cn } from "@/lib/utils";
import type { CompareVerdict } from "@/lib/verdict";

export default function VerdictCard({ verdict }: { verdict: CompareVerdict }) {
  const { tool, label, reason } = verdict;
  const [softBg, softText] = CATEGORY_COLORS[tool.category].split(" ");
  const accent = CATEGORY_ACCENT[tool.category];

  return (
    <div
      style={{ ["--hover-shadow" as string]: accent.shadow }}
      className={cn(
        "flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--hover-shadow)]",
        accent.border
      )}
    >
      <ToolLogo name={tool.name} category={tool.category} />
      <div className="min-w-0">
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", softBg, softText)}>
          <Trophy size={12} />
          {label}
        </span>
        <p className="mt-2 text-sm font-semibold text-foreground">
          <Link href={`/tools/${tool.slug}`} className="focus-ring rounded hover:text-accent">
            {tool.name}
          </Link>
        </p>
        <p className="mt-1 text-sm text-muted">{reason}</p>
      </div>
    </div>
  );
}
