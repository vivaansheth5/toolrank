/**
 * WRNGSIDE — single source of truth for every price rule, policy, threshold,
 * date and line of copy on the site. Numbers here are placeholders: change
 * them here and the whole site follows.
 *
 * Devanagari strings are marked `// HI:` — have a native speaker check every
 * one before launch.
 */

export const site = {
  name: "WRNGSIDE",
  pronounced: "wrong side",
  url: "https://wrngside.com",
  title: "WRNGSIDE — Raised on the wrong side of the wire",
  description:
    "Premium Indian streetwear. Heavyweight oversized tees, hoodies, jackets and cargos, released in limited drops. COD across India.",
  tagline: "Raised on the wrong side of the wire.",
  city: "NEW DELHI",
  cityShort: "DELHI",
  country: "INDIA",
  established: 2024,
  timeZone: "Asia/Kolkata",
  timeZoneLabel: "IST",
  locale: "en-IN",
  currency: "INR",
  tabAwayTitle: "COME BACK TO THE WRONG SIDE",
  themeColor: { night: "#0B0B0B", day: "#EEEAE3" },
} as const;

export const contact = {
  email: "hello@wrngside.com",
  supportEmail: "help@wrngside.com",
  // Replace before launch. "910000000000" is deliberately not a valid Indian mobile.
  whatsappNumber: "910000000000",
  whatsappLabel: "WHATSAPP",
  instagram: "https://instagram.com/wrngside",
  instagramHandle: "@wrngside",
  supportHours: "Mon–Sat, 11 AM – 7 PM IST",
} as const;

export const legal = {
  entityName: "WRNGSIDE Apparel Private Limited",
  address: "Registered office address to be published here, New Delhi, India",
  grievanceOfficer: {
    title: "Grievance Officer",
    email: "grievance@wrngside.com",
    hours: "Mon–Fri, 11 AM – 6 PM IST",
    acknowledgeWithinHours: 48,
    resolveWithinDays: 30,
  },
  countryOfOrigin: "India",
  manufacturer: "Made for WRNGSIDE Apparel Private Limited by our partner units in Tiruppur, Tamil Nadu",
  marketer: "WRNGSIDE Apparel Private Limited, New Delhi",
  lastUpdated: "2026-10-01",
} as const;

/** Commerce rules. Prices are in whole rupees. */
export const commerce = {
  currency: "INR" as const,
  freeShippingThreshold: 1999,
  standardShipping: 99,
  codAvailable: true,
  codFee: 0,
  codMaxOrderValue: 10000,
  returnWindowDays: 7,
  exchangeWindowDays: 14,
  lowStockThreshold: 3, // per size: "ONLY 2 LEFT"
  lowStockProductThreshold: 10, // whole product: LOW STOCK badge
  maxQtyPerLine: 5,
  shopPageSize: 12,
  upsellHandle: "spark-socks",
  dispatchCutoffHourIST: 14,
  deliveryDays: { metro: [2, 4] as [number, number], rest: [4, 7] as [number, number] },
  metroPincodePrefixes: ["110", "400", "560", "600", "700", "500", "411", "380", "122", "201"],
  nonServiceablePrefixes: ["744", "682559", "396210"],
  codBlockedPrefixes: ["194", "737", "795"],
  paymentMethods: ["UPI", "CARDS", "NET BANKING", "COD"] as const,
} as const;

/** Discount codes. Real validation belongs in Shopify; these power the mock. */
export const codes = {
  newsletter: { code: "WRONG10", percentOff: 10, label: "10% off your first order" },
  powerCut: { code: "LIGHTSOUT15", percentOff: 15, label: "15% off — you found it in the dark" },
  drop05Access: "CROSSOVER",
} as const;

export type DropStatus = "live" | "locked" | "archived";

export interface DropConfig {
  id: string;
  number: string;
  name: string;
  status: DropStatus;
  releasedAt?: string;
  releaseAt?: string;
  story: string;
  location: string;
}

