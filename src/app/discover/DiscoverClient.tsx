"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import NeedInput from "@/components/NeedInput";
import RequirementChip from "@/components/RequirementChip";
import ToolMatchCard from "@/components/ToolMatchCard";
import EmptyState from "@/components/EmptyState";
import { tools } from "@/data/tools";
import { matchToolsToNeed, explainMatch } from "@/lib/needMatch";
import { getWhatYouGetAndMiss } from "@/lib/needCompare";
import { parseNeed, refineParsedNeed, QUICK_START_NEEDS } from "@/lib/needSignals";
import type { NeedRefinements } from "@/lib/needSignals";
import { detectComparisonIntent } from "@/lib/comparisonIntent";
import { AUDIENCE_LABELS, EXPERIENCE_LABELS, STRENGTH_LABELS } from "@/lib/utils";
import { useCurrency } from "@/components/CurrencyProvider";
import { getPriceTierLabel } from "@/lib/currency";
import type { ExperienceLevel, PriceTier, Strength } from "@/data/types";

/** Exact-tool-comparison intent overrides discovery entirely: when the user
 *  names 2+ known tools and asks to compare them, we skip the
 *  recommendation engine and go straight to the existing direct-comparison
 *  route (/compare?tools=...) rather than showing unrelated "recommended"
 *  tools instead of the ones they explicitly asked about. */
function comparisonRedirectHref(text: string): string | null {
  const result = detectComparisonIntent(text);
  if (!result.isComparisonIntent || result.identifiedTools.length < 2) return null;
  const params = new URLSearchParams();
  params.set("tools", result.identifiedTools.map((m) => m.tool.slug).join(","));
  params.set("need", text);
  return `/compare?${params.toString()}`;
}

const MAX_COMPARE = 3;
const BUDGET_OPTIONS: PriceTier[] = ["free", "under-500", "500-1000", "1000-plus"];
const EXPERIENCE_OPTIONS: ExperienceLevel[] = ["beginner", "intermediate", "advanced"];
const PRIORITY_OPTIONS: Strength[] = ["ease-of-use", "features", "price", "quality", "speed"];

type Step = "input" | "understanding" | "results" | "redirecting";

