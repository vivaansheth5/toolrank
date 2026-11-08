import type { Metadata, Viewport } from "next";
import { TLink } from "@/components/ui/TLink";
import { notFound } from "next/navigation";
import { site, legal, legalDocs, policies, commerce, seo, ui } from "@/lib/site-config";
import { pageMeta } from "@/lib/seo";
import { fill, formatLongDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import "@/components/help/pages.css";
import "@/components/product/product.css";

const DOCS = ["terms", "privacy", "refunds", "grievance"] as const;
type Doc = (typeof DOCS)[number];
const TITLES: Record<Doc, string> = { terms: "TERMS", privacy: "PRIVACY", refunds: "REFUNDS", grievance: "GRIEVANCE OFFICER" };

export function generateStaticParams() {
  return DOCS.map((doc) => ({ doc }));
}
export const dynamicParams = false;
export const viewport: Viewport = { themeColor: site.themeColor.day };

export async function generateMetadata({ params }: PageProps<"/legal/[doc]">): Promise<Metadata> {
  const { doc } = await params;
  if (!DOCS.includes(doc as Doc)) return {};
  const d = doc as Doc;
  const description = fill(seo.legalDescriptions[d], {
    returnDays: commerce.returnWindowDays,
    exchangeDays: commerce.exchangeWindowDays,
    ackHours: legal.grievanceOfficer.acknowledgeWithinHours,
    resolveDays: legal.grievanceOfficer.resolveWithinDays,
  });
  return pageMeta({ title: TITLES[d].charAt(0) + TITLES[d].slice(1).toLowerCase(), description, path: `/legal/${d}` });
}

const vars = { entity: legal.entityName, grievanceEmail: legal.grievanceOfficer.email };

export default async function LegalPage({ params }: PageProps<"/legal/[doc]">) {
  const { doc } = await params;
  if (!DOCS.includes(doc as Doc)) notFound();
  const d = doc as Doc;
  return (
    <main id="main" data-theme="day" className="theme-day legal-page">
      <PageHeader kicker={fill(ui.pages.legal.lastUpdated, { date: formatLongDate(legal.lastUpdated).toUpperCase() })} title={[TITLES[d]]} />
      <div className="wrap help-body">
        <div className="prose">
          {(d === "terms" || d === "privacy") &&
            legalDocs[d].sections.map((s) => (
              <section key={s.heading}>
                <h2 className="t-h3">{s.heading}</h2>
                <p>{fill(s.body, vars)}</p>
              </section>
            ))}
          {d === "refunds" && (
            <>
              <ul className="dash-list">
                {policies.refunds.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p>
                {fill(ui.help.refundsLine[0], { returns: commerce.returnWindowDays, exchange: commerce.exchangeWindowDays })}
                <TLink className="link-u" href="/help/returns">
                  {ui.help.returnsLink}
                </TLink>
                {ui.help.refundsLine[1]}
              </p>
            </>
          )}
          {d === "grievance" && (
            <>
              <p className="t-lead">{ui.help.grievanceIntro}</p>
              <dl className="kv">
                <dt>{ui.help.grievanceKeys.role}</dt>
                <dd>{legal.grievanceOfficer.title}</dd>
                <dt>{ui.help.grievanceKeys.email}</dt>
                <dd>
                  <a className="link-u" href={`mailto:${legal.grievanceOfficer.email}`}>
                    {legal.grievanceOfficer.email}
                  </a>
                </dd>
                <dt>{ui.help.grievanceKeys.hours}</dt>
                <dd>{legal.grievanceOfficer.hours}</dd>
                <dt>{ui.help.grievanceKeys.company}</dt>
                <dd>{legal.entityName}</dd>
                <dt>{ui.help.grievanceKeys.address}</dt>
                <dd>{legal.address}</dd>
              </dl>
              <p>
                {fill(ui.help.grievanceSla, { hours: legal.grievanceOfficer.acknowledgeWithinHours, days: legal.grievanceOfficer.resolveWithinDays })}
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
