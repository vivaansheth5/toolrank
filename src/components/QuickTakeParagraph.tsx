import { Sparkles } from "lucide-react";

/**
 * Section C: a short contextual paragraph, not a bullet list or a badge —
 * the deterministic prose from lib/comparisonNarrative's
 * buildQuickTakeParagraph, which never declares a universal winner.
 */
export default function QuickTakeParagraph({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="rounded-2xl border border-accent/20 bg-accent-soft/40 p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Sparkles size={15} className="text-accent" />
        Quick take
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-foreground/80">{text}</p>
    </div>
  );
}