export const drops: { live: string; next: string; list: DropConfig[] } = {
  live: "drop-04",
  next: "drop-05",
  list: [
    {
      id: "drop-05",
      number: "05",
      name: "WRONG WAY",
      status: "locked",
      // Countdown target. Everything (ticker, teaser, drops page) reads this.
      releaseAt: "2026-11-06T20:00:00+05:30",
      story:
        "Varsity wool, waxed cotton and one beanie for the cold that hits Delhi at 2 AM. Built for people who take the long way back.",
      location: "SHOT ON THE RING ROAD FLYOVER",
    },
    {
      id: "drop-04",
      number: "04",
      name: "LIVE WIRE",
      status: "live",
      releasedAt: "2026-10-16T20:00:00+05:30",
      story:
        "Twelve pieces hung on the wires above Chawri Bazar. Heavyweight cotton, puff prints and a hoodie you can wear inside out.",
      location: "CHAWRI BAZAR, DELHI",
    },
    {
      id: "drop-03",
      number: "03",
      name: "SURGE",
      status: "archived",
      releasedAt: "2026-05-22T20:00:00+05:30",
      story: "Summer shorts for 46°C afternoons. Gone in nine minutes. Coming back once.",
      location: "YAMUNA BANK, DELHI",
    },
    {
      id: "drop-02",
      number: "02",
      name: "ONE WAY",
      status: "archived",
      releasedAt: "2025-11-14T20:00:00+05:30",
      story: "One long sleeve. One direction. Printed down the arm so you read it walking away.",
      location: "PAHARGANJ, DELHI",
    },
    {
      id: "drop-01",
      number: "01",
      name: "GROUND ZERO",
      status: "archived",
      releasedAt: "2024-12-06T20:00:00+05:30",
      story: "Where it started. A blank tee, made properly, in three colours. Still here.",
      location: "SHAHPUR JAT, DELHI",
    },
  ],
};

export const nav = {
  left: [
    { label: "SHOP", href: "/shop" },
    { label: "DROPS", href: "/drops" },
    { label: "LOOKBOOK", href: "/lookbook" },
    { label: "ABOUT", href: "/about" },
  ],
  right: [
    { label: "SEARCH", action: "search" as const },
    { label: "ACCOUNT", href: "/account" },
  ],
  mobile: [
    { label: "SHOP", href: "/shop" },
    { label: "DROPS", href: "/drops" },
    { label: "LOOKBOOK", href: "/lookbook" },
    { label: "YOUR LINE", href: "/saved" },
    { label: "ABOUT", href: "/about" },
    { label: "HELP", href: "/help" },
    { label: "ACCOUNT", href: "/account" },
  ],
} as const;

export const footer = {
  columns: [
    {
      title: "SHOP",
      links: [
        { label: "Everything", href: "/shop" },
        { label: "Tees", href: "/shop/tees" },
        { label: "Outerwear", href: "/shop/outerwear" },
        { label: "Bottoms", href: "/shop/bottoms" },
        { label: "Extras", href: "/shop/extras" },
        { label: "Your Line", href: "/saved" },
      ],
    },
    {
      title: "HELP",
      links: [
        { label: "Shipping", href: "/help/shipping" },
        { label: "Returns & Exchanges", href: "/help/returns" },
        { label: "Size Guide", href: "/help/size-guide" },
        { label: "Track Order", href: "/help/track-order" },
        { label: "FAQ", href: "/help/faq" },
        { label: "Contact", href: "/help/contact" },
      ],
    },
    {
      title: "BRAND",
      links: [
        { label: "About", href: "/about" },
        { label: "Lookbook", href: "/lookbook" },
        { label: "Drop Archive", href: "/drops#archive" },
      ],
    },
    {
      title: "LEGAL",
      links: [
        { label: "Terms", href: "/legal/terms" },
        { label: "Privacy", href: "/legal/privacy" },
        { label: "Refunds", href: "/legal/refunds" },
        { label: "Grievance Officer", href: "/legal/grievance" },
      ],
    },
  ],
  copyright: "© {year} WRNGSIDE. ALL WRONGS RESERVED.",
} as const;

