"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_CURRENCY, isCurrencyCode, type CurrencyCode } from "@/lib/currency";

const COOKIE_NAME = "td_currency";
const STORAGE_KEY = "td_currency";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

/** Cookie first (the same source Proxy seeds from country detection),
 *  localStorage as a fallback for environments that block cookies. */
function readStoredCurrency(): CurrencyCode | undefined {
  const fromCookie = readCookie(COOKIE_NAME);
  if (isCurrencyCode(fromCookie)) return fromCookie;
  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (isCurrencyCode(fromStorage)) return fromStorage;
  } catch {
    // localStorage unavailable (private mode, disabled) — fall through.
  }
  return undefined;
}

/**
 * Currency is a client-side presentation preference (per the localization
 * spec: "currency switching should generally be a client-side presentation
 * preference" so it never forces every page into dynamic SSR or multiplies
 * SEO'd URLs). Initial render always uses DEFAULT_CURRENCY ("USD") so
 * server- and client-rendered HTML match on hydration; the effect below
 * then syncs to whatever Proxy (country detection) or a previous manual
 * pick already stored, which happens fast enough that it's rarely visible.
 * A manual pick always overrides — it just writes over the same
 * cookie/localStorage keys, and Proxy only ever seeds the cookie when it's
 * completely absent, so it can never clobber a manual choice on a later
 * visit.
 */
export default function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    const stored = readStoredCurrency();
    // Deliberate one-time sync from a browser-only source (cookie/
    // localStorage) that isn't available during the server render, so it
    // can't be a lazy useState initializer without causing a hydration
    // mismatch — this has to run post-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored && stored !== currency) setCurrencyState(stored);
    // Only ever runs once on mount — this intentionally does not depend on
    // `currency` so it doesn't re-read after every manual change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setCurrency(next: CurrencyCode) {
    setCurrencyState(next);
    writeCookie(COOKIE_NAME, next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable — the cookie write above still persists it.
    }
  }

  return <CurrencyContext.Provider value={{ currency, setCurrency }}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
