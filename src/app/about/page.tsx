import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Toolora helps people discover the right AI tools and software for what they're trying to accomplish.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">About Toolora</h1>
      <div className="prose-p:leading-relaxed mt-6 space-y-5 text-foreground/80">
        <p>
          There are thousands of AI tools and software products launching every month, and no good way
          to figure out which one actually fits what you&apos;re trying to do. Toolora exists to fix that:
          instead of another endless directory, we organize tools around outcomes — what you&apos;re trying
          to accomplish — and help you compare, shortlist and decide in minutes, not hours.
        </p>
        <p>
          Toolora is currently an early product preview. The catalog, recommendation logic and deals shown
          here are built to demonstrate the experience end-to-end using realistic sample data. Pricing,
          ratings and offers will be replaced with verified, continuously updated information as the
          product matures.
        </p>
        <p>
          &ldquo;Toolora&rdquo; is a working name for this build and may change before a public launch.
        </p>
      </div>
    </div>
  );
}
