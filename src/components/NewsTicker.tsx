"use client";

import { useEffect, useState } from "react";
import { Newspaper, Pause, Play } from "lucide-react";
import type { NewsItem } from "@/lib/news";

export function NewsTicker() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [status, setStatus] = useState("loading");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let active = true;
    let controller: AbortController;
    async function refresh() {
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch("/api/news", { signal: controller.signal });
        if (!response.ok) throw new Error("Unavailable");
        const data = await response.json();
        if (active) { setItems(data.items); setStatus(data.status); }
      } catch {
        if (active) { setItems([]); setStatus("unavailable"); }
      }
    }
    void refresh();
    const interval = window.setInterval(refresh, 15 * 60 * 1000);
    return () => { active = false; controller?.abort(); window.clearInterval(interval); };
  }, []);

  const renderItems = (duplicate: boolean) => <div className="hub-news-group" aria-hidden={duplicate || undefined}>
    {items.map(item => <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer" tabIndex={duplicate ? -1 : 0}>
      <span>{item.title}</span>
      <small>{item.source} · <time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString("ar-SA", { day: "numeric", month: "short", calendar: "gregory", timeZone: "Asia/Riyadh" })}</time></small>
    </a>)}
  </div>;

  return <aside className={`hub-news${paused ? " is-paused" : ""}`} aria-label="أخبار العقار السعودي">
    <div className="hub-news-label"><Newspaper size={16} /><span>أخبار العقار</span></div>
    {items.length ? <>
      <div className="hub-news-window"><div className="hub-news-track" style={{ animationDuration: `${Math.max(35, items.reduce((sum, item) => sum + item.title.length, 0) / 5)}s` }}>
        {renderItems(false)}{renderItems(true)}
      </div></div>
      <button className="hub-news-toggle" onClick={() => setPaused(!paused)} aria-label={paused ? "تشغيل شريط الأخبار" : "إيقاف شريط الأخبار"} aria-pressed={paused}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>
    </> : <p className="hub-news-status" role="status">{status === "loading" ? "نجهّز لك آخر أخبار العقار…" : status === "empty" ? "لا توجد عناوين عقارية حديثة حاليًا." : "الأخبار غير متاحة الآن."} {status !== "loading" && <a href="https://www.alwatan.com.sa/" target="_blank" rel="noopener noreferrer">تابع المصدر</a>}</p>}
  </aside>;
}
