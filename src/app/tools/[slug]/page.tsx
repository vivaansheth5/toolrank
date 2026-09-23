import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Check,
  DollarSign,
  Flame,
  Info,
  Layers,
  Scale,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Users,
  X,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ToolLogo, { CATEGORY_ACCENT, CATEGORY_COLORS, CATEGORY_RING } from "@/components/ToolLogo";
import Rating from "@/components/Rating";
import PricingBadge from "@/components/PricingBadge";
import ToolCard from "@/components/ToolCard";
import OfferCard from "@/components/OfferCard";
import PriceTag from "@/components/PriceTag";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import AffiliateCTA from "@/components/AffiliateCTA";
import { tools, getToolBySlug } from "@/data/tools";
import { getCategory } from "@/data/categories";
import { getBestDealForTool } from "@/data/deals";
import { getRelatedFeaturedComparisons } from "@/data/featuredComparisons";
import { AUDIENCE_LABELS, cn, PRICING_DISCLAIMER } from "@/lib/utils";

function SectionHeading({
  icon: Icon,
  iconClassName,
  children,
}: {
  icon: React.ElementType;
  iconClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2.5 text-xl font-semibold text-foreground">
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          iconClassName ?? "bg-accent-soft text-accent"
        )}
      >
        <Icon size={16} />
      </span>
      {children}
    </h2>
  );
}

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata(props: PageProps<"/tools/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return {
    title: `${tool.name} — Reviews, Pricing & Alternatives`,
    description: tool.tagline,
  };
}

