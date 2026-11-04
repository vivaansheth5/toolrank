import type { Metadata, Viewport } from "next";
import { TLink } from "@/components/ui/TLink";
import { notFound } from "next/navigation";
import { site, legal, legalDocs, policies, commerce, seo } from "@/lib/site-config";
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
      <PageHeader kicker={`LAST UPDATED ${formatLongDate(legal.lastUpdated).toUpperCase()}`} title={[TITLES[d]]} />
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
                Returns are accepted within {commerce.returnWindowDays} days of delivery; exchanges within {commerce.exchangeWindowDays}. See <TLink className="link-u" href="/help/returns">Returns & Exchanges</TLink>.
              </p>
            </>
          )}
          {d === "grievance" && (
            <>
              <p className="t-lead">Under the Consumer Protection (E-Commerce) Rules, 2020 and the IT Rules, 2021, you can raise any complaint with our Grievance Officer.</p>
              <dl className="kv">
                <dt>Role</dt>
                <dd>{legal.grievanceOfficer.title}</dd>
                <dt>Email</dt>
                <dd>
                  <a className="link-u" href={`mailto:${legal.grievanceOfficer.email}`}>
                    {legal.grievanceOfficer.email}
                  </a>
                </dd>
                <dt>Hours</dt>
                <dd>{legal.grievanceOfficer.hours}</dd>
                <dt>Company</dt>
                <dd>{legal.entityName}</dd>
                <dt>Address</dt>
                <dd>{legal.address}</dd>
              </dl>
              <p>
                We acknowledge every complaint within {legal.grievanceOfficer.acknowledgeWithinHours} hours and resolve it within {legal.grievanceOfficer.resolveWithinDays} days of receiving it.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
