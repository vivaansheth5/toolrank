import Link from "next/link";
import ToolLogo from "./ToolLogo";
import type { ToolFitSummary } from "@/lib/needCompare";

export default function NeedFitCard({ fit }: { fit: ToolFitSummary }) {
  const { tool, emoji, label } = fit;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <ToolLogo name={tool.name} category={tool.category} size="sm" />
      <div className="min-w-0 flex-1">
        <Link href={`/tools/${tool.slug}`} className="focus-ring rounded text-sm font-semibold text-foreground hover:text-accent">
          {tool.name}
        </Link>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-foreground/80">
          <span aria-hidden="true">{emoji}</span>
          {label}
        </p>
      </div>
    </div>
  );
}
