import Image from "next/image";
import type { Review } from "@/lib/commerce/types";
import { formatLongDate, fill } from "@/lib/format";
import { Lines } from "@/components/ui/Lines";
import { ui } from "@/lib/site-config";

function Stars({ n }: { n: number }) {
  return (
    <span className="stars" role="img" aria-label={`${n} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden="true" className={i < n ? "on" : ""}>
          ■
        </span>
      ))}
    </span>
  );
}

export function Reviews({ reviews }: { reviews: Review[] }) {
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  return (
    <section className="wrap reviews" aria-labelledby="reviews-title">
      <div className="reviews-head">
        <h2 id="reviews-title" className="t-h2">
          <Lines lines={[ui.product.reviews.title]} />
        </h2>
        {reviews.length > 0 ? (
          <p className="t-meta">
            <Stars n={Math.round(avg)} /> {avg.toFixed(1)} / 5 · {reviews.length} {reviews.length === 1 ? ui.product.reviews.review : ui.product.reviews.reviews}
          </p>
        ) : (
          <p className="text-muted">{ui.product.reviews.none}</p>
        )}
      </div>
      {reviews.length > 0 && (
        <ul className="reviews-list">
          {reviews.map((r) => (
            <li key={r.id} className="review">
              <div className="review-top">
                <Stars n={r.rating} />
                <span className="t-meta text-muted">{formatLongDate(r.date)}</span>
              </div>
              <h3 className="t-h3">{r.title}</h3>
              <p>{r.body}</p>
              <p className="t-meta text-muted">
                {r.name} · {r.city} · {ui.product.reviews.bought} {r.size} · {r.fit.toUpperCase()}
              </p>
              {r.photo && (
                <div className="review-photo">
                  <Image src={r.photo} alt={fill(ui.product.reviews.photoFrom, { name: r.name })} fill sizes="160px" loading="lazy" />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
