export const helpTopics = [
  { slug: "shipping", title: "SHIPPING", blurb: "Free over ₹1,999. 2–7 working days." },
  { slug: "returns", title: "RETURNS & EXCHANGES", blurb: "Exchanges in 14 days, returns in 7." },
  { slug: "size-guide", title: "SIZE GUIDE", blurb: "Every measurement, in cm and inches." },
  { slug: "track-order", title: "TRACK ORDER", blurb: "Order ID and phone number. That's it." },
  { slug: "faq", title: "FAQ", blurb: "Drops, restocks, COD, care." },
  { slug: "contact", title: "CONTACT", blurb: "WhatsApp, email, Instagram. Real people." },
] as const;
export type HelpSlug = (typeof helpTopics)[number]["slug"];
