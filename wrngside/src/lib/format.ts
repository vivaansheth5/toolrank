import { site } from "./site-config";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** ₹1,899 · ₹1,29,999 */
export const formatPrice = (amount: number | string) => inr.format(typeof amount === "string" ? Number(amount) : amount);

const tz = site.timeZone;

const timeFmt = new Intl.DateTimeFormat("en-IN", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: true });
const weekdayFmt = new Intl.DateTimeFormat("en-IN", { timeZone: tz, weekday: "short" });
const hourFmt = new Intl.DateTimeFormat("en-IN", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true });
const dayMonthFmt = new Intl.DateTimeFormat("en-IN", { timeZone: tz, weekday: "short", day: "numeric", month: "short" });
const longDateFmt = new Intl.DateTimeFormat("en-IN", { timeZone: tz, day: "numeric", month: "long", year: "numeric" });
const partsFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: tz,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  weekday: "short",
});

/** "02:14 AM" in IST. */
export function formatIstClock(date: Date) {
  return timeFmt.format(date).toUpperCase().replace(/\s+/g, " ");
}

/** "FRI 8PM IST" for a drop slot. */
export function formatDropSlot(iso: string) {
  const d = new Date(iso);
  const day = weekdayFmt.format(d).toUpperCase();
  const time = hourFmt
    .format(d)
    .toUpperCase()
    .replace(":00", "")
    .replace(/\s+/g, "");
  return `${day} ${time} ${site.timeZoneLabel}`;
}

/** "Fri, 8 Nov" */
export function formatShortDate(date: Date) {
  const parts = dayMonthFmt.formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("weekday")}, ${get("day")} ${get("month")}`;
}

/** "1 October 2026" */
export function formatLongDate(iso: string) {
  return longDateFmt.format(new Date(iso));
}

/** Calendar parts of a date as seen in IST. */
export function istParts(date: Date) {
  const parts = partsFmt.formatToParts(date);
  const n = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  return { year: n("year"), month: n("month"), day: n("day"), hour: n("hour") % 24, minute: n("minute"), second: n("second"), weekday };
}

export function countdownParts(ms: number) {
  const clamped = Math.max(0, ms);
  const s = Math.floor(clamped / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: clamped <= 0,
  };
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

export const fill = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
