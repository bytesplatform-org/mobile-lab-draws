/**
 * Every word and fact on the homepage, in one place. Components render only
 * from this file.
 *
 * The client copy is verbatim from the homepage of mobilelabdraws.org
 * (True Lab Results and Mobile Service LLC, Fayetteville, GA), including the
 * text its booking widget loads. The only edits are these light fixes:
 *   - "No children allow during drug screening" → "No children allowed …"
 *   - the H1's lowercase "support" → "Support"
 *   - the meta description's "True Lab Result offers…" → "True Lab Results offers…"
 *   - stray trailing spaces trimmed (and the space before the treatment paragraph's period)
 * Capitalisation inside lists is the client's own; keep it.
 *
 * Structural labels (index numbers, mono callouts, the hero's top strip) use
 * only terms that already appear in the copy. Nothing here invents a service,
 * price, statistic, testimonial, credential or year.
 *
 * scripts/check-content.mjs asserts that every string in this file (except
 * the keys it lists as non-copy: links, ids, image paths and alt text) is on
 * the built homepage.
 */

/* ------------------------------------------------------------------ */
/* Business facts                                                      */
/* ------------------------------------------------------------------ */

export const meta = {
  /** The live site's own title is "Dependable and convenient Lab services". */
  title: "True Lab Results | Dependable and convenient Lab services",
  description: "True Lab Results offers a wide range of lab work services including drug screening and mobile lab options.",
  url: "https://mobilelabdraws.org",
};

const MAPS = "https://www.google.com/maps/search/?api=1&query=1139+Highway+54+East+Lanier+Ave+Suite+J+Fayetteville+GA+30215";

export const business = {
  legalName: "True Lab Results and Mobile Service LLC",
  name: "True Lab Results",
  tagline: "Mobile Services and Phlebotomy Training",
  /** As written on the live site. */
  address: "1139 Highway 54 East Lanier Ave Suite J Fayetteville, Ga 30215",
  street: "1139 Highway 54 East Lanier Ave Suite J",
  city: "Fayetteville",
  region: "GA",
  postalCode: "30215",
  phone: "470-302-7769",
  phoneHref: "tel:4703027769",
  fax: "888-666-1770",
  faxHref: "tel:8886661770",
  email: "truelabresults@mobilelabdraws.org",
  directions: { label: "Get directions", href: MAPS },
  social: [
    { label: "Facebook", href: "https://www.facebook.com/969332539590781" },
    { label: "Instagram", href: "https://www.instagram.com/truelabresults" },
  ],
};

/** The call-to-action every section reuses. */
export const callCta = { label: "Call for an appointment", href: business.phoneHref };

/* ------------------------------------------------------------------ */
/* Tube-cap colour code                                                */
/* ------------------------------------------------------------------ */

/** Blood-collection tube caps: the accent system (see --cap-* in globals.css). */
export const CAPS = {
  lavender: "#8E7CC3",
  blue: "#7FC8E8",
  gold: "#E5B64A",
  red: "#C8323A",
  green: "#6DBE8D",
  grey: "#A9AFB3",
} as const;
export type Cap = keyof typeof CAPS;
export const CAP_ORDER: Cap[] = ["lavender", "blue", "gold", "red", "green", "grey"];

/* ------------------------------------------------------------------ */
/* Page furniture                                                      */
/* ------------------------------------------------------------------ */

export const brand = {
  name: "True Lab Results",
  sub: "Mobile Services & Phlebotomy Training",
  ariaHome: "True Lab Results, home",
  logo: {
    src: "/brand/true-lab-results-logo.png",
    alt: "True Lab Results logo: a teal heart with a white cross, “True Lab Results” arched above and “Mobile Services and Phlebotomy Training” below",
  },
  /** The hero's top strip and the loader's: structural, after the business. */
  kicker: "Mobile Services · Phlebotomy · Drug Screening",
  sequence: ["Collect", "Screen", "Send", "Results"],
};

export const loader = {
  ariaLabel: "Loading True Lab Results",
  status: ["Collect", "Screen", "Send", "Results"],
};

const LIVE = "https://mobilelabdraws.org";

