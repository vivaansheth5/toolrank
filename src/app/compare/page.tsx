import type { Metadata } from "next";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
  title: "Compare Tools",
  description: "Compare up to 3 AI tools or software side by side on pricing, ratings, features and more.",
};

export default async function ComparePage(props: PageProps<"/compare">) {
  const { tools: toolsParam } = await props.searchParams;
  const initialSlugs =
    typeof toolsParam === "string"
      ? toolsParam.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  return <CompareClient initialSlugs={initialSlugs} />;
}
