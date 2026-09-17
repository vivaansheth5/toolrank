import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryIcon } from "./icons";
import { CATEGORY_ACCENT, CATEGORY_COLORS } from "./ToolLogo";
import { cn } from "@/lib/utils";
import type { CategoryInfo } from "@/data/types";

export default function CategoryCard({
  category,
  count,
}: {
  category: CategoryInfo;
  count: number;
}) {
  const accent = CATEGORY_ACCENT[category.slug];
  return (
    <Link
      href={`/category/${category.slug}`}
      style={{ ["--hover-shadow" as string]: accent.shadow }}
      className={cn(
        "group focus-ring flex flex-col rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--hover-shadow)]",
        accent.border
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
          CATEGORY_COLORS[category.slug]
        )}
      >
        <CategoryIcon name={category.icon} className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{category.name}</h3>
      <p className="mt-1 text-sm text-muted">{count} tools</p>
      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
        Explore
        <ArrowRight size={14} />
      </div>
    </Link>
  );
}