export const copy = {
  hero: {
    headline: ["FRESH", "OFF THE", "WIRE."],
    sub: "DROP {drop} — SCROLL THE LINE →",
    hintDesktop: "SCROLL OR DRAG",
    hintTouch: "SWIPE THE LINE",
    skip: "SKIP THE LINE",
    endBoard: "SEE EVERYTHING",
    hudStart: "DROP {drop}",
    hudEnd: "THAT'S THE LINE",
  },
  ctas: {
    shopTheLine: "SHOP THE LINE",
    addToBag: "ADD TO BAG",
    buyNow: "BUY NOW",
    notifyMe: "NOTIFY ME",
    seeWrongSide: "SEE THE WRONG SIDE",
    seeRightSide: "BACK TO THE RIGHT SIDE",
    skipTheLine: "SKIP THE LINE",
    shopTheDrop: "SHOP THE DROP",
    viewBag: "VIEW BAG",
    checkout: "CHECKOUT",
    loadMore: "LOAD MORE",
    backToTheLine: "BACK TO THE LINE",
  },
  soldOut: "GONE. NOTIFY ME FOR THE NEXT ONE.",
  loader: "CHARGING THE LINE",
  emptyBag: "NOTHING ON YOUR WIRE YET.",
  emptySaved: "YOUR LINE IS EMPTY. PEG SOMETHING.",
  emptyShop: "NOTHING HERE. WRONG TURN?",
  emptySearch: "NOTHING ON THE WIRE BY THAT NAME.",
  added: "ON YOUR WIRE",
  saved: "PEGGED TO YOUR LINE",
  unsaved: "UNPEGGED",
  removed: "TAKEN OFF THE WIRE",
  undo: "UNDO",
  newsletter: {
    title: "GET ON THE WRONG LIST.",
    body: "First dibs on drops. No spam, only voltage.",
    success: "YOU'RE ON THE LIST. STAY ON THE WRONG SIDE.",
    tearHint: "TEAR ONE OFF",
    copied: "COPIED. DON'T TELL ANYONE.",
    consent: "We'll message you about drops. Unsubscribe any time.",
  },
  errors: {
    pincode: "CAN'T FIND THAT PINCODE.",
    pincodeNoService: "WE DON'T REACH {pin} YET.",
    email: "THAT EMAIL LOOKS OFF.",
    phone: "THAT NUMBER LOOKS OFF.",
    required: "WE NEED THIS ONE.",
    size: "PICK A SIZE FIRST.",
    code: "THAT CODE DOESN'T OPEN ANYTHING.",
    otp: "THAT CODE DIDN'T MATCH.",
    generic: "SOMETHING TRIPPED. TRY AGAIN.",
    order: "NO ORDER BY THAT ID AND NUMBER.",
  },
  manifesto: "WE WERE TOLD TO STAY ON THE RIGHT SIDE. WE CROSSED OVER.",
  craft: {
    title: "THE WRONG SIDE",
    intro: "Turn it inside out. That's where we spend the money.",
    lines: [
      "240 GSM HEAVYWEIGHT COTTON",
      "PRE-SHRUNK",
      "BOXY OVERSIZED FIT",
      "PUFF + SCREEN PRINTS",
      "MADE IN INDIA",
    ],
  },
  notFound: {
    title: "WRONG SIDE. EVEN FOR US.",
    body: "This page fell off the wire. One sock stayed.",
  },
  powerCut: {
    restored: "POWER'S BACK.",
    found: "YOU FOUND IT. KEEP IT DARK.",
    hint: "CLICK THE TRANSFORMER. CAREFULLY.",
  },
  footerClock: "{city} {time} IST",
} as const;

/** Devanagari signage. HI: every string here needs a native speaker's check. */
export const hindi = {
  wrongSide: "रॉन्ग साइड", // HI: "wrong side" transliterated (stencil on the wall)
  danger: "खतरा", // HI: "danger" (pole plate)
  marg: {
    tees: "टीज़ मार्ग", // HI: "Tees Marg"
    outerwear: "आउटरवियर मार्ग", // HI: "Outerwear Marg"
    bottoms: "बॉटम्स मार्ग", // HI: "Bottoms Marg"
    extras: "एक्स्ट्राज़ मार्ग", // HI: "Extras Marg"
  },
  shopSigns: ["चाय", "जनरल स्टोर", "मोबाइल रिपेयर", "बिजली घर"], // HI: tea, general store, mobile repair, power house
  noEntry: "प्रवेश निषेध", // HI: "no entry"
} as const;

