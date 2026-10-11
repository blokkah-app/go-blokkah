import type { Attribution } from "./link-hub";
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
// Measurement IDs are public. Keep the supplied property active in every deployment;
// an explicit environment override (including an empty value) remains supported.
const configuredMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-NNCWK2Y8FG";
export const measurementId = /^G-[A-Z0-9]+$/.test(configuredMeasurementId)
  ? configuredMeasurementId : "";
export function initAnalytics(campaign: Attribution) {
  if (!measurementId) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer!.push(arguments); };
  window.gtag("js", new Date());
  // Send allowed campaign fields only, never arbitrary query strings.
  const location = new URL(window.location.pathname, window.location.origin);
  for (const [key, val] of Object.entries(campaign)) {
    if (key.startsWith("utm_") && val) location.searchParams.set(key, val);
  }
  let referrer = "";
  try { referrer = document.referrer ? new URL(document.referrer).origin : ""; } catch { /* malformed referrer */ }
  window.gtag("config", measurementId, {
    send_page_view: false, page_location: location.toString(), page_referrer: referrer,
    campaign_source: campaign.utm_source, campaign_medium: campaign.utm_medium,
    campaign_name: campaign.utm_campaign, campaign_content: campaign.utm_content, campaign_term: campaign.utm_term,
  });
  track("page_view", campaign);
  track("link_visit", campaign);
}
export function track(event: string, campaign: Attribution, params: Record<string, unknown> = {}) {
  if (measurementId && window.gtag) window.gtag("event", event, { ...campaign, ...params });
}
// Navigation still works when Analytics is blocked, offline, or slow.
export function trackedNavigate(url: string, campaign: Attribution, store: string, automatic: boolean) {
  let done = false;
  const navigate = () => {
    if (done) return;
    done = true;
    if (automatic) window.location.replace(url);
    else window.location.assign(url);
  };
  const timeout = window.setTimeout(navigate, measurementId ? 1200 : 80);
  track("store_click", campaign, {
    destination: store, link_url: url, navigation_type: automatic ? "automatic" : "manual",
    event_callback: navigate, event_timeout: 1000,
  });
  return () => { done = true; window.clearTimeout(timeout); };
}
