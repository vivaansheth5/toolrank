import Image from "next/image";
import { renderTime } from "@/lib/time";
import { categories, categoryLabel, getAllProductsSync } from "@/lib/commerce";
import { TLink } from "@/components/ui/TLink";

/** Four tall tiles. Hover: image to 1.06 over 900ms, label slides up, a cable underline draws in. */
export function Categories() {
  const all = getAllProductsSync();
  const now = renderTime();
  return (
    <section className="cats wrap" aria-labelledby="cats-title">
      <div className="sec-head">
        <h2 id="cats-title" className="t-h2">
          SHOP BY CATEGORY
        </h2>
        <TLink href="/shop" className="t-meta link-u">
          SEE EVERYTHING →
        </TLink>
      </div>
      <ul className="cats-grid">
        {categories.map((c, i) => {
          const count = all.filter((p) => p.wrng.category === c && !(p.wrng.releaseAt && Date.parse(p.wrng.releaseAt) > now)).length;
          return (
            <li key={c} data-reveal="fade" style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
              <TLink href={`/shop/${c}`} className="cat-tile">
                <span className="cat-img">
                  <Image src={`/campaign/cat-${c}.svg`} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" loading="lazy" />
                </span>
                <span className="cat-label">
                  <span className="t-h3">{categoryLabel(c)}</span>
                  <span className="t-meta tabular">({String(count).padStart(2, "0")})</span>
                </span>
                <svg className="cat-cable" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 2 Q100 9 200 2" pathLength={1} />
                </svg>
              </TLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
