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
    "Premium Indian streetwear. Oversized tees, football jerseys, hoodies, denim jackets and wide-leg sweatpants, released in limited drops. COD across India.",
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
  upsellHandle: "07-archives-tank",
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
      name: "NIGHT SYSTEMS",
      status: "locked",
      // Countdown target. Everything (ticker, teaser, drops page) reads this.
      releaseAt: "2026-11-20T20:00:00+05:30",
      story:
        "Three black tees for the hours the city runs on backup power. A black hole, a web strung over the skyline and a head wired the wrong way.",
      location: "SHOT UNDER THE SIGNATURE BRIDGE",
    },
    {
      id: "drop-04",
      number: "04",
      name: "AFTER HOURS",
      status: "live",
      releasedAt: "2026-10-16T20:00:00+05:30",
      story:
        "Twelve pieces hung on the wires above Chawri Bazar. Studded tanks, football shirts, baroque denim and a work jacket that says AFTER HOURS on the chest.",
      location: "CHAWRI BAZAR, DELHI",
    },
    {
      id: "drop-03",
      number: "03",
      name: "EXTRA TIME",
      status: "archived",
      releasedAt: "2026-05-22T20:00:00+05:30",
      story: "Football shirts for teams we'll never play for. Seven countries, names and numbers on the back, out in time for the World Cup.",
      location: "SIRI FORT, DELHI",
    },
    {
      id: "drop-02",
      number: "02",
      name: "HEAVEN SENT",
      status: "archived",
      releasedAt: "2025-11-14T20:00:00+05:30",
      story: "Wings painted on washed denim, cherry blossom all over the next one, BLESSED down a leg. The softest thing we've made.",
      location: "LODHI GARDEN, DELHI",
    },
    {
      id: "drop-01",
      number: "01",
      name: "GROUND ZERO",
      status: "archived",
      releasedAt: "2024-12-06T20:00:00+05:30",
      story: "Where it started. A black hoodie that said ONE OF 1, a dragon down the back of another, and leopard you only see up close. Still here.",
      location: "SHAHPUR JAT, DELHI",
    },
  ],
};

/** One line under each category title on the shop pages. */
export const collectionCopy = {
  tees: "Oversized tees, layered long sleeves and tanks. Most of the noise is on the back.",
  jerseys: "Football shirts and polos for teams we'll never play for. Names and numbers on the back.",
  outerwear: "Hoodies and jackets for the hour the city cools down.",
  bottoms: "Wide-leg sweatpants, long enough to stack, with prints that run the length of the leg.",
} as const;

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
        { label: "Jerseys", href: "/shop/jerseys" },
        { label: "Outerwear", href: "/shop/outerwear" },
        { label: "Bottoms", href: "/shop/bottoms" },
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
    /** Same line on touch screens, where the line is swiped. */
    subTouch: "DROP {drop} — SWIPE THE LINE →",
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
      "HEAVYWEIGHT COTTON AND FLEECE",
      "ACID AND STONE WASHES",
      "PUFF PRINT, EMBROIDERY, STUDS",
      "BOXY OVERSIZED FIT",
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

/**
 * Interface copy: page titles, section headings, labels, buttons and small
 * print. Anything in {braces} is filled in at render time.
 */
