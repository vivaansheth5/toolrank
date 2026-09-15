import { ShieldCheck, Tag } from "lucide-react";

/**
 * The Verified/Demo badge cluster shared by every offer surface. verified
 * and demo are never both true for a real record, but verified always wins
 * the display if data ever disagrees — a demo offer must never render a
 * "Verified" badge.
 */
export default function OfferStatus({
  verified,
  demo,
}: {
  verified: boolean;
  demo: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {verified ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-success">
          <ShieldCheck size={11} /> Verified
        </span>
      ) : demo ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-warning">
          <Tag size={11} /> Demo offer
        </span>
      ) : null}
    </div>
  );
}