export default async function ToolDetailPage(props: PageProps<"/tools/[slug]">) {
  const { slug } = await props.params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const category = getCategory(tool.category);
  const related = tools
    .filter((t) => t.category === tool.category && t.slug !== tool.slug)
    .sort((a, b) => b.rating - a.rating);
  const alternatives = related.slice(0, 3);
  const featuredPartners = getRelatedFeaturedComparisons(tool.slug, 5)
    .map((c) => c.tools.find((t) => t.slug !== tool.slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const compareTargets = Array.from(
    new Map([...featuredPartners, ...related].map((t) => [t.slug, t])).values()
  ).slice(0, 5);
  const similar = related.slice(0, 6);
  const categoryStyle = CATEGORY_COLORS[tool.category];
  const categorySoftBg = categoryStyle.split(" ")[0];
  const categoryRing = CATEGORY_RING[tool.category];
  const categoryAccent = CATEGORY_ACCENT[tool.category];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Explore", href: "/explore" },
          { label: category?.name ?? tool.category, href: `/category/${tool.category}` },
          { label: tool.name },
        ]}
      />

      <div
        className={cn(
          "mt-6 overflow-hidden rounded-3xl border border-border",
          categorySoftBg
        )}
      >
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <ToolLogo
              name={tool.name}
              category={tool.category}
              size="lg"
              className={cn("ring-4 ring-offset-0", categoryRing)}
            />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {tool.name}
              </h1>
              <p className="mt-1.5 max-w-xl text-muted">{tool.tagline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Rating value={tool.rating} reviewCount={tool.reviewCount} size="md" />
                <Link
                  href={`/category/${tool.category}`}
                  className="focus-ring rounded-md bg-surface px-2.5 py-1 text-xs font-medium text-muted ring-1 ring-inset ring-border transition-colors hover:text-foreground"
                >
                  {category?.name}
                </Link>
                <PricingBadge model={tool.pricing.model} />
                {tool.freePlan && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                    <Check size={13} /> Free plan available
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-3 sm:flex-col">
            <AffiliateCTA tool={tool} href={tool.officialUrl} isAffiliate={false} placement="tool_detail">
              Visit Official Site
            </AffiliateCTA>
            <Link
              href={`/compare?tools=${tool.slug}`}
              className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg border border-border-strong bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:shadow-sm"
            >
              Compare
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl bg-accent-soft px-4 py-3 text-xs text-accent">
        <Info size={15} className="mt-0.5 shrink-0" />
        {PRICING_DISCLAIMER}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <section>
            <SectionHeading icon={Sparkles} iconClassName={cn(categorySoftBg, categoryStyle.split(" ")[1])}>
              Why use {tool.name}?
            </SectionHeading>
            <p className="mt-3 leading-relaxed text-foreground/80">{tool.description}</p>
          </section>

          <section>
            <SectionHeading icon={Users}>Best for</SectionHeading>
            <div className="mt-3 flex flex-wrap gap-2">
              {tool.targetAudience.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-stone-50 px-3 py-1.5 text-sm text-foreground/80 ring-1 ring-inset ring-border"
                >
                  {AUDIENCE_LABELS[a]}
                </span>
              ))}
            </div>
          </section>

          <section>
            <SectionHeading icon={Layers}>Key features</SectionHeading>
            <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {tool.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 rounded-xl border border-border bg-surface p-3 text-sm text-foreground/80 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHeading icon={DollarSign}>Pricing</SectionHeading>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="h-1 bg-accent" />
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">Free plan</p>
                  <p className="mt-1.5 text-lg font-semibold text-foreground">
                    {tool.freePlan ? "Available" : "Not available"}
                  </p>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="h-1 bg-accent" />
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">Paid plan</p>
                  <p className="mt-1.5 text-lg font-semibold text-foreground">
                    {tool.pricing.paidPlan ?? tool.pricing.model}
                  </p>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="h-1 bg-accent-warm" />
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">Starting price</p>
                  <PriceTag
                    vendorPriceString={tool.pricing.startingPrice}
                    vendorCurrency={tool.pricing.baseCurrency}
                    countryPrices={tool.pricing.countryPrices}
                    fallback="See website"
                    primaryClassName="mt-1.5 text-lg font-semibold text-foreground"
                  />
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">{PRICING_DISCLAIMER}</p>
          </section>

          <section>
            <SectionHeading icon={Flame} iconClassName="bg-accent-warm-soft text-accent-warm">
              Current Offers
            </SectionHeading>
            <div className="mt-3 max-w-sm">
              <OfferCard tool={tool} deal={getBestDealForTool(tool.id)} placement="tool_detail" />
            </div>
            <AffiliateDisclosure className="mt-3" />
          </section>

          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-success-soft/40 p-5">
              <SectionHeading icon={ThumbsUp} iconClassName="bg-success-soft text-success">
                Pros
              </SectionHeading>
              <ul className="mt-3 space-y-2">
                {tool.pros.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check size={16} className="mt-0.5 shrink-0 text-success" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-stone-50/60 p-5">
              <SectionHeading icon={ThumbsDown} iconClassName="bg-stone-200 text-stone-600">
                Cons
              </SectionHeading>
              <ul className="mt-3 space-y-2">
                {tool.cons.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-foreground/80">
                    <X size={16} className="mt-0.5 shrink-0 text-muted" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {alternatives.length > 0 && (
            <section>
              <SectionHeading icon={Layers}>Best alternatives</SectionHeading>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {alternatives.map((alt) => {
                  const altAccent = CATEGORY_ACCENT[alt.category];
                  return (
                    <Link
                      key={alt.slug}
                      href={`/tools/${alt.slug}`}
                      style={{ ["--hover-shadow" as string]: altAccent.shadow }}
                      className={cn(
                        "focus-ring flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-all hover:-translate-y-0.5 hover:shadow-[var(--hover-shadow)]",
                        altAccent.border
                      )}
                    >
                      <ToolLogo name={alt.name} category={alt.category} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{alt.name}</p>
                        <p className="truncate text-xs text-muted">{alt.tagline}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {compareTargets.length > 0 && (
            <section>
              <SectionHeading icon={Scale}>Compare {tool.name}</SectionHeading>
              <p className="mt-1 text-sm text-muted">
                See {tool.name} side by side with a close alternative on pricing, features and offers.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {compareTargets.map((alt) => (
                  <Link
                    key={alt.slug}
                    href={`/compare?tools=${tool.slug},${alt.slug}`}
                    className="focus-ring rounded-full border border-border bg-surface px-3.5 py-2 text-sm text-foreground/80 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent hover:shadow-sm"
                  >
                    vs {alt.name}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div
            className="overflow-hidden rounded-2xl border border-border bg-surface"
            style={{ boxShadow: categoryAccent.shadow }}
          >
            <div className="h-1.5" style={{ background: "var(--gradient-brand)" }} />
            <div className="p-5">
              <h3 className="text-sm font-semibold text-foreground">Quick facts</h3>
              <dl className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted">Type</dt>
                <dd className="font-medium text-foreground">{tool.type}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Category</dt>
                <dd className="font-medium text-foreground">{category?.name}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Subcategory</dt>
                <dd className="font-medium text-foreground">{tool.subcategory}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Experience level</dt>
                <dd className="text-right font-medium text-foreground">
                  {tool.experienceLevel.join(", ")}
                </dd>
              </div>
              </dl>
            </div>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-semibold text-foreground">Similar tools</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => (
              <ToolCard key={s.slug} tool={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