export const lineConfig = {
  /** Pitch between garments, as fractions of the viewport. */
  pitchDesktopVw: 38,
  pitchDesktopMaxVh: 64,
  pitchTouchVw: 72,
  /** Garments per span before an extra pole is needed. */
  maxPerSpan: 4,
  sceneTouchSvh: 78,
} as const;

export const lookbook = {
  title: "LOOKBOOK",
  season: "DROP 04 — LIVE WIRE",
  chapters: [
    {
      id: "01",
      title: "CURRENT",
      time: "02:14 AM",
      place: "CHAWRI BAZAR, DELHI",
      text: "The wires came first. Then the market. Then us.",
      image: "/campaign/lookbook-01.svg",
      products: ["live-wire-tee", "short-circuit-cargos"],
    },
    {
      id: "02",
      title: "DETOUR",
      time: "03:40 AM",
      place: "PAHARGANJ, DELHI",
      text: "Every shortcut here is somebody's long way home.",
      image: "/campaign/lookbook-02.svg",
      products: ["440v-hoodie", "grounded-sweatpants"],
    },
    {
      id: "03",
      title: "INSIDE OUT",
      time: "01:52 AM",
      place: "LAJPAT NAGAR, DELHI",
      text: "Both sides finished. Both sides right. Wear the one they told you not to.",
      image: "/campaign/lookbook-03.svg",
      products: ["u-turn-reversible-hoodie"],
    },
    {
      id: "04",
      title: "LINEMEN",
      time: "04:05 AM",
      place: "KAROL BAGH, DELHI",
      text: "Named after the people who climb the poles so the rest of the city can sleep.",
      image: "/campaign/lookbook-04.svg",
      products: ["lineman-work-jacket", "overhead-cap"],
    },
    {
      id: "05",
      title: "NO ENTRY",
      time: "12:48 AM",
      place: "HAUZ KHAS VILLAGE, DELHI",
      text: "The sign says no. The street says maybe.",
      image: "/campaign/lookbook-05.svg",
      products: ["no-entry-boxy-tee", "fuse-tote"],
    },
  ],
} as const;

export const community = {
  hashtag: "#WRNGSIDE",
  posts: [
    { handle: "@ayaan.after.dark", image: "/campaign/community-01.svg", city: "MUMBAI" },
    { handle: "@meher.on.mute", image: "/campaign/community-02.svg", city: "BENGALURU" },
    { handle: "@kabirwasnthere", image: "/campaign/community-03.svg", city: "DELHI" },
    { handle: "@tanvi.inverted", image: "/campaign/community-04.svg", city: "PUNE" },
    { handle: "@ronit.rides.late", image: "/campaign/community-05.svg", city: "KOLKATA" },
    { handle: "@zoya.wrongturn", image: "/campaign/community-06.svg", city: "HYDERABAD" },
  ],
} as const;

export const about = {
  title: "RAISED ON THE WRONG SIDE OF THE WIRE",
  sections: [
    {
      kicker: "01 — THE NAME",
      heading: "SAID WRONG SIDE. SPELT WRNGSIDE.",
      body: [
        "Wrong-side driving. The wrong side of town. A tee worn inside out because you got dressed in the dark. Every one of those is a choice somebody else would call a mistake.",
        "We dropped the O because nobody needed it. The N faces the other way because that's the side we grew up on.",
      ],
    },
    {
      kicker: "02 — THE CITY",
      heading: "DELHI, AFTER THE SHUTTERS COME DOWN.",
      body: [
        "Look up anywhere in the old city and the sky is a knot of copper. Power lines, phone lines, a cable somebody ran in 1998 and never took down. Washing hangs from all of it.",
        "That's the line. A power line, a washing line, a clothing line. We hang every drop on it before it reaches you.",
      ],
    },
    {
      kicker: "03 — THE PROCESS",
      heading: "HEAVY CLOTH. SLOW CUTS. SMALL RUNS.",
      body: [
        "Our tees start at 240 GSM combed cotton, knitted and pre-shrunk in Tiruppur. Hoodies are 400 GSM loopback fleece. Prints are pulled by hand in Delhi: puff, screen and the occasional discharge.",
        "We make a few hundred of each piece. When it's gone, it's gone. Some pieces come back. Most don't. We tell you which, and we never fake the numbers.",
      ],
    },
    {
      kicker: "04 — THE TEAM",
      heading: "SIX PEOPLE AND A PRINTING TABLE.",
      body: [
        "A designer who used to paint shop signs. A pattern-maker who learned on her mother's machine. Two people who answer every WhatsApp themselves. A photographer who only shoots after midnight. And one person who does the spreadsheets so the rest of us don't have to.",
      ],
    },
  ],
} as const;

