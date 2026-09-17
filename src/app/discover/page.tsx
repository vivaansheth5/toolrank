import type { Metadata } from "next";
import DiscoverClient from "./DiscoverClient";

export const metadata: Metadata = {
  title: "Find Your Tools",
  description:
    "Tell ToolDhundho.com what you're trying to accomplish and get a personalized shortlist of AI tools and software, with a transparent explanation of why each one fits.",
  // Need-driven results are generated from free-text input and are not
  // curated content — keep this out of the sitemap/index like every other
  // user-generated view (spec section 19).
  robots: { index: false, follow: true },
};

export default async function DiscoverPage(props: PageProps<"/discover">) {
  const { need } = await props.searchParams;
  const initialNeed = typeof need === "string" ? need : "";

  return <DiscoverClient initialNeed={initialNeed} />;
}
