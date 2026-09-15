import type { CtaDestinationType, CtaPlacement } from "@/data/types";

export interface OutboundClickEvent {
  toolId: string;
  toolName: string;
  placement: CtaPlacement;
  destinationType: CtaDestinationType;
  destinationUrl: string;
  timestamp: string;
}

type AnalyticsSink = (event: OutboundClickEvent) => void;

const STORAGE_KEY = "toolora_outbound_clicks";
const MAX_STORED_EVENTS = 200;

/**
 * Default sink: logs in development and keeps a rolling client-side buffer
 * in localStorage. This is intentionally NOT a third-party analytics
 * integration — it exists so the funnel is observable today without one.
 */
function localSink(event: OutboundClickEvent) {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV !== "production") {
    console.info("[toolora:outbound-click]", event);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const existing: OutboundClickEvent[] = raw ? JSON.parse(raw) : [];
    existing.push(event);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(existing.slice(-MAX_STORED_EVENTS))
    );
  } catch {
    // Storage can fail (private browsing, quota). Analytics must never
    // break the click it's trying to record.
  }
}

const sinks: AnalyticsSink[] = [localSink];

/**
 * Plug in a real analytics provider (GA, Plausible, PostHog, a server
 * endpoint, ...) later by registering an additional sink here — no call
 * site that uses trackOutboundClick needs to change.
 */
export function registerAnalyticsSink(sink: AnalyticsSink): void {
  sinks.push(sink);
}

/**
 * The single funnel event every monetization CTA in the app must fire
 * before navigating: SEARCH/FIND MY TOOL → DISCOVER → COMPARE →
 * BEST OFFERS → GET OFFER/VISIT → this event.
 */
export function trackOutboundClick(event: Omit<OutboundClickEvent, "timestamp">): void {
  const fullEvent: OutboundClickEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  for (const sink of sinks) {
    try {
      sink(fullEvent);
    } catch {
      // One misbehaving sink must not block the others or the navigation.
    }
  }
}
