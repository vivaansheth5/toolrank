import { TLink } from "./TLink";
import { JsonLd } from "./JsonLd";
import { site } from "@/lib/site-config";

export function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, item: `${site.url}${it.href}` })),
  };
  return (
    <nav aria-label="Breadcrumb" className="crumbs t-meta">
      <ol>
        {items.map((it, i) => (
          <li key={it.href}>
            {i < items.length - 1 ? (
              <>
                <TLink href={it.href}>{it.label}</TLink>
                <span aria-hidden="true">/</span>
              </>
            ) : (
              <span aria-current="page">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
      <JsonLd data={data} />
    </nav>
  );
}
