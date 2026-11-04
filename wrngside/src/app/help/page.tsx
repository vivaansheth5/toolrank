import type { Metadata, Viewport } from "next";
import { site, contact } from "@/lib/site-config";
import { pageMeta } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { TLink } from "@/components/ui/TLink";
import { FaqSearch } from "@/components/help/FaqSearch";
import { helpTopics } from "@/components/help/help-topics";
import "@/components/help/pages.css";
import { Lines } from "@/components/ui/Lines";

export const metadata: Metadata = pageMeta({
  title: "Help",
  description: "Shipping, returns and exchanges, size guide, order tracking, FAQ and contact for WRNGSIDE.",
  path: "/help",
});
export const viewport: Viewport = { themeColor: site.themeColor.day };

export default function HelpPage() {
  return (
    <main id="main" data-theme="day" className="theme-day help-page">
      <PageHeader kicker={`WE ANSWER ${contact.supportHours.toUpperCase()}`} title={["HELP."]} intro="Most answers are below. If yours isn't, message us. A human replies." />
      <div className="wrap help-body">
        <ul className="help-grid">
          {helpTopics.map((t) => (
            <li key={t.slug}>
              <TLink href={`/help/${t.slug}`} className="help-card">
                <span className="t-h3">{t.title}</span>
                <span className="text-muted">{t.blurb}</span>
                <span className="t-meta">OPEN →</span>
              </TLink>
            </li>
          ))}
        </ul>
        <section aria-labelledby="faq-title" className="help-faq">
          <h2 id="faq-title" className="t-h2">
            <Lines lines={["FAQ"]} />
          </h2>
          <FaqSearch />
        </section>
      </div>
    </main>
  );
}
