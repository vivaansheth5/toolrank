import type { Metadata, Viewport } from "next";
import { TLink } from "@/components/ui/TLink";
import { notFound } from "next/navigation";
import { site, policies, commerce, contact, sizeCharts, type SizeChartKey, ui } from "@/lib/site-config";
import { pageMeta } from "@/lib/seo";
import { fill, formatPrice } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { FaqSearch } from "@/components/help/FaqSearch";
import { TrackOrder } from "@/components/help/TrackOrder";
import { ContactForm } from "@/components/help/ContactForm";
import { SizeGuideTable } from "@/components/product/SizeGuide";
import { helpTopics, type HelpSlug } from "@/components/help/help-topics";
import { InstagramIcon, MailIcon, WhatsAppIcon } from "@/components/ui/Icons";
import "@/components/help/pages.css";
import "@/components/product/product.css";

export function generateStaticParams() {
  return helpTopics.map((t) => ({ topic: t.slug }));
}
export const dynamicParams = false;
export const viewport: Viewport = { themeColor: site.themeColor.day };

export async function generateMetadata({ params }: PageProps<"/help/[topic]">): Promise<Metadata> {
  const { topic } = await params;
  const t = helpTopics.find((x) => x.slug === topic);
  if (!t) return {};
  return pageMeta({ title: t.title.charAt(0) + t.title.slice(1).toLowerCase(), description: t.blurb, path: `/help/${t.slug}` });
}

const vars = {
  threshold: commerce.freeShippingThreshold.toLocaleString("en-IN"),
  fee: commerce.standardShipping,
  codMax: commerce.codMaxOrderValue.toLocaleString("en-IN"),
  exchange: commerce.exchangeWindowDays,
  returns: commerce.returnWindowDays,
};

function Body({ slug }: { slug: HelpSlug }) {
  switch (slug) {
    case "shipping":
      return (
        <div className="prose">
          <p className="t-lead">{fill(policies.shipping.intro, vars)}</p>
          <ul className="dash-list">
            {policies.shipping.points.map((p) => (
              <li key={p}>{fill(p, vars)}</li>
            ))}
          </ul>
          <p className="text-muted">{fill(ui.help.standardShipping, { price: formatPrice(commerce.standardShipping) })}</p>
        </div>
      );
    case "returns":
      return (
        <div className="prose">
          <p className="t-lead">{policies.returns.intro}</p>
          <ul className="dash-list">
            {policies.returns.points.map((p) => (
              <li key={p}>{fill(p, vars)}</li>
            ))}
          </ul>
          <p>
            {ui.help.returnsStart[0]}
            <TLink className="link-u" href="/help/track-order">
              {ui.help.trackOrderLink}
            </TLink>
            {ui.help.returnsStart[1]}
          </p>
        </div>
      );
    case "size-guide":
      return (
        <div className="sg-all">
          {(Object.keys(sizeCharts) as SizeChartKey[])
            .filter((k) => k !== "onesize")
            .map((k) => (
              <section key={k} className="sg-block" aria-labelledby={`sg-${k}`}>
                <h2 id={`sg-${k}`} className="t-h3">
                  {ui.help.sizeChartTitles[k]}
                </h2>
                <SizeGuideTable chart={k} />
              </section>
            ))}
        </div>
      );
    case "track-order":
      return <TrackOrder />;
    case "faq":
      return <FaqSearch />;
    case "contact":
      return (
        <div className="contact-grid">
          <ul className="contact-list">
            <li>
              <a href={`https://wa.me/${contact.whatsappNumber}`} target="_blank" rel="noreferrer" className="help-card">
                <WhatsAppIcon />
                <span className="t-h3">{ui.common.channels.whatsapp}</span>
                <span className="text-muted">{fill(ui.help.whatsappNote, { hours: contact.supportHours })}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.supportEmail}`} className="help-card">
                <MailIcon />
                <span className="t-h3">{ui.common.channels.email}</span>
                <span className="text-muted">{contact.supportEmail}</span>
              </a>
            </li>
            <li>
              <a href={contact.instagram} target="_blank" rel="noreferrer" className="help-card">
                <InstagramIcon />
                <span className="t-h3">{ui.common.channels.instagram}</span>
                <span className="text-muted">{contact.instagramHandle}</span>
              </a>
            </li>
          </ul>
          <ContactForm />
        </div>
      );
  }
}

export default async function HelpTopicPage({ params }: PageProps<"/help/[topic]">) {
  const { topic } = await params;
  const t = helpTopics.find((x) => x.slug === topic);
  if (!t) notFound();
  return (
    <main id="main" data-theme="day" className="theme-day help-page">
      <PageHeader
        crumbs={[
          { label: ui.common.home, href: "/" },
          { label: ui.common.help, href: "/help" },
          { label: t.title, href: `/help/${t.slug}` },
        ]}
        title={[t.title]}
        intro={t.blurb}
      />
      <div className="wrap help-body">
        <Body slug={t.slug} />
      </div>
    </main>
  );
}