export type FaqItem = { q: string; a: string; tags?: string[] };

export const faq: FaqItem[] = [
  {
    q: "When do drops go live?",
    a: "Fridays at 8 PM IST unless the ticker says otherwise. Get on the Wrong List and you hear about it 24 hours early.",
    tags: ["drops", "release", "time"],
  },
  {
    q: "Do you restock?",
    a: "Some pieces come back. Most don't. If your size is gone, hit NOTIFY ME on the product and you'll hear first if it returns.",
    tags: ["restock", "sold out", "notify"],
  },
  {
    q: "How do your sizes run?",
    a: "Oversized on purpose. Take your usual size for the fit we designed, or size down for something closer. Every product has a measurement chart in cm and inches.",
    tags: ["size", "fit"],
  },
  {
    q: "Is cash on delivery available?",
    a: "Yes, across most of India, on orders up to ₹10,000. No extra fee. Enter your pincode on any product to check.",
    tags: ["cod", "payment"],
  },
  {
    q: "How long does delivery take?",
    a: "Metro cities take 2–4 working days. Everywhere else takes 4–7. Orders placed before 2 PM IST leave the same day.",
    tags: ["shipping", "delivery"],
  },
  {
    q: "Can I return or exchange?",
    a: "Exchanges within 14 days and returns within 7, on unworn pieces with tags on. Socks are final sale. Start it from Track Order or message us on WhatsApp.",
    tags: ["returns", "exchange", "refund"],
  },
  {
    q: "How do I wash heavyweight cotton?",
    a: "Cold, inside out, gentle spin. Dry in the shade. Skip the tumble dryer. Iron inside out and never on the print.",
    tags: ["care", "wash"],
  },
  {
    q: "Where are your clothes made?",
    a: "In India. Knitted and sewn in Tiruppur, printed and finished in Delhi.",
    tags: ["made in india", "factory"],
  },
  {
    q: "Do you ship outside India?",
    a: "Not yet. India first.",
    tags: ["international", "shipping"],
  },
  {
    q: "What's the deal with the U-TURN hoodie?",
    a: "It's reversible. Both sides are finished, both sides are right. Made to be worn on the wrong side.",
    tags: ["u-turn", "reversible"],
  },
  {
    q: "What payment methods do you take?",
    a: "UPI, cards, net banking and cash on delivery. All prices include GST.",
    tags: ["payment", "upi", "gst"],
  },
];

export const policies = {
  shipping: {
    title: "SHIPPING",
    intro: "Free across India on orders over ₹{threshold}. Below that it's a flat ₹{fee}.",
    points: [
      "Orders placed before 2 PM IST leave our studio the same working day.",
      "Metro cities: 2–4 working days. Everywhere else: 4–7 working days.",
      "You'll get tracking on WhatsApp and email the moment it ships.",
      "Cash on delivery is available on orders up to ₹{codMax}, with no extra fee.",
      "We don't ship outside India yet.",
    ],
  },
  returns: {
    title: "RETURNS & EXCHANGES",
    intro: "Wrong size happens. We make it easy.",
    points: [
      "Exchanges within {exchange} days of delivery: size or colour, subject to stock.",
      "Returns within {returns} days of delivery, refunded to the original payment method. COD orders are refunded by UPI or bank transfer.",
      "Pieces must be unworn, unwashed, with tags attached.",
      "Socks are final sale.",
      "We arrange the pickup. If your pincode isn't covered for pickup, ship it back and we'll refund up to ₹100 of postage.",
    ],
  },
  refunds: {
    title: "REFUNDS",
    points: [
      "Refunds are issued within 5–7 working days of the return reaching us and passing a quick check.",
      "Prepaid orders are refunded to the original payment method.",
      "COD orders are refunded by UPI or bank transfer to the account you give us.",
      "Shipping fees are refunded only if we sent you the wrong item or a faulty one.",
    ],
  },
} as const;

