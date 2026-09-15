import type { Metadata } from "next";
import ExploreClient from "./ExploreClient";

export const metadata: Metadata = {
  title: "Explore AI & Software Tools",
  description:
    "Browse and filter 40+ AI tools and software by category, pricing, and audience to find exactly what fits your workflow.",
};

export default function ExplorePage() {
  return <ExploreClient />;
}
