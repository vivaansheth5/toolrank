"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { QUICK_START_NEEDS } from "@/lib/needSignals";
import { cn } from "@/lib/utils";

const PLACEHOLDER_EXAMPLES = [
  "I want to make YouTube videos without spending hours editing",
  "I need a website builder for my startup",
  "I need an AI tool to create presentations",
  "I need software to manage my team's projects",
];

export default function NeedInput({
  initialValue = "",
  onSubmit,
  className,
}: {
  initialValue?: string;
  /** If provided, called with the trimmed need text instead of navigating —
   *  used when NeedInput is embedded directly inside the /discover flow. */
  onSubmit?: (need: string) => void;
  className?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();

  function go(need: string) {
    const trimmed = need.trim();
    if (!trimmed) return;
    if (onSubmit) onSubmit(trimmed);
    else router.push(`/discover?need=${encodeURIComponent(trimmed)}`);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    go(value);
  }

  return (
    <div className={cn("w-full", className)}>
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border-strong bg-surface p-3 shadow-sm transition-shadow focus-within:shadow-md sm:p-4">
        <label htmlFor="need-input" className="sr-only">
          What are you trying to get done?
        </label>
        <textarea
          id="need-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={PLACEHOLDER_EXAMPLES[0]}
          rows={2}
          className="w-full resize-none bg-transparent text-base text-foreground placeholder:text-muted focus:outline-none sm:text-lg"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
            <Sparkles size={13} className="text-accent-warm" />
            Describe it in your own words
          </span>
          <button
            type="submit"
            className="focus-ring ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-warm px-5 py-2.5 text-sm font-semibold text-accent-warm-foreground shadow-glow-warm transition-all hover:-translate-y-0.5 hover:bg-accent-warm-hover"
          >
            Find My Tools
            <ArrowRight size={15} />
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {QUICK_START_NEEDS.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => go(q.needText)}
            className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-sm text-foreground/80 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent hover:shadow-sm"
          >
            <span aria-hidden="true">{q.emoji}</span>
            {q.label}
          </button>
        ))}
      </div>
    </div>
  );
}
