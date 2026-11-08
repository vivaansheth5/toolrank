import { Archivo, Geist, Geist_Mono, Teko } from "next/font/google";

/**
 * Display: Archivo variable, width axis included (we sit at wdth 125).
 * next/font's automatic fallback is sized for the normal width, so it is off:
 * globals.css defines fallbacks sized for the expanded face instead.
 */
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
  adjustFontFallback: false,
});

export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

/** Devanagari signage only. Not preloaded: it downloads where it's used. */
export const teko = Teko({
  subsets: ["devanagari"],
  weight: ["500", "600"],
  variable: "--font-teko",
  display: "swap",
  preload: false,
});