export const legalDocs = {
  terms: {
    title: "TERMS",
    sections: [
      {
        heading: "WHO WE ARE",
        body: "This website is run by {entity}. By using it or placing an order you agree to these terms.",
      },
      {
        heading: "ORDERS AND PRICING",
        body: "All prices are in Indian rupees and include GST. An order is confirmed when we send a confirmation by email or WhatsApp. If a price is listed wrongly we'll tell you before shipping and you can cancel for a full refund.",
      },
      {
        heading: "DROPS AND STOCK",
        body: "Drops are limited. Stock numbers shown on the site are live counts from our inventory. Adding a piece to your bag doesn't reserve it; checking out does.",
      },
      {
        heading: "DELIVERY",
        body: "Delivery estimates are estimates. If something is delayed beyond the stated window, we'll tell you and you may cancel for a full refund.",
      },
      {
        heading: "INTELLECTUAL PROPERTY",
        body: "The WRNGSIDE name, the mirrored N, our graphics, photographs and text belong to us. Please don't reuse them without asking.",
      },
      {
        heading: "GOVERNING LAW",
        body: "These terms are governed by Indian law. Courts in New Delhi have jurisdiction.",
      },
    ],
  },
  privacy: {
    title: "PRIVACY",
    sections: [
      {
        heading: "WHAT WE COLLECT",
        body: "What you give us at checkout or sign-up: name, phone, email, address. What your browser tells us: device type and pages visited, through privacy-respecting analytics.",
      },
      {
        heading: "WHY",
        body: "To deliver your order, tell you about it, and, if you opted in, tell you about drops. We never sell your data.",
      },
      {
        heading: "STORED ON YOUR DEVICE",
        body: "Your bag, saved pieces and a few preferences (like whether you dismissed the ticker) are stored in your browser so they survive a refresh. Clear your site data to remove them.",
      },
      {
        heading: "YOUR RIGHTS",
        body: "Ask us for a copy of your data or to delete it at any time under the Digital Personal Data Protection Act, 2023. Write to {grievanceEmail}.",
      },
    ],
  },
} as const;

/** Size charts in centimetres. Garment measurements, laid flat where noted. */
export type SizeChartKey = "tee" | "longsleeve" | "hoodie" | "jacket" | "overshirt" | "cargos" | "sweatpants" | "shorts" | "onesize" | "socks";

export const sizeCharts: Record<
  SizeChartKey,
  { columns: string[]; rows: { size: string; values: number[] }[]; note: string }
