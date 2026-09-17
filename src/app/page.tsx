import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import CategoryCard from "@/components/CategoryCard";
import ToolCard from "@/components/ToolCard";
import DealCard from "@/components/DealCard";
import Section from "@/components/Section";
import { categories } from "@/data/categories";
import { tools, getToolById } from "@/data/tools";
import { deals } from "@/data/deals";
import { searchSuggestions } from "@/lib/search";

export default function Home() {
  const popularTools = [...tools].sort((a, b) => b.popularity - a.popularity).slice(0, 9);
  const featuredDeals = deals.slice(0, 6);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-gradient-mesh">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-surface px-3 py-1 text-xs font-medium text-muted shadow-sm">
            <Sparkles size={13} className="text-accent-warm" />
            40+ AI &amp; software tools, one place to find them
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Stop searching.
            <br />
            <span className="text-gradient-brand">Find the right tool.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            Discover the best AI tools and software for exactly what you&apos;re trying to accomplish —
            without wasting hours comparing options.
          </p>

          <div className="mx-auto mt-8 max-w-2xl">
            <SearchBar variant="hero" />
          </div>

          <div className="mx-auto mt-4 flex max-w-2xl flex-wrap items-center justify-center gap-2">
            {searchSuggestions.map((example) => (
              <Link
                key={example}
                href={`/search?q=${encodeURIComponent(example)}`}
                className="focus-ring rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent hover:shadow-sm"
              >
                {example}
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/find-my-tool"
              className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-accent-warm px-5 py-2.5 text-sm font-medium text-accent-warm-foreground shadow-glow-warm transition-all hover:-translate-y-0.5 hover:bg-accent-warm-hover"
            >
              Find My Tool
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Browse"
        title="Explore by category"
        subtitle="From writing to coding, find every tool grouped the way you actually think about your work."
        cta={{ label: "View all categories", href: "/explore" }}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <CategoryCard
              key={category.slug}
              category={category}
              count={tools.filter((t) => t.category === category.slug).length}
            />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Trending"
        title="Popular right now"
        subtitle="The most-viewed tools on ToolDhundho this month."
        cta={{ label: "Explore all tools", href: "/explore" }}
        className="border-t border-border bg-surface"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popularTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </Section>

      <section className="relative overflow-hidden border-y border-border bg-[image:var(--gradient-brand)]">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Not sure what you need?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Answer a few questions and we&apos;ll recommend the tools that fit you best.
          </p>
          <Link
            href="/find-my-tool"
            className="focus-ring mt-7 inline-flex items-center gap-1.5 rounded-full bg-accent-warm px-5 py-2.5 text-sm font-medium text-accent-warm-foreground shadow-glow-warm transition-all hover:-translate-y-0.5 hover:bg-accent-warm-hover"
          >
            Find My Tool
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <Section
        eyebrow="Save"
        title="Latest deals"
        subtitle="Sample offer data for demonstration — always confirm current pricing with the provider."
        cta={{ label: "See all deals", href: "/deals" }}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredDeals.map((deal) => {
            const tool = getToolById(deal.toolId);
            if (!tool) return null;
            return <DealCard key={deal.id} deal={deal} tool={tool} />;
          })}
        </div>
      </Section>
    </>
  );
}
