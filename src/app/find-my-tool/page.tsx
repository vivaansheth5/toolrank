import type { Metadata } from "next";
import FindMyToolClient from "./FindMyToolClient";

export const metadata: Metadata = {
  title: "Find My Tool",
  description:
    "Answer a few quick questions and get a ranked, personalized shortlist of AI tools and software that fit your needs.",
};

export default function FindMyToolPage() {
  return <FindMyToolClient />;
}
