import type { Metadata } from "next";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import ToolCard from "@/components/ToolCard";
import EmptyState from "@/components/EmptyState";
import { searchTools, searchSuggestions } from "@/lib/search";

export async function generateMetadata(props: PageProps<"/search">): Promise<Metadata> {
  const { q } = await props.searchParams;
  const query = typeof q === "string" ? q : "";
  return {
    title: query ? `Results for "${query}"` : "Search",
    description: "Search 40+ AI tools and software by what you're trying to accomplish.",
  };
}

export default async function SearchPage(props: PageProps<"/search">) {
  const { q } = await props.searchParams;
  const query = typeof q === "string" ? q : "";
  const results = query ? searchTools(query) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {query ? (
          <>
            Results for <span className="text-accent">&ldquo;{query}&rdquo;</span>
          </>
        ) : (
          "Search ToolDhundho"
        )}
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Describe what you&apos;re trying to accomplish, or search a tool name, category or tag.
      </p>

      <div className="mt-6 max-w-2xl">
        <SearchBar variant="hero" initialValue={query} />
      </div>

      {!query && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchSuggestions.map((example) => (
            <Link
              key={example}
              href={`/search?q=${encodeURIComponent(example)}`}
              className="focus-ring rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:border-border-strong hover:text-foreground"
            >
              {example}
            </Link>
          ))}
        </div>
      )}

      {query && (
        <p className="mt-6 text-sm text-muted">
          {results.length} {results.length === 1 ? "result" : "results"}
        </p>
      )}

      {query && results.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title={`No tools found for "${query}"`}
            description="Try a broader keyword, or browse categories to discover something new."
            action={
              <Link
                href="/explore"
                className="focus-ring rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Explore all tools
              </Link>
            }
          />
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {results.map(({ tool }) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
