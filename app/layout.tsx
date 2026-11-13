import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Manrope } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { business, meta, ui } from "@/lib/content/site";

/*
 * Display: Fraunces, variable on wght (the closing beats swell it under the
 * pointer), opsz (optical size: fine hairlines when huge) and SOFT. The hero's
 * GL glyph atlas rasterises this face too (lib/gl/glyphAtlas).
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  display: "swap",
  variable: "--font-fraunces",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(meta.url),
  title: meta.title,
  description: meta.description,
  openGraph: {
    type: "website",
    siteName: business.name,
    title: meta.title,
    description: meta.description,
    images: [{ url: "/images/hero-blood-tube.jpg", width: 1920, height: 1200 }],
  },
  icons: { icon: "/brand/true-lab-results-logo.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#06110F",
  colorScheme: "dark light",
};

/*
 * Runs while the HTML parses, before first paint: with motion allowed, mark
 * <html> so the loader shows (CSS) and hold intros under it
 * (data-site-loading, which introsReady() and the loader release).
 */
const BEFORE_PAINT = `try{document.documentElement.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var d=document.documentElement;d.classList.add('motion');d.setAttribute('data-site-loading','')}}catch(e){}`;

/** LocalBusiness / MedicalBusiness structured data, from the content file. */
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": ["MedicalBusiness", "LocalBusiness"],
  name: business.legalName,
  alternateName: business.name,
  description: meta.description,
  url: meta.url,
  logo: `${meta.url}/brand/true-lab-results-logo.png`,
  image: `${meta.url}/images/hero-blood-tube.jpg`,
  telephone: "+1-470-302-7769",
  faxNumber: "+1-888-666-1770",
  email: business.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: business.street,
    addressLocality: business.city,
    addressRegion: business.region,
    postalCode: business.postalCode,
    addressCountry: "US",
  },
  areaServed: "South Georgia",
  openingHours: "By appointment",
  sameAs: business.social.map(s => s.href),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} ${plexMono.variable}`}
      // The before-paint script changes <html> before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BEFORE_PAINT }} />
      </head>
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes to <body> before React hydrates. */}
      <body suppressHydrationWarning>
        <a className="skip" href="#main">{ui.skip}</a>
        <SmoothScroll />
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
