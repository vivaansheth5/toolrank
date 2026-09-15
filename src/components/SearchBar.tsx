"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchBar({
  variant = "compact",
  initialValue = "",
  placeholder = "What are you trying to do?",
  className,
  onSubmit,
}: {
  variant?: "hero" | "compact";
  initialValue?: string;
  placeholder?: string;
  className?: string;
  onSubmit?: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    onSubmit?.();
  }

  const isHero = variant === "hero";

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={cn(
        "flex w-full items-center gap-2 rounded-full border bg-surface shadow-sm transition-shadow focus-within:shadow-md",
        isHero
          ? "border-border-strong px-3 py-2 sm:px-4"
          : "border-border px-3 py-1.5",
        className
      )}
    >
      <Search className="shrink-0 text-muted" size={isHero ? 20 : 16} aria-hidden="true" />
      <label htmlFor="site-search" className="sr-only">
        Search tools
      </label>
      <input
        id="site-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted focus:outline-none",
          isHero ? "py-2 text-base sm:text-lg" : "py-1 text-sm"
        )}
      />
      <button
        type="submit"
        className={cn(
          "focus-ring shrink-0 rounded-full bg-accent font-medium text-accent-foreground transition-colors hover:bg-accent-hover",
          isHero ? "px-5 py-2.5 text-sm sm:text-base" : "px-3.5 py-1.5 text-xs"
        )}
      >
        Search
      </button>
    </form>
  );
}
