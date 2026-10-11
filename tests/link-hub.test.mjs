import test from "node:test";
import assert from "node:assert/strict";
import { attribution, detectStore, storeUrl, isChannel, channels } from "../src/lib/link-hub.ts";

test("all requested channel routes are allowed; arbitrary redirects are not", () => {
  assert.equal(channels.length, 9);
  for (const channel of channels) assert.equal(isChannel(channel), true);
  for (const path of ["unknown", "https://evil.example", "__proto__", "constructor"]) assert.equal(isChannel(path), false);
});
test("device detection handles phones, desktop-mode iPad, desktops and crawlers", () => {
  assert.equal(detectStore("Mozilla iPhone OS 18"), "app-store");
  assert.equal(detectStore("Mozilla iPad"), "app-store");
  assert.equal(detectStore("Mozilla Macintosh", 5), "app-store");
  assert.equal(detectStore("Mozilla Android 15"), "google-play");
  for (const ua of ["Mozilla Windows NT", "Mozilla Macintosh", "Googlebot Android", "facebookexternalhit iPhone", ""]) assert.equal(detectStore(ua), null);
});
test("campaign overrides preserve the original link channel", () => {
  const campaign = attribution("instagram", { utm_source: "partner", utm_medium: "paid_social", utm_campaign: "launch", utm_content: "video_01" });
  assert.equal(campaign.link_channel, "instagram");
  assert.equal(campaign.utm_source, "partner");
  assert.equal(campaign.utm_content, "video_01");
  assert.equal(attribution("download", {}).utm_medium, "qr");
});
test("empty, duplicate and oversized campaign parameters are handled", () => {
  const campaign = attribution("x", { utm_source: ["a", "b"], utm_campaign: " ", utm_content: "a".repeat(200) });
  assert.equal(campaign.utm_source, "x");
  assert.equal(campaign.utm_campaign, "app_download");
  assert.equal(campaign.utm_content.length, 100);
});
test("Play referrer round-trips Arabic and special characters without changing destination", () => {
  const campaign = attribution("snapchat", { utm_campaign: "عقار & أكثر", utm_content: "video=1", redirect: "https://evil.example" });
  const url = new URL(storeUrl("google-play", campaign));
  assert.equal(url.hostname, "play.google.com");
  assert.equal(url.searchParams.get("id"), "com.blokkahco.blokkah");
  const referrer = new URLSearchParams(url.searchParams.get("referrer"));
  assert.equal(referrer.get("utm_campaign"), "عقار & أكثر");
  assert.equal(referrer.get("utm_content"), "video=1");
  assert.equal(referrer.has("redirect"), false);
});
test("Apple campaign includes source, bounded token, and optional provider", () => {
  const url = new URL(storeUrl("app-store", attribution("facebook", { utm_campaign: "a".repeat(100) }), "12345"));
  assert.equal(url.hostname, "apps.apple.com");
  assert.equal(url.searchParams.get("ct").length, 30);
  assert.match(url.searchParams.get("ct"), /^facebook_/);
  assert.equal(url.searchParams.get("pt"), "12345");
});

process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
const analytics = await import("../src/lib/hub-analytics.ts");
function browser() {
  const callbacks = new Map();
  const navigations = [];
  let id = 0;
  globalThis.window = {
    location: { pathname: "/instagram", origin: "https://go.blokkah.app", assign: url => navigations.push(url), replace: url => navigations.push(url) },
    setTimeout: callback => { callbacks.set(++id, callback); return id; },
    clearTimeout: key => callbacks.delete(key),
  };
  globalThis.document = { referrer: "https://example.com/private?email=secret" };
  return { callbacks, navigations };
}
test("GA sends one page view plus channel visit with sanitized location/referrer", () => {
  browser();
  analytics.initAnalytics(attribution("instagram", { email: "secret" }));
  const commands = window.dataLayer.map(args => Array.from(args));
  const config = commands.find(args => args[0] === "config")[2];
  assert.equal(config.send_page_view, false);
  assert.equal(config.page_referrer, "https://example.com");
  assert.equal(config.page_location.includes("secret"), false);
  assert.equal(commands.filter(args => args[1] === "page_view").length, 1);
  assert.equal(commands.filter(args => args[1] === "link_visit").length, 1);
});
test("blocked analytics still navigates; callback and timeout cannot navigate twice", () => {
  const { callbacks, navigations } = browser();
  let event;
  window.gtag = (...args) => { event = args; };
  analytics.trackedNavigate("https://apps.apple.com/", attribution("x", {}), "app-store", true);
  assert.equal(event[1], "store_click");
  assert.equal(event[2].navigation_type, "automatic");
  for (const callback of callbacks.values()) callback();
  event[2].event_callback();
  assert.equal(navigations.length, 1);
});
test("unmount cancels a pending automatic navigation", () => {
  const { callbacks, navigations } = browser();
  const cancel = analytics.trackedNavigate("https://apps.apple.com/", attribution("x", {}), "app-store", true);
  cancel();
  for (const callback of callbacks.values()) callback();
  assert.equal(navigations.length, 0);
});