export const ui = {
  common: {
    home: "HOME",
    shop: "SHOP",
    help: "HELP",
    loading: "LOADING…",
    loadingBag: "LOADING YOUR BAG…",
    oneSize: "ONE SIZE",
    soldOut: "SOLD OUT",
    soldOutSuffix: " · SOLD OUT",
    gone: "GONE",
    quickAdd: "QUICK ADD",
    quickAddLabel: "Quick add {title}",
    showSide: "Show the {side} of {title}",
    addSizeLabel: "Add {title} size {size} to bag",
    soldOutSizeLabel: "{title} size {size} sold out",
    added: "ADDED",
    add: "ADD",
    remove: "REMOVE",
    free: "FREE",
    new: "NEW",
    lowStock: "LOW STOCK",
    limitedRun: "LIMITED RUN",
    dropsAt: "DROPS {slot}",
    onlyLeft: "ONLY {n} LEFT",
    notifyWhenDrops: "NOTIFY ME WHEN IT DROPS",
    notifyRestocking: "RESTOCKING — NOTIFY ME",
    colourCount: "{n} COLOURS",
    piece: "PIECE",
    pieces: "PIECES",
    was: "Was {price}, now ",
    countdown: { days: "DD", hours: "HH", minutes: "MM", seconds: "SS" },
    channels: { instagram: "INSTAGRAM", whatsapp: "WHATSAPP", email: "EMAIL" },
    contactModes: { email: "EMAIL", whatsapp: "WHATSAPP", emailLabel: "Email address", phoneLabel: "WhatsApp number", emailPlaceholder: "you@wherever.com", phonePlaceholder: "98XXXXXXXX" },
    arrivesBy: "ARRIVES BY",
    codAvailable: "COD AVAILABLE",
    prepaidOnly: "PREPAID ONLY",
    peg: "PEG IT",
    pegged: "PEGGED",
    pegLabel: "Peg {title} to your line",
    unpegLabel: "Unpeg {title} from your line",
    skipToContent: "Skip to content",
  },
  pages: {
    about: { kicker: "EST. {year} — {city}, {country}", title: ["RAISED ON", "THE WRONG SIDE", "OF THE WIRE."], end: "THAT'S US. THE CLOTHES SAY THE REST." },
    bag: ["YOUR BAG"],
    checkout: { kicker: "CHECKOUT · SECURE · GST INCLUDED", title: ["PAY UP."] },
    drops: { archive: "THE ARCHIVE", liveNow: "LIVE NOW", archived: "ARCHIVED" },
    help: { kicker: "WE ANSWER {hours}", title: ["HELP."], intro: "Most answers are below. If yours isn't, message us. A human replies.", open: "OPEN →", faq: "FAQ" },
    legal: { lastUpdated: "LAST UPDATED {date}" },
    lookbook: { title: ["AFTER", "MIDNIGHT."], hint: "SCROLL TO WALK THE CHAPTERS ↓", chapter: "CHAPTER" },
    notFound: { kicker: "404 · NOTHING ON THIS WIRE", title: ["WRONG SIDE.", "EVEN FOR US."] },
    product: { core: "CORE", dropLabel: "DROP {number} · {name}", completeTheFit: "COMPLETE THE FIT" },
    home: { mostWanted: "MOST WANTED", shopAll: "SHOP ALL →" },
  },
  shop: {
    filter: "FILTER",
    filterCount: "FILTER ({n})",
    sort: "SORT",
    sortBy: "Sort by",
    sorts: { featured: "Featured", new: "New", "price-asc": "Price low–high", "price-desc": "Price high–low" },
    groups: { category: "CATEGORY", size: "SIZE", colour: "COLOUR", fit: "FIT", price: "PRICE" },
    all: "ALL",
    clearAll: "CLEAR ALL",
    resetFilters: "RESET FILTERS",
    showing: "SHOWING {shown} OF {total}",
    show: "SHOW {n} {pieces}",
  },
  product: {
    mrp: "MRP",
    taxNote: "(incl. of all taxes)",
    colour: "COLOUR",
    size: "SIZE",
    sizeGuide: "SIZE GUIDE",
    onlyLeftLabel: ", only {n} left",
    sizeNote: "Struck-through sizes are gone. Tap one to get notified.",
    enterAccessCode: "ENTER ACCESS CODE",
    accordions: { details: "DETAILS", fabric: "FABRIC & GSM", fit: "FIT", care: "CARE", shipping: "SHIPPING & RETURNS", origin: "ORIGIN & MAKER" },
    weight: "Weight: {gsm} GSM.",
    exchangesReturns: "Exchanges within {exchange} days, returns within {returns}.",
    fullPolicy: "Full policy",
    origin: "Country of origin",
    manufacturer: "Manufacturer",
    marketer: "Marketed by",
    sku: "SKU",
    zoomLabel: "Zoom: {alt}",
    recentlyViewed: "RECENTLY VIEWED",
    reviews: { title: "WORN, THEN REVIEWED", review: "REVIEW", reviews: "REVIEWS", none: "No reviews yet. Wear it first, then tell us.", bought: "BOUGHT", photoFrom: "Photo from {name}" },
    pincode: { label: "DELIVERY", placeholder: "Pincode", check: "CHECK", deliveryBy: "Delivery by {date}", cod: "COD available", prepaid: "Prepaid only" },
    sizeGuideDrawer: { title: "SIZE GUIDE", caption: "Garment measurements in {unit}", unitNames: { cm: "centimetres", in: "inches" }, size: "SIZE", chest: "CHEST", length: "LENGTH", shoulder: "SHOULDER", sleeve: "SLEEVE", howTo: "LAY IT FLAT. MEASURE A PIECE YOU ALREADY LOVE." },
  },
  cart: {
    title: "YOUR BAG",
    size: "SIZE",
    each: "{price} EACH",
    allWeHave: "THAT'S ALL WE HAVE IN {size}.",
    qtyLabel: "Quantity for {title}",
    qtyAnnounce: "Quantity {n}",
    removedAnnounce: "{title} removed from bag.",
    upsell: "ADD {title} {type} — {price}",
    noteLabel: "Order note",
    away: "{amount} AWAY FROM FREE SHIPPING",
    finishTheFit: "FINISH THE FIT",
    note: "ADD A NOTE TO YOUR ORDER",
    notePlaceholder: "Gift? Delivery instructions? Tell us.",
    subtotal: "SUBTOTAL",
    taxNote: "Taxes included. Shipping calculated at checkout.",
    poweredOn: "FREE SHIPPING: POWERED ON",
  },
  checkout: {
    contact: "01 CONTACT",
    delivery: "02 DELIVERY",
    payment: "03 PAYMENT",
    fields: { email: "Email", mobile: "Mobile (for WhatsApp updates)", name: "Full name", pincode: "Pincode", line1: "House / flat, street", line2: "Area, landmark (optional)", city: "City", state: "State", upiId: "UPI ID", upiPlaceholder: "yourname@okbank", card: "Card number", expiry: "Expiry (MM/YY)", cvv: "CVV" },
    methods: { upi: "UPI", card: "CARD", cod: "CASH ON DELIVERY", codShort: "Cash on delivery", upiNote: "GPay, PhonePe, Paytm, any UPI app", cardNote: "Visa, Mastercard, RuPay", codUnavailable: "Not available for this order", codFee: "+{fee}", noFee: "No extra fee" },
    codNote: "Pay in cash or UPI when it arrives. Keep {amount} handy.",
    yourOrder: "YOUR ORDER",
    discountCode: "Discount code",
    apply: "APPLY",
    subtotal: "Subtotal",
    discount: "Discount ({code})",
    shipping: "Shipping",
    total: "Total",
    gstNote: "All prices include GST.",
    placeOrder: "PLACE ORDER",
    pay: "PAY {amount}",
    demoNote: "This is a demo checkout: nothing is charged. It hands off to Shopify checkout when connected.",
    finding: "FINDING YOUR ORDER…",
    trackOrder: "TRACK AN ORDER",
    order: "ORDER",
    confirmedTitle: ["YOU'RE ON", "THE WIRE."],
    thanks: "Thanks, {name}. We'll WhatsApp tracking to +91 {phone} and email {email} the moment it ships. Arrives by {date}.",
    paymentLabel: "Payment",
    shipTo: "Ship to",
    seeOrders: "SEE YOUR ORDERS",
  },
  account: {
    kicker: "ACCOUNT",
    signIn: ["SIGN IN."],
    otpNote: "No passwords. We send a 6-digit code to your phone or email.",
    codeSent: "Code sent.",
    codeSentTo: "Code sent to",
    sendCode: "SEND CODE",
    demoOtp: "Demo: any 6 digits work.",
    verify: "VERIFY",
    change: "CHANGE {what}",
    number: "NUMBER",
    email: "EMAIL",
    addresses: "ADDRESSES",
    addAddress: "ADD ADDRESS",
    noAddresses: "No addresses yet. Add one for faster checkout.",
    default: "DEFAULT",
    edit: "EDIT",
    makeDefault: "MAKE DEFAULT",
    delete: "DELETE",
    fullName: "Full name",
    addressFields: { name: "Full name", phone: "Mobile", pincode: "Pincode", line1: "House / flat, street", line2: "Area, landmark", city: "City", state: "State" },
    saveAddress: "SAVE ADDRESS",
    cancel: "CANCEL",
    signedInAs: "SIGNED IN AS",
    title: ["YOUR ACCOUNT."],
    yourLine: "YOUR LINE",
    signOut: "SIGN OUT",
    orders: "ORDERS",
    noOrders: "Nothing yet.",
    noOrdersCta: "The line is waiting.",
    items: "ITEMS",
  },
  saved: {
    kicker: "SAVED · {n} PEGGED",
    title: ["YOUR LINE."],
    emptyLabel: "Your line is empty",
    rowLabel: "Saved pieces {from} to {to}",
    unpeg: "UNPEG",
    unpegLabel: "Unpeg {title}",
  },
  help: {
    standardShipping: "Standard shipping below the threshold: {price}.",
    returnsStart: ["Start one from ", " or message us on WhatsApp with your order ID."],
    trackOrderLink: "Track Order",
    refundsLine: ["Returns are accepted within {returns} days of delivery; exchanges within {exchange}. See ", "."],
    returnsLink: "Returns & Exchanges",
    sizeChartTitles: { tee: "OVERSIZED TEES", tank: "TANKS", jersey: "JERSEYS & POLOS", longsleeve: "LONG SLEEVES", hoodie: "HOODIES", jacket: "JACKETS", sweatpants: "SWEATPANTS" },
    whatsappNote: "Fastest. {hours}.",
    grievanceIntro: "Under the Consumer Protection (E-Commerce) Rules, 2020 and the IT Rules, 2021, you can raise any complaint with our Grievance Officer.",
    grievanceKeys: { role: "Role", email: "Email", hours: "Hours", company: "Company", address: "Address" },
    grievanceSla: "We acknowledge every complaint within {hours} hours and resolve it within {days} days of receiving it.",
    track: { orderId: "Order ID", orderIdPlaceholder: "WS123456", phone: "Phone number", submit: "TRACK", order: "ORDER {id}" },
    faq: { label: "Search the FAQ", placeholder: "COD, restock, sizes…", answer: "ANSWER", answers: "ANSWERS", empty: "NOTHING ON THAT. ASK US ON WHATSAPP." },
    contactForm: { name: "Name", email: "Email", order: "Order ID (optional)", message: "Message", send: "SEND", sent: "GOT IT. WE'LL REPLY WITHIN A WORKING DAY." },
  },
  search: {
    overlayKicker: "SEARCH THE WIRE · PRESS ESC TO CLOSE",
    kicker: "SEARCH",
    title: "SEARCH THE WIRE",
    label: "Search products",
    placeholder: "Jersey, hoodie, baroque…",
    overlayPlaceholder: "JERSEY, HOODIE, BAROQUE…",
    resultsLabel: "Results",
    trending: "TRENDING",
    onTheWire: "{n} ON THE WIRE",
    seeAll: "SEE ALL RESULTS FOR “{q}”",
    result: "RESULT",
    results: "RESULTS",
  },
  drops: {
    slot: "DROP {number} · {slot}",
    liveNow: "LIVE NOW ON THE LINE",
    piecesLabel: "DROP {number} pieces",
    timerLabel: "{days} days {hours} hours {minutes} minutes left",
    enterCode: "ENTER ACCESS CODE",
    unlock: "UNLOCK",
    waitlist: "JOIN THE WAITLIST",
    waitlisted: "YOU'RE ON THE WAITLIST. PHONE ON LOUD.",
    unlocked: "DROP {number} is unlocked.",
  },
  notify: {
    kicker: "ON THE LIST",
    title: "WE'LL PING YOU.",
    body: "First word when {title}{size} is back on the wire. One message. No spam.",
    inSize: " in {size}",
    done: "DONE",
    announced: "You'll be notified about {title}.",
  },
  home: {
    byCategory: "SHOP BY CATEGORY",
    seeEverything: "SEE EVERYTHING →",
    tagUs: "TAG US ON INSTAGRAM →",
    lookbook: "LOOKBOOK",
    walkChapters: "WALK THE CHAPTERS →",
    chapterLabel: "Chapter {id}: {title}, {time}, {place}",
    craftKicker: "06 — CRAFT",
    craftLabel: "{city} · DROP {drop}",
    craftCare: "WASH COLD · INSIDE OUT · DRY IN SHADE · RN {drop}-{year}",
    manifestoAccent: ["CROSSED", "OVER"],
    est: "EST. {year} — {city}, {country}",
    nextDrop: "NEXT DROP · {number} · {slot}",
    countdownLabel: "{days} days, {hours} hours, {minutes} minutes until DROP {number}",
    countdownIdle: "Countdown",
    craftCareLabel: "What goes into every piece",
    communityLabel: "{handle} in {city}, on Instagram",
    communityAlt: "{handle} wearing WRNGSIDE in {city}",
    chapterCount: "CHAPTER {id} / {total}",
    chapterAlt: "{title}: {place} at {time}",
    stripsLabel: "{hint}: {n} strips left",
    nextDropAlt: "The {name} drop hanging under a single streetlamp on a flyover at night",
    notifyDone: "YOU'LL HEAR FIRST. PHONE ON LOUD.",
    tz: "IST",
    newsletter: { notice: "NOTICE · NOTICE · NOTICE", submit: "GET ON IT", strip: "WRNGSIDE.COM/LIST", stripLabel: "Tear off strip {n}", revealed: "YOU TORE IT ALL. HERE.", copyCode: "COPY CODE" },
  },
  shell: {
    menu: "MENU",
    close: "CLOSE",
    bag: "BAG",
    search: "SEARCH",
    searchLabel: "Search (press /)",
    account: "ACCOUNT",
    logoLabel: "WRNGSIDE — back to THE LINE",
    searchTheWire: "SEARCH THE WIRE →",
    sound: "SOUND",
    soundOn: "Sound on. Turn sound off",
    soundOff: "Sound off. Turn sound on",
    bagLabel: "Bag, {n} {items}",
    item: "item",
    items: "items",
    weTake: "WE TAKE",
    madeIn: "MADE IN {country}. SAID WRONG SIDE.",
    social: { instagram: "WRNGSIDE on Instagram", whatsapp: "Message WRNGSIDE on WhatsApp", email: "Email WRNGSIDE" },
  },
  /** Text painted, pasted and printed on THE LINE's scene (posters, plates, tags). */
  scene: {
    poster: { drop: "· DROP {drop}", pieces: "{n} PIECES" },
    paste: {
      dropPoster: "DROP {drop}",
      nextOnTheLine: "NEXT ON THE LINE",
    },
    plate: { danger: "DANGER", volts: "440V", brand: "WRNGSIDE" },
    board: { marg: "MARG", srShop: "shop everything" },
    tag: { drop: "DROP {drop}", quickAdd: "QUICK ADD", gone: "GONE" },
    egg: { found: "FOUND IN THE DARK", off: "{n}% OFF" },
    lineLabel: "DROP {drop} — THE LINE, {n} pieces. Use left and right arrow keys to move along the line.",
  },
} as const;