> = {
  tee: {
    columns: ["CHEST", "LENGTH", "SHOULDER", "SLEEVE"],
    rows: [
      { size: "S", values: [112, 70, 56, 22] },
      { size: "M", values: [116, 72, 58, 23] },
      { size: "L", values: [120, 74, 60, 24] },
      { size: "XL", values: [124, 76, 62, 25] },
      { size: "XXL", values: [128, 78, 64, 26] },
    ],
    note: "Chest measured all the way round, 2.5 cm below the armhole.",
  },
  longsleeve: {
    columns: ["CHEST", "LENGTH", "SHOULDER", "SLEEVE"],
    rows: [
      { size: "S", values: [110, 70, 54, 60] },
      { size: "M", values: [114, 72, 56, 61] },
      { size: "L", values: [118, 74, 58, 62] },
      { size: "XL", values: [122, 76, 60, 63] },
      { size: "XXL", values: [126, 78, 62, 64] },
    ],
    note: "Sleeve measured from the shoulder seam to the cuff.",
  },
  hoodie: {
    columns: ["CHEST", "LENGTH", "SHOULDER", "SLEEVE"],
    rows: [
      { size: "S", values: [120, 68, 58, 58] },
      { size: "M", values: [124, 70, 60, 59] },
      { size: "L", values: [128, 72, 62, 60] },
      { size: "XL", values: [132, 74, 64, 61] },
      { size: "XXL", values: [136, 76, 66, 62] },
    ],
    note: "400 GSM fleece keeps its shape; expect no more than 2% shrinkage.",
  },
  jacket: {
    columns: ["CHEST", "LENGTH", "SHOULDER", "SLEEVE"],
    rows: [
      { size: "S", values: [122, 68, 54, 62] },
      { size: "M", values: [126, 70, 56, 63] },
      { size: "L", values: [130, 72, 58, 64] },
      { size: "XL", values: [134, 74, 60, 65] },
      { size: "XXL", values: [138, 76, 62, 66] },
    ],
    note: "Cut to wear over a hoodie.",
  },
  overshirt: {
    columns: ["CHEST", "LENGTH", "SHOULDER", "SLEEVE"],
    rows: [
      { size: "S", values: [118, 74, 54, 60] },
      { size: "M", values: [122, 76, 56, 61] },
      { size: "L", values: [126, 78, 58, 62] },
      { size: "XL", values: [130, 80, 60, 63] },
      { size: "XXL", values: [134, 82, 62, 64] },
    ],
    note: "Length measured at the back, collar seam to hem.",
  },
  cargos: {
    columns: ["WAIST", "HIP", "LENGTH", "LEG OPENING"],
    rows: [
      { size: "S", values: [74, 108, 100, 44] },
      { size: "M", values: [80, 112, 102, 45] },
      { size: "L", values: [86, 116, 104, 46] },
      { size: "XL", values: [92, 120, 106, 47] },
      { size: "XXL", values: [98, 124, 108, 48] },
    ],
    note: "Waist measured relaxed; the drawcord gives about 6 cm either way.",
  },
  sweatpants: {
    columns: ["WAIST", "HIP", "LENGTH", "CUFF"],
    rows: [
      { size: "S", values: [70, 104, 98, 26] },
      { size: "M", values: [76, 108, 100, 27] },
      { size: "L", values: [82, 112, 102, 28] },
      { size: "XL", values: [88, 116, 104, 29] },
      { size: "XXL", values: [94, 120, 106, 30] },
    ],
    note: "Waist measured relaxed, elastic unstretched.",
  },
  shorts: {
    columns: ["WAIST", "HIP", "LENGTH", "LEG OPENING"],
    rows: [
      { size: "S", values: [72, 106, 50, 64] },
      { size: "M", values: [78, 110, 51, 66] },
      { size: "L", values: [84, 114, 52, 68] },
      { size: "XL", values: [90, 118, 53, 70] },
      { size: "XXL", values: [96, 122, 54, 72] },
    ],
    note: "Hits just above the knee on a 178 cm frame.",
  },
  onesize: {
    columns: ["WIDTH", "HEIGHT"],
    rows: [{ size: "ONE SIZE", values: [0, 0] }],
    note: "One size. Adjustable where it matters.",
  },
  socks: {
    columns: ["FITS UK", "FITS EU", "LENGTH"],
    rows: [
      { size: "UK 6–8", values: [6, 39, 22] },
      { size: "UK 9–11", values: [9, 43, 24] },
    ],
    note: "Crew height. Combed cotton with a cushioned sole.",
  },
};

export const modelInfo = {
  default: "Model is 183 cm (6 ft), wearing L.",
} as const;

export const trendingSearches = ["hoodie", "cargos", "live wire", "reversible", "black tee", "cap"] as const;

export const seo = {
  defaultOgImage: "/og/home.png",
  twitterHandle: "@wrngside",
} as const;

/** Sound is optional and off by default. Synthesised in the browser (no files). */
export const sound = {
  enabledByDefault: false,
  masterVolume: 0.35,
} as const;
