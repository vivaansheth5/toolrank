import Image from "next/image";
import { community, contact, ui } from "@/lib/site-config";
import { Lines } from "@/components/ui/Lines";
import { fill } from "@/lib/format";

/** #WRNGSIDE photos as taped polaroids at ±3° tilts. Hover straightens, lifts and shows the @handle. */
export function Community() {
  const tilts = [-2.6, 1.8, -1.2, 2.9, -2.1, 1.1];
  return (
    <section className="community wrap cv-auto" aria-labelledby="comm-title">
      <div className="sec-head">
        <h2 id="comm-title" className="t-h2">
          <Lines lines={[community.hashtag]} />
        </h2>
        <a href={contact.instagram} target="_blank" rel="noreferrer" className="t-meta link-u">
          {ui.home.tagUs}
        </a>
      </div>
      <ul className="polaroids">
        {community.posts.map((p, i) => (
          <li key={p.handle} className="polaroid" style={{ "--r": `${tilts[i % tilts.length]}deg` } as React.CSSProperties} data-reveal="fade">
            <a href={contact.instagram} target="_blank" rel="noreferrer" aria-label={fill(ui.home.communityLabel, { handle: p.handle, city: p.city })}>
              <span className="tape tape-top" aria-hidden="true" />
              <span className="polaroid-img">
                <Image src={p.image} alt={fill(ui.home.communityAlt, { handle: p.handle, city: p.city })} fill sizes="(min-width: 1024px) 20vw, 45vw" loading="lazy" />
              </span>
              <span className="polaroid-cap">
                <span className="polaroid-handle">{p.handle}</span>
                <span className="t-meta">{p.city}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
