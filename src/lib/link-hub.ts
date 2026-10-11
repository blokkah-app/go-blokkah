export const channels = ["snapchat", "instagram", "x", "linkedin", "facebook", "youtube", "app-store", "google-play", "download"] as const;
export type Channel = (typeof channels)[number];
export type Store = "app-store" | "google-play";
export type Query = Record<string, string | string[] | undefined>;
export const destinations = {
  "app-store": "https://apps.apple.com/us/app/id6740733193",
  "google-play": "https://play.google.com/store/apps/details?id=com.blokkahco.blokkah",
};
export const socialLinks = [
  { id: "snapchat", name: "Snapchat", handle: "@UseBlokkah", description: "يوميات بلوكه، من قريب", href: "https://www.snapchat.com/add/UseBlokkah", color: "#fff5a7" },
  { id: "instagram", name: "Instagram", handle: "@blokkah", description: "العقار من زاوية ثانية", href: "https://www.instagram.com/blokkah/", color: "#fbe6ee" },
  { id: "x", name: "X", handle: "@useblokkah", description: "أخبارنا وحديث العقار", href: "https://x.com/blokkahapp", color: "#e9edf1" },
  { id: "linkedin", name: "LinkedIn", handle: "Blokkah App", description: "أعمالنا وشراكاتنا وجديدنا", href: "https://www.linkedin.com/company/blokkah-app/", color: "#e1effa" },
  { id: "facebook", name: "Facebook", handle: "@BlokkahApp", description: "خلك قريب من مجتمع بلوكه", href: "https://www.facebook.com/BlokkahApp/", color: "#e7edff" },
  { id: "youtube", name: "YouTube", handle: "@blokkah", description: "شاهد أكثر، واعرف أكثر", href: "https://www.youtube.com/@blokkah", color: "#ffe9e5" },
] as const;
export function isChannel(value: string): value is Channel {
  return channels.includes(value as Channel);
}
function value(query: Query, key: string, fallback = "") {
  const raw = query[key];
  return (typeof raw === "string" ? raw.trim() : "").slice(0, 100) || fallback;
}
export function attribution(channel: Channel | "hub", query: Query) {
  return {
    link_channel: channel,
    utm_source: value(query, "utm_source", channel === "hub" ? "direct" : channel),
    utm_medium: value(query, "utm_medium", channel === "hub" ? "none" : channel === "download" ? "qr" : "social"),
    utm_campaign: value(query, "utm_campaign", "app_download"),
    utm_content: value(query, "utm_content"),
    utm_term: value(query, "utm_term"),
  };
}
export type Attribution = ReturnType<typeof attribution>;
export function detectStore(userAgent: string, touchPoints = 0): Store | null {
  if (/bot|crawler|spider|facebookexternalhit|preview/i.test(userAgent)) return null;
  if (/android/i.test(userAgent)) return "google-play";
  if (/iPhone|iPad|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && touchPoints > 1)) return "app-store";
  return null;
}
export function storeUrl(store: Store, campaign: Attribution, appleProvider = "") {
  const url = new URL(destinations[store]);
  if (store === "google-play") {
    const referrer = new URLSearchParams();
    for (const [key, val] of Object.entries(campaign)) {
      if (key.startsWith("utm_") && val) referrer.set(key, val);
    }
    url.searchParams.set("referrer", referrer.toString());
  } else {
    url.searchParams.set("ct", `${campaign.utm_source}_${campaign.utm_campaign}`.slice(0, 30));
    url.searchParams.set("mt", "8");
    if (appleProvider) url.searchParams.set("pt", appleProvider);
  }
  return url.toString();
}
