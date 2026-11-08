import type { ReactNode } from "react";
import { Lines } from "./Lines";
import { Breadcrumbs } from "./Breadcrumbs";
import { CableDivider } from "./CableDivider";

export function PageHeader({ kicker, title, intro, crumbs, children }: { kicker?: string; title: string[]; intro?: ReactNode; crumbs?: { label: string; href: string }[]; children?: ReactNode }) {
  return (
    <header className="page-head">
      <div className="wrap pt-header page-head-inner">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {kicker && <p className="t-meta text-muted">{kicker}</p>}
        <h1 className="t-h1 axis-hover">
          <Lines lines={title} mode="mount" />
        </h1>
        {intro && <div className="t-lead page-intro">{intro}</div>}
        {children}
      </div>
      <CableDivider />
    </header>
  );
}