export const nav = {
  links: [
    { label: "Home", href: "#top" },
    { label: "About", href: `${LIVE}/about`, external: true },
    { label: "Services", href: "#services" },
    { label: "Drug Screens", href: "#drug-screens" },
    { label: "Book", href: "#book" },
    { label: "Contact", href: "#contact" },
  ],
  /** The live site's account links: mobile menu and footer only. */
  account: [
    { label: "Sign In", href: `${LIVE}/m/account` },
    { label: "Create Account", href: `${LIVE}/m/create-account` },
    { label: "Bookings", href: `${LIVE}/m/bookings` },
    { label: "My Account", href: `${LIVE}/m/account` },
  ],
  accountLabel: "Account",
  cta: callCta,
  menu: { open: "Menu", close: "Close" },
};

/* ------------------------------------------------------------------ */
/* 2. Hero                                                             */
/* ------------------------------------------------------------------ */

export const hero = {
  /** Phase A: the lockup that stands over the photograph. */
  lockup: ["True Lab", "Results"],
  /** The live site's H1 (only "support" capitalised). */
  title: "Support for Detox, MAT programs, Addiction treatment centers",
  /** The H1 over three staggered lines, two words each (the GL atlas reads them in this order). */
  lines: [
    { words: [{ text: "Support for", hollow: true }, { text: "Detox,", hollow: false }], dir: 1 },
    { words: [{ text: "MAT", hollow: false }, { text: "programs,", hollow: false }], dir: -1 },
    { words: [{ text: "Addiction", hollow: true }, { text: "treatment centers", hollow: false }], dir: 1 },
  ],
  lede: meta.description,
  /** TODO(client): the live site's original is only 480 × 300; supply a high-resolution, licensed photo. */
  image: {
    src: "/images/hero-blood-tube.jpg",
    alt: "A gloved hand holds a filled blood-collection tube in front of rows of tubes with coloured caps",
    width: 1920,
    height: 1200,
  },
  ctas: {
    call: callCta,
    services: { label: "View all services", href: "#services" },
    directions: business.directions,
  },
  /** The analyzer-style readout beside the lockup (copy terms only; the cap colours are ours). */
  readout: [
    { label: "DOT & NON-DOT", cap: "gold" },
    { label: "PGx / PHARMACOGENOMIC", cap: "lavender" },
    { label: "30-MILE RADIUS", cap: "blue" },
    { label: "BY APPOINTMENT ONLY", cap: "green" },
  ] satisfies { label: string; cap: Cap }[],
};

/* ------------------------------------------------------------------ */
/* 3. Statement ring                                                   */
/* ------------------------------------------------------------------ */

/** Set as a specimen label: the name and tagline in its header, these four as its fields. */
export const statement = {
  /** The label's stamp and stub: terms from the copy. */
  stamp: "By appointment only",
  stub: "Specimens",
  credentials: [
    { k: "Service", v: "All services available by appointment only." },
    { k: "Billing", v: "Insurance accepted for lab test billing only. Venipuncture fee is due at the time of service." },
    { k: "Radius", v: "Specimens pick up or drop off: 30-mile radius" },
    { k: "Coverage", v: "Drug screening & mobile lab work covering all South, GA" },
  ],
};

/* ------------------------------------------------------------------ */
/* 4. SERVICE: the tube rack                                           */
/* ------------------------------------------------------------------ */

export type Tube = { text: string; cap: Cap };

export const services = {
  id: "services",
  lead: "All services available by appointment only.",
  concierge: "Concierge testing services for our private and celebrity Customer as well as our customers that enjoy the convenience of being serviced in their own home.",
  /** Words of the concierge line that light in teal as they're read. */
  conciergeLit: ["celebrity", "in their own home."],
  /** The rack, in the client's order. Cap colours are ours (the colour code). */
  tubes: [
    { text: "Health & Wellness Screening, Discount Drug-Free Workplace Programs, discounted employee insurance.", cap: "blue" },
    { text: "Background Checks", cap: "grey" },
    { text: "Confidential Paternity Testing", cap: "lavender" },
    { text: "Peekaboo Pregnancy Gender Reveal", cap: "green" },
    { text: "PGx / Pharmacogenomic genetic testing", cap: "gold" },
    { text: "DNA Detection testing", cap: "lavender" },
    { text: "Confidential STD / Pregnancy Testing", cap: "red" },
    { text: "Transgender Monitored Lab Testing", cap: "gold" },
    { text: "Specimens pick up or drop off: 30-mile radius", cap: "grey" },
    { text: "Routine Lab Work (With or Without Physician's Orders)", cap: "blue" },
  ] satisfies Tube[],
  /** A policy, not a service: set apart as a note. */
  note: "Insurance accepted for lab test billing only. Venipuncture fee is due at the time of service.",
};

