import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Section({
  eyebrow,
  title,
  subtitle,
  cta,
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; href: string };
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8", className)}>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          {eyebrow && (
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-warm" aria-hidden="true" />
              {eyebrow}
            </p>
          )}
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h2>
          {subtitle && <p className="mt-2 max-w-2xl text-muted">{subtitle}</p>}
        </div>
        {cta && (
          <Link
            href={cta.href}
            className="focus-ring flex shrink-0 items-center gap-1 rounded-lg text-sm font-medium text-accent hover:text-accent-hover"
          >
            {cta.label}
            <ArrowRight size={15} />
          </Link>
        )}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}
