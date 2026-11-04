import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./shell.css";
import { archivo, geist, geistMono, teko } from "./fonts";
import { site, seo } from "@/lib/site-config";
import { InlineScript } from "@/components/ui/InlineScript";
import { AppShell } from "@/components/shell/AppShell";
import { Header } from "@/components/shell/Header";
import { Ticker } from "@/components/shell/Ticker";
import { Footer } from "@/components/shell/Footer";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    url: "/",
    title: site.title,
    description: site.description,
    images: [{ url: seo.defaultOgImage, width: 1200, height: 630, alt: "THE LINE: the WRNGSIDE drop hanging on power cables at night" }],
  },
  twitter: {
    card: "summary_large_image",
    site: seo.twitterHandle,
    title: site.title,
    description: site.description,
    images: [seo.defaultOgImage],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: site.themeColor.night,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before first paint: JS flag, remembered ticker dismissal, reduced motion.
const boot = `(function(){var d=document.documentElement;d.classList.add('js');try{var p=JSON.parse(localStorage.getItem('wrng:prefs:v1')||'{}');if(p&&p.tickerDismissed)d.setAttribute('data-ticker','off');}catch(e){}try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('reduced');if(matchMedia('(hover: hover) and (pointer: fine)').matches)d.classList.add('fine');}catch(e){}})();`;

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: `${site.url}/icon.svg`,
  sameAs: ["https://instagram.com/wrngside"],
  address: { "@type": "PostalAddress", addressLocality: "New Delhi", addressCountry: "IN" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${archivo.variable} ${geist.variable} ${geistMono.variable} ${teko.variable}`} suppressHydrationWarning>
      <head>
        <InlineScript html={boot} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AppShell>
          <Ticker />
          <Header />
          {children}
          <Footer />
        </AppShell>
        <div className="grain" aria-hidden="true" />
        <JsonLd data={organization} />
      </body>
    </html>
  );
}
