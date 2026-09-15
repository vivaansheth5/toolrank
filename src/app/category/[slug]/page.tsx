import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ToolCard from "@/components/ToolCard";
import EmptyState from "@/components/EmptyState";
import { CategoryIcon } from "@/components/icons";
import { categories, getCategory } from "@/data/categories";
import { getToolsByCategory } from "@/data/tools";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const category = getCategory(slug);
  if (!category) return {};
  return {
    title: `${category.name} Tools`,
    description: `Discover the best ${category.name.toLowerCase()} AI tools and software. ${category.description}`,
  };
}

export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const { slug } = await props.params;
  const category = getCategory(slug);
  if (!category) notFound();

  const categoryTools = getToolsByCategory(category.slug).sort(
    (a, b) => b.rating * b.popularity - a.rating * a.popularity
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Explore", href: "/explore" }, { label: category.name }]} />

      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <CategoryIcon name={category.icon} className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {category.name} tools
          </h1>
          <p className="mt-1 text-muted">{category.description}</p>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">
        {categoryTools.length} {categoryTools.length === 1 ? "tool" : "tools"} in this category
      </p>

      {categoryTools.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No tools yet in this category"
            description="Check back soon — we're actively adding to the Toolora catalog."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categoryTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