/** Per-page titles and descriptions for search and social cards. */
export const pageSeo = {
  about: { title: "About", description: "WRNGSIDE: raised on the wrong side of the wire. The name, the city, the process, the team." },
  drops: { title: "Drops", description: "DROP 05 is locked. Countdown, access code and waitlist, plus the WRNGSIDE drop archive." },
  help: { title: "Help", description: "Shipping, returns and exchanges, size guide, order tracking, FAQ and contact for WRNGSIDE." },
  lookbook: { title: "Lookbook", description: "DROP 04 — AFTER HOURS, shot after midnight across Delhi. Five chapters." },
  shop: { title: "Shop everything", description: "Oversized tees, football jerseys, hoodies, denim jackets and wide-leg sweatpants from WRNGSIDE. Limited drops, made in India, COD available." },
  account: { title: "Account" },
  bag: { title: "Your bag" },
  checkout: { title: "Checkout" },
  confirmed: { title: "Order confirmed" },
  saved: { title: "Your Line" },
  search: { title: "Search" },
  notFound: { title: "Wrong side" },
} as const;

/** Devanagari signage. HI: every string here needs a native speaker's check. */
export const hindi = {
  wrongSide: "रॉन्ग साइड", // HI: "wrong side" transliterated (stencil on the wall)
  danger: "खतरा", // HI: "danger" (pole plate)
  marg: {
    tees: "टीज़ मार्ग", // HI: "Tees Marg"
    jerseys: "जर्सीज़ मार्ग", // HI: "Jerseys Marg"
    outerwear: "आउटरवियर मार्ग", // HI: "Outerwear Marg"
    bottoms: "बॉटम्स मार्ग", // HI: "Bottoms Marg"
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
  season: "DROP 04 — AFTER HOURS",
  chapters: [
    {
      id: "01",
      title: "AFTER HOURS",
      time: "02:14 AM",
      place: "CHAWRI BAZAR, DELHI",
      text: "The wires came first. Then the market. Then the jacket that says it on the chest.",
      image: "/campaign/lookbook-01.webp",
      products: ["starlit-nights-jacket", "crazy-days-sweatpants"],
    },
    {
      id: "02",
      title: "BAROQUE",
      time: "03:40 AM",
      place: "PAHARGANJ, DELHI",
      text: "Scrollwork up the back, down the legs. Dressed for a palace, walking home past the chai stall.",
      image: "/campaign/lookbook-02.webp",
      products: ["baroque-denim-jacket", "baroque-sweatpants"],
    },
    {
      id: "03",
      title: "AWAY DAYS",
      time: "01:52 AM",
      place: "RAJIV CHOWK METRO, DELHI",
      text: "Last train out. Every shirt here belongs to a team we'll never play for.",
      image: "/campaign/lookbook-03.webp",
      products: ["away-days-23-jersey", "argentina-10-long-sleeve-jersey"],
    },
    {
      id: "04",
      title: "BATFANG",
      time: "04:05 AM",
      place: "KAROL BAGH, DELHI",
      text: "The hour the bats own the wires and the lamps hum louder than the traffic.",
      image: "/campaign/lookbook-04.webp",
      products: ["batfang-hoodie", "obscura-layered-tee"],
    },
    {
      id: "05",
      title: "FLASH",
      time: "12:48 AM",
      place: "HAUZ KHAS VILLAGE, DELHI",
      text: "Studs, chains, a camera flash. The sign says no. The street says maybe.",
      image: "/campaign/lookbook-05.webp",
      products: ["flash-studded-tank", "eight-ball-tank"],
    },
  ],
} as const;

export const community = {
  hashtag: "#WRNGSIDE",
  posts: [
    { handle: "@ayaan.after.dark", image: "/campaign/community-01.webp", city: "MUMBAI" },
    { handle: "@meher.on.mute", image: "/campaign/community-02.webp", city: "BENGALURU" },
    { handle: "@kabirwasnthere", image: "/campaign/community-03.webp", city: "DELHI" },
    { handle: "@tanvi.inverted", image: "/campaign/community-04.webp", city: "PUNE" },
    { handle: "@ronit.rides.late", image: "/campaign/community-05.webp", city: "KOLKATA" },
    { handle: "@zoya.wrongturn", image: "/campaign/community-06.webp", city: "HYDERABAD" },
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
    a: "Exchanges within 14 days and returns within 7, on unworn pieces with tags on. Start it from Track Order or message us on WhatsApp.",
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
    q: "How do the football jerseys fit?",
    a: "Loose, like a proper football shirt: raglan sleeves and room through the body. Take your usual size for a relaxed fit, or size down for a closer one.",
    tags: ["jersey", "football", "fit", "polo"],
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
export type SizeChartKey = "tee" | "tank" | "jersey" | "longsleeve" | "hoodie" | "jacket" | "sweatpants";

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
  tank: {
    columns: ["CHEST", "LENGTH", "ARMHOLE"],
    rows: [
      { size: "S", values: [106, 70, 26] },
      { size: "M", values: [110, 72, 27] },
      { size: "L", values: [114, 74, 28] },
      { size: "XL", values: [118, 76, 29] },
      { size: "XXL", values: [122, 78, 30] },
    ],
    note: "Armhole measured straight down from the strap to the side seam.",
  },
  jersey: {
    columns: ["CHEST", "LENGTH", "SHOULDER", "SLEEVE"],
    rows: [
      { size: "S", values: [108, 70, 50, 22] },
      { size: "M", values: [112, 72, 52, 23] },
      { size: "L", values: [116, 74, 54, 24] },
      { size: "XL", values: [120, 76, 56, 25] },
      { size: "XXL", values: [124, 78, 58, 26] },
    ],
    note: "Raglan sleeves: shoulder is measured across the back, seam to seam.",
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
    note: "Length measured from the shoulder seam to the hem, hood not included.",
  },
  jacket: {
    columns: ["CHEST", "LENGTH", "SHOULDER", "SLEEVE"],
    rows: [
      { size: "S", values: [122, 66, 54, 62] },
      { size: "M", values: [126, 68, 56, 63] },
      { size: "L", values: [130, 70, 58, 64] },
      { size: "XL", values: [134, 72, 60, 65] },
      { size: "XXL", values: [138, 74, 62, 66] },
    ],
    note: "Cut to wear over a hoodie.",
  },
  sweatpants: {
    columns: ["WAIST", "HIP", "LENGTH", "LEG OPENING"],
    rows: [
      { size: "S", values: [70, 108, 100, 30] },
      { size: "M", values: [76, 112, 102, 31] },
      { size: "L", values: [82, 116, 104, 32] },
      { size: "XL", values: [88, 120, 106, 33] },
      { size: "XXL", values: [94, 124, 108, 34] },
    ],
    note: "Waist measured relaxed, elastic unstretched. The drawcord takes in about 6 cm.",
  },
};

export const modelInfo = {
  default: "Model is 183 cm (6 ft), wearing L.",
} as const;

export const trendingSearches = ["jersey", "baroque", "hoodie", "denim jacket", "black tee", "sweatpants"] as const;

/** Social cards are generated by scripts/generate-og.mjs (JPEG, under 300 KB for WhatsApp). */
export const seo = {
  defaultOgImage: "/og/home.jpg",
  defaultOgAlt: "THE LINE: the WRNGSIDE drop hanging on power cables at night",
  productOgDir: "/og/products",
  twitterHandle: "@wrngside",
  legalDescriptions: {
    terms: "The terms for buying from WRNGSIDE: orders, pricing, drops and stock, delivery and governing law.",
    privacy: "What WRNGSIDE collects, why, what stays on your device, and your rights under the DPDP Act, 2023.",
    refunds: "WRNGSIDE returns, exchanges and refunds: {returnDays}-day returns, {exchangeDays}-day exchanges, and how money comes back.",
    grievance: "Reach the WRNGSIDE grievance officer. Complaints acknowledged within {ackHours} hours and resolved within {resolveDays} days.",
  },
} as const;

/** Sound is optional and off by default. Synthesised in the browser (no files). */
export const sound = {
  enabledByDefault: false,
  masterVolume: 0.35,
} as const;
