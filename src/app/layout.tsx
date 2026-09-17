import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const SITE_NAME = "ToolDhundho.com";
const SITE_DESCRIPTION =
  "Stop searching. Find the right AI tool or software for exactly what you're trying to accomplish — browse categories, compare tools and get personalized recommendations.";

export const metadata: Metadata = {
  metadataBase: new URL("https://tooldhundho.com"),
  title: {
    default: `${SITE_NAME} — Stop searching. Find the right tool.`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} — Stop searching. Find the right tool.`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Stop searching. Find the right tool.`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