/* ------------------------------------------------------------------ */
/* 5. DOT & NON DOT Drug Screen                                        */
/* ------------------------------------------------------------------ */

export type ShapeKey = "cup" | "shield" | "swab" | "breath" | "stopwatch" | "saliva" | "drop" | "gavel" | "magnifier";

export const drugScreens = {
  id: "drug-screens",
  title: "DOT & NON DOT Drug Screen",
  hours: "24-hour service available by appointment",
  soon: "COMING SOON",
  /**
   * The live site reads "DOT Oral Fluid Testing (coming soon)"; kept as written.
   * Callout labels are terms from each line.
   */
  tests: [
    { text: "DOT Urine Drug Screen Testing", shape: "cup", callouts: ["DOT", "URINE"] },
    { text: "Non-DOT Drug Screen Testing", shape: "shield", callouts: ["DOT", "NON-DOT"] },
    { text: "DOT Oral Fluid Testing (coming soon)", shape: "swab", soon: true, callouts: ["ORAL FLUID"] },
    { text: "Breath Alcohol Testing (coming soon)", shape: "breath", soon: true, callouts: ["BREATH ALCOHOL"] },
    { text: "Point of Service Non-DOT Drug Testing (Same Day Results)", shape: "stopwatch", callouts: ["SAME DAY RESULTS", "POINT OF SERVICE"] },
    { text: "Saliva Drug Testing", shape: "saliva", callouts: ["SALIVA"] },
    { text: "Blood Alcohol Testing", shape: "drop", callouts: ["BLOOD ALCOHOL"] },
    { text: "Court ordered Drug Testing", shape: "gavel", callouts: ["COURT ORDERED"] },
    { text: "Reasonable Suspicion (employees or Teenagers)", shape: "magnifier", callouts: ["EMPLOYEES", "TEENAGERS"] },
  ] as { text: string; shape: ShapeKey; soon?: boolean; callouts: string[] }[],
};

/* ------------------------------------------------------------------ */
/* 6. Treatment-center support                                         */
/* ------------------------------------------------------------------ */

export type IconName = "flask" | "shield" | "swab" | "helix" | "van" | "strip" | "clipboard" | "pulse";

export const treatment = {
  id: "treatment",
  /** The section's heading for screen readers (it has none on the page), after the H1's own words. */
  label: "Addiction treatment centers",
  body: "We provide professional laboratory and screening support for Detox, Residential Care, MAT programs, Addiction Treatment Centers, Behavioral Health Practices, Psychiatric Providers, and Outpatient Facilities.",
  facilities: [
    "Detox",
    "Residential Care",
    "MAT programs",
    "Addiction Treatment Centers",
    "Behavioral Health Practices",
    "Psychiatric Providers",
    "Outpatient Facilities",
  ],
  includes: "Our services include:",
  items: [
    { text: "Toxicology and drug screening", icon: "flask" },
    { text: "DOT and non-DOT testing", icon: "shield" },
    { text: "Oral fluid screening", icon: "swab" },
    { text: "PGx / Pharmacogenomic genetic testing", icon: "helix" },
    { text: "Mobile specimen collection", icon: "van" },
    { text: "Rapid Drug Screening", icon: "strip" },
    { text: "Clinical and compliance support", icon: "clipboard" },
    { text: "RPM and CCM / Incentive (we provide the equipment)", icon: "pulse" },
  ] as { text: string; icon: IconName }[],
};

/* ------------------------------------------------------------------ */
/* 7. Call band                                                        */
/* ------------------------------------------------------------------ */

export const callBand = {
  /** The booking widget's title, verbatim. */
  title: "Call for an appointment 470-302-7769",
  lead: "Call for an appointment",
  number: business.phone,
  button: { label: `Call ${business.phone}`, href: business.phoneHref },
  copyLabel: "Copy",
};

/* ------------------------------------------------------------------ */
/* 8. Service menu                                                     */
/* ------------------------------------------------------------------ */

export type BookItem = {
  id: string;
  name: string;
  /** As shown on the live site, or null where it shows none. */
  duration: string | null;
  minutes: number | null;
  price: string | null;
  cta: typeof callCta;
  cap: Cap;
  image: { src: string; alt: string } | null;
  /** Which filter tabs list this row (indexes into book.tabs; 0 = All Services). */
  tabs: number[];
};

