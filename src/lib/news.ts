import { XMLParser, XMLValidator } from "fast-xml-parser";

export const NEWS_FEED = "https://www.alwatan.com.sa/rssFeed/4";
export type NewsItem = { title: string; url: string; publishedAt: string; source: string };

export function parseNews(xml: string, now = Date.now()): NewsItem[] {
  if (xml.length > 1_000_000 || /<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true) {
    throw new Error("Invalid RSS response");
  }
  const parsed = new XMLParser({ ignoreAttributes: true, parseTagValue: false }).parse(xml);
  const items = parsed?.rss?.channel?.item;
  if (!items) return [];
  const seen = new Set<string>();
  return (Array.isArray(items) ? items : [items]).flatMap((item): NewsItem[] => {
    if (typeof item.title !== "string" || typeof item.link !== "string" || typeof item.pubDate !== "string") return [];
    const title = item.title.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    const published = Date.parse(item.pubDate);
    if (!title || title.length > 240 || !/عقار|إسكان|اسكان|سكن|إيجار|ايجار|أراضي|الأراضي|تمويل عقاري/.test(title)) return [];
    if (!Number.isFinite(published) || published > now + 3_600_000 || now - published > 30 * 86400_000) return [];
    try {
      const url = new URL(item.link.trim());
      if (url.protocol !== "https:" || url.hostname !== "www.alwatan.com.sa" || !/^\/article\/\d+$/.test(url.pathname) || url.username || url.password) return [];
      url.search = "";
      url.hash = "";
      if (seen.has(url.href)) return [];
      seen.add(url.href);
      return [{ title, url: url.href, publishedAt: new Date(published).toISOString(), source: "الوطن" }];
    } catch { return []; }
  }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 8);
}