export default function DiscoverClient({ initialNeed }: { initialNeed: string }) {
  const router = useRouter();
  const initialRedirectHref = useMemo(
    () => (initialNeed ? comparisonRedirectHref(initialNeed) : null),
    [initialNeed]
  );
  const [step, setStep] = useState<Step>(
    initialRedirectHref ? "redirecting" : initialNeed ? "understanding" : "input"
  );
  const [needText, setNeedText] = useState(initialNeed);
  const [excludedChipIds, setExcludedChipIds] = useState<Set<string>>(new Set());
  const [refinements, setRefinements] = useState<NeedRefinements>({});
  const [selected, setSelected] = useState<string[]>([]);
  const { currency } = useCurrency();

  // Covers direct/home-hero entry (?need=... already names 2+ tools to
  // compare) — handleNeedSubmit below covers the in-page textarea. The
  // initial `step` above already skips rendering the wrong UI for a frame;
  // this effect just performs the actual navigation.
  useEffect(() => {
    if (initialRedirectHref) router.replace(initialRedirectHref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRedirectHref]);

  const baseParsedNeed = useMemo(() => parseNeed(needText), [needText]);
  const parsedNeed = useMemo(
    () => refineParsedNeed(baseParsedNeed, { excludeChipIds: excludedChipIds, refinements }),
    [baseParsedNeed, excludedChipIds, refinements]
  );

  const matches = useMemo(() => matchToolsToNeed(parsedNeed, tools, 5), [parsedNeed]);
  const selectedTools = selected.map((slug) => tools.find((t) => t.slug === slug)).filter((t): t is (typeof tools)[number] => Boolean(t));

  function handleNeedSubmit(text: string) {
    setNeedText(text);
    const href = comparisonRedirectHref(text);
    if (href) {
      router.push(href);
      return;
    }
    setExcludedChipIds(new Set());
    setSelected([]);
    setStep("understanding");
  }

  function toggleChip(id: string) {
    setExcludedChipIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setRefinement<K extends keyof NeedRefinements>(key: K, value: NeedRefinements[K]) {
    setRefinements((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }));
  }

  function clearBudget() {
    setRefinements((prev) => ({ ...prev, budget: undefined }));
  }

  function toggleSelectTool(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, slug];
    });
  }

  const compareHref = (() => {
    const params = new URLSearchParams();
    params.set("tools", selected.join(","));
    params.set("need", needText);
    if (refinements.experience) params.set("experience", refinements.experience);
    if (refinements.budget) params.set("budget", refinements.budget);
    if (refinements.priority) params.set("priority", refinements.priority);
    return `/compare?${params.toString()}`;
  })();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      {step === "redirecting" && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <Sparkles size={20} className="animate-pulse text-accent-warm" />
          <p className="text-sm font-medium text-muted">Taking you straight to the comparison you asked for…</p>
        </div>
      )}

      {step === "input" && (
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-surface px-3 py-1 text-xs font-medium text-muted shadow-sm">
            <Sparkles size={13} className="text-accent-warm" />
            Tell us what you&apos;re trying to get done
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What are you trying to get done?
          </h1>
          <p className="mt-2 max-w-lg text-muted">
            Describe your goal in your own words and we&apos;ll match you with tools that actually fit.
          </p>
          <div className="mt-8 w-full max-w-2xl">
            <NeedInput initialValue={needText} onSubmit={handleNeedSubmit} />
          </div>
          <p className="mt-6 text-sm text-muted">
            Prefer a quick questionnaire instead?{" "}
            <Link href="/find-my-tool" className="font-medium text-accent hover:text-accent-hover">
              Try Find My Tool
            </Link>
          </p>
        </div>
      )}

      {step === "understanding" && (
        <div>
          <button
            type="button"
            onClick={() => setStep("input")}
            className="focus-ring inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Edit what you typed
          </button>

          <p className="mt-4 text-sm text-muted">You said:</p>
          <p className="mt-1 text-lg font-medium text-foreground">&ldquo;{needText}&rdquo;</p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Got it — you&apos;re looking for:</h2>

          {baseParsedNeed.chips.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {baseParsedNeed.chips.map((chip) => (
                <RequirementChip
                  key={chip.id}
                  emoji={chip.emoji}
                  label={chip.label}
                  active={!excludedChipIds.has(chip.id)}
                  removable={!excludedChipIds.has(chip.id)}
                  onRemove={() => toggleChip(chip.id)}
                  onClick={excludedChipIds.has(chip.id) ? () => toggleChip(chip.id) : undefined}
                />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">
              We couldn&apos;t pull specific requirements from that — try a quick-start option, or refine below.
            </p>
          )}

          {baseParsedNeed.chips.length === 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_START_NEEDS.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => handleNeedSubmit(q.needText)}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-sm text-foreground/80 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
                >
                  <span aria-hidden="true">{q.emoji}</span>
                  {q.label}
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Budget</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {BUDGET_OPTIONS.map((tier) => (
                  <RequirementChip
                    key={tier}
                    label={getPriceTierLabel(tier, currency)}
                    active={refinements.budget === tier}
                    onClick={() => setRefinement("budget", tier)}
                    size="sm"
                  />
                ))}
                <RequirementChip
                  label="Flexible"
                  active={refinements.budget === undefined}
                  onClick={clearBudget}
                  size="sm"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Experience</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {EXPERIENCE_OPTIONS.map((level) => (
                  <RequirementChip
                    key={level}
                    label={EXPERIENCE_LABELS[level]}
                    active={refinements.experience === level}
                    onClick={() => setRefinement("experience", level)}
                    size="sm"
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Priority</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRIORITY_OPTIONS.map((priority) => (
                  <RequirementChip
                    key={priority}
                    label={STRENGTH_LABELS[priority]}
                    active={refinements.priority === priority}
                    onClick={() => setRefinement("priority", priority)}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep("results")}
            className="focus-ring mt-8 inline-flex items-center gap-1.5 rounded-full bg-accent-warm px-6 py-3 text-sm font-semibold text-accent-warm-foreground shadow-glow-warm transition-all hover:-translate-y-0.5 hover:bg-accent-warm-hover"
          >
            See matching tools
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {step === "results" && (
        <div>
          <button
            type="button"
            onClick={() => setStep("understanding")}
            className="focus-ring inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Refine your search
          </button>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Tools that fit what you&apos;re looking for
          </h1>
          <p className="mt-1.5 text-muted">
            Ranked by how well each one matches what you told us — no black box, just fit.
          </p>

          {matches.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="No strong matches yet"
                description="Try describing your goal a little differently, or explore the full catalog."
              />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {matches.map((match) => {
                const { reasons } = explainMatch(match, parsedNeed);
                const { get, miss } = getWhatYouGetAndMiss(match.tool, parsedNeed);
                return (
                  <ToolMatchCard
                    key={match.tool.slug}
                    tool={match.tool}
                    matchPercent={match.matchPercent}
                    reasons={reasons}
                    bestFor={`Best for ${match.tool.targetAudience
                      .slice(0, 2)
                      .map((a) => AUDIENCE_LABELS[a])
                      .join(" & ")}`}
                    get={get}
                    miss={miss}
                    selectable
                    selected={selected.includes(match.tool.slug)}
                    onToggleSelect={toggleSelectTool}
                  />
                );
              })}
            </div>
          )}

          <div className="mt-10 rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-base font-semibold text-foreground">Want to compare these?</h2>
            <p className="mt-1 text-sm text-muted">
              Select 2–3 tools above, then compare them against exactly what you told us.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted">
                {selected.length === 0
                  ? "Nothing selected yet"
                  : `${selected.length} selected: ${selectedTools.map((t) => t.name).join(", ")}`}
              </span>
              {selected.length >= 2 ? (
                <Link
                  href={compareHref}
                  className="focus-ring ml-auto inline-flex items-center gap-1.5 rounded-full bg-accent-warm px-5 py-2.5 text-sm font-semibold text-accent-warm-foreground shadow-glow-warm transition-all hover:-translate-y-0.5 hover:bg-accent-warm-hover"
                >
                  Compare based on your needs
                  <ArrowRight size={15} />
                </Link>
              ) : (
                <span className="ml-auto text-xs text-muted">Pick at least 2 to compare</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
