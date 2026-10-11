import test from "node:test";
import assert from "node:assert/strict";
import { parseNews } from "../src/lib/news.ts";

const now = Date.parse("2026-10-11T12:00:00Z");
const item = (title, link = "https://www.alwatan.com.sa/article/123", date = "Sat, 10 Oct 2026 19:01:00 +0300") => `<item><title><![CDATA[${title}]]></title><link>${link}</link><pubDate>${date}</pubDate></item>`;
const feed = items => `<rss><channel>${items}</channel></rss>`;
test("RSS selects current property headlines, strips markup, and deduplicates", () => {
  const result = parseNews(feed(item("<b>السوق العقاري</b>") + item("السوق العقاري") + item("أخبار الرياضة", "https://www.alwatan.com.sa/article/124")), now);
  assert.equal(result.length, 1);
  assert.equal(result[0].title, "السوق العقاري");
  assert.equal(result[0].source, "الوطن");
});
test("RSS rejects untrusted destinations, stale dates and future dates", () => {
  for (const link of ["javascript:alert(1)", "https://evil.example/article/1", "https://www.alwatan.com.sa.evil.example/article/1"]) {
    assert.deepEqual(parseNews(feed(item("عقارات", link)), now), []);
  }
  for (const date of ["invalid", "2020-01-01", "2030-01-01"]) assert.deepEqual(parseNews(feed(item("عقارات", undefined, date)), now), []);
});
test("RSS handles empty feeds and rejects malformed or entity-bearing XML", () => {
  assert.deepEqual(parseNews(feed(""), now), []);
  assert.throws(() => parseNews("<rss>"));
  assert.throws(() => parseNews('<!DOCTYPE rss [<!ENTITY x "bad">]><rss/>'));
});