export const book = {
  id: "book",
  label: "All Services",
  tabs: [
    "All Services",
    "Adult- Pediatric- Adolescent- Geriatric- and Special Needs",
    "Paternity Testing",
    "Drug Screening",
    "Fax/Scan/Copy/Notary",
    "Health Fair / Corporate Functions",
  ],
  /**
   * TODO(client): the live site doesn't say which card belongs to which tab.
   * This mapping is a first guess; confirm it.
   */
  items: [
    {
      id: "employment",
      name: "Employment Drug Screening Service",
      duration: "25 mins",
      minutes: 25,
      price: "Price varies per panel",
      cta: callCta,
      cap: "gold",
      image: { src: "/images/service-employment-drug-screening.jpg", alt: "A masked technician holds up a urine specimen cup" },
      tabs: [0, 3],
    },
    {
      id: "lab-draws",
      name: "Lab Draws",
      duration: "25 mins",
      minutes: 25,
      price: "Price varies",
      cta: callCta,
      cap: "red",
      image: { src: "/images/service-lab-draws.jpg", alt: "A phlebotomist in teal scrubs draws blood from a seated, masked patient" },
      tabs: [0, 1],
    },
    {
      id: "dna",
      name: "DNA Collections",
      duration: "1 hr",
      minutes: 60,
      price: "Price Varies per family",
      cta: callCta,
      cap: "lavender",
      image: { src: "/images/service-dna-collections.jpg", alt: "A doctor takes a cheek swab from a young girl" },
      tabs: [0, 2],
    },
    {
      id: "specimen",
      name: "Specimen Pickup and Drop Off Service",
      duration: "1 hr",
      minutes: 60,
      price: "Price Varies",
      cta: callCta,
      cap: "grey",
      image: { src: "/images/service-specimen-pickup.jpg", alt: "A courier holds a parcel and a clipboard at a front door" },
      tabs: [0, 1],
    },
    {
      id: "health-fair",
      name: "Health Fair/ Corporate Functions",
      duration: "4 hrs",
      minutes: 240,
      price: "Price Varies",
      cta: callCta,
      cap: "green",
      image: { src: "/images/service-health-fair.jpg", alt: "A team of healthcare workers in scrubs and white coats stands together" },
      tabs: [0, 5],
    },
    {
      id: "concierge",
      name: "Concierge/ Mobile Services",
      duration: "1 hr",
      minutes: 60,
      price: "Price Varies",
      cta: callCta,
      cap: "blue",
      image: { src: "/images/service-concierge-mobile.jpg", alt: "A healthcare worker in scrubs shakes hands with a woman at her front door" },
      tabs: [0, 1],
    },
    {
      // No card on the live site: listed under its own tab with the call button.
      id: "notary",
      name: "Fax/Scan/Copy/Notary",
      duration: null,
      minutes: null,
      price: null,
      cta: callCta,
      cap: "grey",
      image: null,
      tabs: [0, 4],
    },
  ] satisfies BookItem[],
};

/* ------------------------------------------------------------------ */
/* 9. Coverage + affiliates                                            */
/* ------------------------------------------------------------------ */

export const coverage = {
  id: "coverage",
  headline: "Drug screening & mobile lab work covering all South, GA",
  radius: "Specimens pick up or drop off: 30-mile radius",
  pin: "Fayetteville",
  ring: "30-MILE RADIUS",
  affiliatesLabel: "AFFILIATES",
  /**
   * Text wordmarks only, no third-party logos. The homepage's affiliate strip
   * is empty; these come from the About page's title and description.
   * TODO(client): confirm affiliate wording.
   */
  affiliates: ["Labcorp", "Quest Diagnostics", "Ulta Lab Tests"],
  affiliateNote: "All Specimens will be sent to LabCorp, Quest Diagnostic affiliated in Fayetteville GA.",
  seal: {
    ring: "TRUE LAB RESULTS AND MOBILE SERVICE LLC · FAYETTEVILLE · GA · ",
    tags: ["FAYETTEVILLE", "GA 30215"],
  },
  details: {
    legal: "Legal name",
    address: "Address",
    phone: "Phone",
    fax: "Fax",
    affiliates: "Affiliates",
  },
};

/* ------------------------------------------------------------------ */
/* 10. Reviews prompt                                                  */
/* ------------------------------------------------------------------ */

export const reviews = {
  /** TODO(client): room for real reviews once there are some. */
  headline: "Don't take our word for it, make an appointment today!",
  accent: "make an appointment today!",
  soon: "Reviews coming soon!",
  cta: callCta,
};

