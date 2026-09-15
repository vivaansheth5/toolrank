import { cn } from "@/lib/utils";

export default function AffiliateDisclosure({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-muted", className)}>
      Some links may be affiliate links. We may earn a commission if you purchase through them, at
      no extra cost to you.
    </p>
  );
}
