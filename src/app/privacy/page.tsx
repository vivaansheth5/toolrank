import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ToolDhundho handles information in this product preview.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted">Last updated: sample product preview — for demonstration only.</p>

      <div className="mt-8 space-y-8 text-foreground/80">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Overview</h2>
          <p className="mt-2 leading-relaxed">
            ToolDhundho is currently an MVP product preview. This build does not require an account, collect
            payment information, or store personal data on a server — the Find My Tool questionnaire and
            comparison selections run entirely in your browser and are not transmitted anywhere.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">External links</h2>
          <p className="mt-2 leading-relaxed">
            &ldquo;Visit Website&rdquo; links take you to third-party tool providers. ToolDhundho is not
            responsible for the privacy practices of those external sites.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Future changes</h2>
          <p className="mt-2 leading-relaxed">
            As ToolDhundho adds accounts, saved lists, or affiliate tracking in future versions, this policy
            will be updated to reflect exactly what data is collected and why.
          </p>
        </section>
      </div>
    </div>
  );
}