/* ------------------------------------------------------------------ */
/* 11. Photo gallery                                                   */
/* ------------------------------------------------------------------ */

/**
 * The live gallery's eight photographs plus the hero.
 * TODO(client): several are GoDaddy stock (see public/images/CREDITS.md).
 */
export const gallery = {
  heading: "Explore Our Health and Wellness Photo Gallery",
  photos: [
    { src: "/images/hero-blood-tube.jpg", alt: "A gloved hand holds a filled blood-collection tube in front of tubes with coloured caps" },
    { src: "/images/gallery-gloved-hand-tube.jpg", alt: "A gloved hand holds up a blood tube beside a stethoscope" },
    { src: "/images/gallery-arm-draw.jpg", alt: "Gloved hands prepare a patient's arm for a blood draw, a red tourniquet above the elbow" },
    { src: "/images/service-employment-drug-screening.jpg", alt: "A masked technician holds up a urine specimen cup" },
    { src: "/images/gallery-dna-helix.jpg", alt: "A glowing blue DNA double helix" },
    { src: "/images/service-dna-collections.jpg", alt: "A doctor takes a cheek swab from a young girl" },
    { src: "/images/gallery-care-team.jpg", alt: "Five healthcare workers in scrubs and white coats stand with arms crossed" },
    { src: "/images/gallery-family.jpg", alt: "Three generations of a family laugh together on a sofa" },
    { src: "/images/gallery-healthy-heart.jpg", alt: "A heart-shaped bowl of fruit and vegetables with a stethoscope on a wooden table" },
  ],
};

/* ------------------------------------------------------------------ */
/* 12. Contact                                                         */
/* ------------------------------------------------------------------ */

export const contact = {
  id: "contact",
  heading: "Contact Us",
  sub: "By appointments Only",
  body: "We are true to our customers, please make an appointment for service. Be sure to provide your name, phone number and the service that's being requested. Thank you",
  labels: { phone: "Phone:", fax: "Fax:" },
  hours: [
    "Hours of operation by appointments only",
    "Hours are flexible for DOT & Non-DOT Employment Drug Screens",
    "No children allowed during drug screening",
  ],
  map: {
    title: "Map: True Lab Results, 1139 Highway 54 East, Fayetteville, GA",
    src: "https://www.google.com/maps?q=1139+Highway+54+East+Lanier+Ave+Suite+J+Fayetteville+GA+30215&output=embed",
  },
  /** The appointment request form: exactly the fields the copy asks for. */
  form: {
    name: "Name",
    phone: "Phone number",
    service: "Service requested",
    servicePlaceholder: "Choose a service",
    note: "Note (optional)",
    submit: "Request an appointment",
    ui: {
      sending: "Sending",
      invalid: "Please add your name, a phone number we can reach you on, and the service you'd like.",
      sent: "Thank you. Your request has been sent; we'll call you to confirm a time.",
      fallback: "Your request couldn't be sent from the page.",
      openDraft: "Email it to us instead",
      orCall: "or call 470-302-7769",
    },
  },
};

/* ------------------------------------------------------------------ */
/* 13. Connect + sign-up                                               */
/* ------------------------------------------------------------------ */

export const connect = {
  heading: "Connect With Us",
  signup: {
    heading: "Sign up to hear from us.",
    field: "Email",
    submit: "Sign up",
    ui: {
      invalid: "Please enter a valid email address.",
      sent: "Thank you, you're signed up.",
      fallback: "Sign-up isn't connected yet.",
      openDraft: "Email us to join",
    },
  },
};

/* ------------------------------------------------------------------ */
/* 14. Footer                                                          */
/* ------------------------------------------------------------------ */

export const footer = {
  copyright: "Copyright © 2026 True Lab Results and Mobile service - All Rights Reserved.",
  wordmark: ["True Lab"],
  label: "True Lab Results",
  navTitle: "Pages",
  visitTitle: "Visit",
  callTitle: "Call",
  socialTitle: "Connect With Us",
  back: { label: "Back to top", href: "#top" },
};

/** Interface words that aren't the client's copy (labels for controls). */
export const ui = {
  skip: "Skip to content",
  previous: "Previous photo",
  next: "Next photo",
};

/** Every service and test named in the copy, for the form's select. */
export const serviceOptions = [
  ...book.items.map(i => i.name),
  ...services.tubes.map(t => t.text),
  ...drugScreens.tests.map(t => t.text),
].filter((v, i, all) => all.indexOf(v) === i);
