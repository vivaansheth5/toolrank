"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import SearchBar from "./SearchBar";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/find-my-tool", label: "Find My Tool" },
  { href: "/compare", label: "Compare" },
  { href: "/deals", label: "Deals" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="focus-ring flex shrink-0 items-center gap-1.5 rounded-lg"
        >
          <span className="text-lg font-semibold tracking-tight text-foreground">ToolDhundho</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "focus-ring rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-accent" : "text-foreground/70 hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden w-full max-w-xs md:block">
          <SearchBar variant="compact" />
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="focus-ring ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-foreground md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 pb-5 pt-4 md:hidden">
          <SearchBar variant="compact" className="mb-4" onSubmit={() => setOpen(false)} />
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname?.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "focus-ring rounded-lg px-3 py-2.5 text-base font-medium",
                    active ? "bg-accent-soft text-accent" : "text-foreground/80 hover:bg-stone-50"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
