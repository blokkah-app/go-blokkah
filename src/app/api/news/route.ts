import { NEWS_FEED, parseNews } from "@/lib/news";

export async function GET() {
  try {
    const response = await fetch(NEWS_FEED, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!response.ok) throw new Error("RSS unavailable");
    const items = parseNews(await response.text());
    return Response.json({ items, status: items.length ? "ok" : "empty" }, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=900" },
    });
  } catch {
    return Response.json({ items: [], status: "unavailable" }, {
      status: 503, headers: { "Cache-Control": "no-store" },
    });
  }
}
