import type { Metadata, Viewport } from "next";
import { site, contact, ui, pageSeo } from "@/lib/site-config";
import { pageMeta } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { TLink } from "@/components/ui/TLink";
import { FaqSearch } from "@/components/help/FaqSearch";
import { helpTopics } from "@/components/help/help-topics";
import "@/components/help/pages.css";
import { Lines } from "@/components/ui/Lines";
import { fill } from "@/lib/format";

export const metadata: Metadata = pageMeta({
  title: pageSeo.help.title,
  description: pageSeo.help.description,
  path: "/help",
});
export const viewport: Viewport = { themeColor: site.themeColor.day };

export default function HelpPage() {
  return (
    <main id="main" data-theme="day" className="theme-day help-page">
      <PageHeader kicker={fill(ui.pages.help.kicker, { hours: contact.supportHours.toUpperCase() })} title={[...ui.pages.help.title]} intro={ui.pages.help.intro} />
      <div className="wrap help-body">
        <ul className="help-grid">
          {helpTopics.map((t) => (
            <li key={t.slug}>
              <TLink href={`/help/${t.slug}`} className="help-card">
                <span className="t-h3">{t.title}</span>
                <span className="text-muted">{t.blurb}</span>
                <span className="t-meta">{ui.pages.help.open}</span>
              </TLink>
            </li>
          ))}
        </ul>
        <section aria-labelledby="faq-title" className="help-faq">
          <h2 id="faq-title" className="t-h2">
            <Lines lines={[ui.pages.help.faq]} />
          </h2>
          <FaqSearch />
        </section>
      </div>
    </main>
  );
}
