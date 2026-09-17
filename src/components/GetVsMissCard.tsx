import { Check, Minus } from "lucide-react";
import ToolLogo from "./ToolLogo";
import type { GetVsMiss } from "@/lib/needCompare";

export default function GetVsMissCard({ data }: { data: GetVsMiss }) {
  const { tool, get, miss } = data;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center gap-3 border-b border-border bg-stone-50/60 px-5 py-3">
        <ToolLogo name={tool.name} category={tool.category} size="sm" />
        <span className="font-semibold text-foreground">{tool.name}</span>
      </div>
      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-success">You get</p>
          <ul className="mt-2 space-y-1.5">
            {get.length > 0 ? (
              get.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                  <Check size={15} className="mt-0.5 shrink-0 text-success" />
                  {item}
                </li>
              ))
            ) : (
              <li className="text-sm text-muted">No standout capabilities on record for this need.</li>
            )}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">You might miss</p>
          <ul className="mt-2 space-y-1.5">
            {miss.length > 0 ? (
              miss.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                  <Minus size={15} className="mt-0.5 shrink-0 text-muted" />
                  {item}
                </li>
              ))
            ) : (
              <li className="text-sm text-muted">No known limitations on record.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
