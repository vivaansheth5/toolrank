import type { ComparisonFaq } from "@/lib/comparisonContent";

/**
 * Static <details>/<summary> accordion — no client JS needed. Also emits
 * FAQPage JSON-LD so the questions/answers are eligible for rich results.
 */
export default function ComparisonFAQ({ faqs }: { faqs: ComparisonFaq[] }) {
  if (faqs.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="mt-10">
      <h3 className="text-lg font-semibold text-foreground">Frequently asked questions</h3>
      <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
        {faqs.map((faq) => (
          <details key={faq.question} className="group p-4 open:pb-4">
            <summary className="focus-ring cursor-pointer list-none text-sm font-medium text-foreground marker:content-none">
              <span className="flex items-center justify-between gap-3">
                {faq.question}
                <span className="shrink-0 text-muted transition-transform group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">{faq.answer}</p>
          </details>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
