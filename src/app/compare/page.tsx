import type { Metadata } from "next";
import CompareClient from "./CompareClient";
import { getToolBySlug } from "@/data/tools";
import { joinNames } from "@/lib/comparisonContent";

function parseSlugs(toolsParam: string | string[] | undefined): string[] {
  return typeof toolsParam === "string"
    ? toolsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
}

export async function generateMetadata(props: PageProps<"/compare">): Promise<Metadata> {
  const { tools: toolsParam } = await props.searchParams;
  const slugs = parseSlugs(toolsParam);
  const selected = slugs.map((s) => getToolBySlug(s)).filter((t): t is NonNullable<typeof t> => Boolean(t));

  if (selected.length < 2) {
    return {
      title: "Compare Tools",
      description: "Compare up to 3 AI tools or software side by side on pricing, ratings, features and more.",
    };
  }

  const names = selected.map((t) => t.name);
  const title =
    names.length === 2
      ? `${names[0]} vs ${names[1]}: Which AI Tool Is Better?`
      : `${names.join(" vs ")}: Which AI Tool Is Best?`;
  const description = `Compare ${joinNames(names)} on features, pricing, ease of use, best use cases and current offers.`;

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

function firstString(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function ComparePage(props: PageProps<"/compare">) {
  const { tools: toolsParam, need, experience, budget, priority } = await props.searchParams;
  const initialSlugs = parseSlugs(toolsParam);

  return (
    <CompareClient
      initialSlugs={initialSlugs}
      initialNeed={firstString(need)}
      initialExperience={firstString(experience)}
      initialBudget={firstString(budget)}
      initialPriority={firstString(priority)}
    />
  );
}
