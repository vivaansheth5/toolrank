import Link from "next/link";
import ToolLogo from "./ToolLogo";
import type { CompareVerdict } from "@/lib/verdict";

export default function VerdictCard({ verdict }: { verdict: CompareVerdict }) {
  const { tool, label, reason } = verdict;

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5">
      <ToolLogo name={tool.name} category={tool.category} />
      <div className="min-w-0">
        <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
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
