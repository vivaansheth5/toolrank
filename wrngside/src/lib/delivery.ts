import { commerce } from "./site-config";
import { istParts } from "./format";

export type PincodeResult =
  | { ok: true; pin: string; deliveryBy: Date; cod: boolean; metro: boolean; days: [number, number] }
  | { ok: false; pin: string; reason: "invalid" | "noservice" };

/** First digit 1–8 (9 is the Army Postal Service), six digits. */
export const isPincode = (pin: string) => /^[1-8]\d{5}$/.test(pin);

/** Mocked serviceability. Swap for your courier's API (Shiprocket, Delhivery…). */
export function checkPincode(pin: string, now = new Date()): PincodeResult {
  const p = pin.replace(/\D/g, "");
  if (!isPincode(p)) return { ok: false, pin: p, reason: "invalid" };
  if (commerce.nonServiceablePrefixes.some((x) => p.startsWith(x))) return { ok: false, pin: p, reason: "noservice" };
  const metro = commerce.metroPincodePrefixes.some((x) => p.startsWith(x));
  const days = metro ? commerce.deliveryDays.metro : commerce.deliveryDays.rest;
  const cod = commerce.codAvailable && !commerce.codBlockedPrefixes.some((x) => p.startsWith(x));
  return { ok: true, pin: p, deliveryBy: addWorkingDays(now, days[1]), cod, metro, days };
}

/** Dispatch today before the IST cutoff (not Sundays), then count working days. */
export function addWorkingDays(now: Date, n: number) {
  const ist = istParts(now);
  const d = new Date(now.getTime());
  let dispatchOffset = ist.hour >= commerce.dispatchCutoffHourIST || ist.weekday === "Sun" ? 1 : 0;
  // Move to the dispatch day.
  d.setTime(d.getTime() + dispatchOffset * 86400000);
  dispatchOffset = 0;
  let added = 0;
  while (added < n) {
    d.setTime(d.getTime() + 86400000);
    if (istParts(d).weekday !== "Sun") added++;
  }
  return d;
}

const STATES: [string, string][] = [
  ["11", "Delhi"],
  ["12", "Haryana"],
  ["13", "Haryana"],
  ["14", "Punjab"],
  ["15", "Punjab"],
  ["16", "Chandigarh"],
  ["17", "Himachal Pradesh"],
  ["18", "Jammu & Kashmir"],
  ["19", "Jammu & Kashmir"],
  ["20", "Uttar Pradesh"],
  ["21", "Uttar Pradesh"],
  ["22", "Uttar Pradesh"],
  ["23", "Uttar Pradesh"],
  ["24", "Uttarakhand"],
  ["25", "Uttar Pradesh"],
  ["26", "Uttarakhand"],
  ["27", "Uttar Pradesh"],
  ["28", "Uttar Pradesh"],
  ["30", "Rajasthan"],
  ["31", "Rajasthan"],
  ["32", "Rajasthan"],
  ["33", "Rajasthan"],
  ["34", "Rajasthan"],
  ["36", "Gujarat"],
  ["37", "Gujarat"],
  ["38", "Gujarat"],
  ["39", "Gujarat"],
  ["40", "Maharashtra"],
  ["41", "Maharashtra"],
  ["42", "Maharashtra"],
  ["43", "Maharashtra"],
  ["44", "Maharashtra"],
  ["45", "Madhya Pradesh"],
  ["46", "Madhya Pradesh"],
  ["47", "Madhya Pradesh"],
  ["48", "Madhya Pradesh"],
  ["49", "Chhattisgarh"],
  ["50", "Telangana"],
  ["51", "Andhra Pradesh"],
  ["52", "Andhra Pradesh"],
  ["53", "Andhra Pradesh"],
  ["56", "Karnataka"],
  ["57", "Karnataka"],
  ["58", "Karnataka"],
  ["59", "Karnataka"],
  ["60", "Tamil Nadu"],
  ["61", "Tamil Nadu"],
  ["62", "Tamil Nadu"],
  ["63", "Tamil Nadu"],
  ["64", "Tamil Nadu"],
  ["67", "Kerala"],
  ["68", "Kerala"],
  ["69", "Kerala"],
  ["70", "West Bengal"],
  ["71", "West Bengal"],
  ["72", "West Bengal"],
  ["73", "West Bengal"],
  ["74", "West Bengal"],
  ["75", "Odisha"],
  ["76", "Odisha"],
  ["77", "Odisha"],
  ["78", "Assam"],
  ["79", "North East"],
  ["80", "Bihar"],
  ["81", "Bihar"],
  ["82", "Jharkhand"],
  ["83", "Jharkhand"],
  ["84", "Bihar"],
  ["85", "Bihar"],
];

const CITIES: [string, string][] = [
  ["110", "New Delhi"],
  ["400", "Mumbai"],
  ["560", "Bengaluru"],
  ["600", "Chennai"],
  ["700", "Kolkata"],
  ["500", "Hyderabad"],
  ["411", "Pune"],
  ["380", "Ahmedabad"],
  ["122", "Gurugram"],
  ["201", "Noida"],
  ["302", "Jaipur"],
  ["226", "Lucknow"],
  ["160", "Chandigarh"],
];

/** Best-guess city/state from a pincode (mock autofill). */
export function lookupPincode(pin: string) {
  const state = STATES.find(([p]) => pin.startsWith(p))?.[1] ?? "";
  const city = CITIES.find(([p]) => pin.startsWith(p))?.[1] ?? "";
  return { city, state };
}
