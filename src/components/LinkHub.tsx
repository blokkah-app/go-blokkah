"use client";

import Image from "next/image";
import Script from "next/script";
import { NewsTicker } from "@/components/NewsTicker";
import { useEffect, useState } from "react";
import { ArrowUpLeft, ArrowLeft, Check, Copy, Globe2, Smartphone, Ghost, Play, Share2 } from "lucide-react";
import { IconInstagram, IconLinkedIn, IconYouTube, IconX, IconFacebook, IconApple } from "@/components/BrandIcons";
import { detectStore, socialLinks, type Attribution, type Channel, type Store } from "@/lib/link-hub";
import { initAnalytics, measurementId, track, trackedNavigate } from "@/lib/hub-analytics";

const icons = { snapchat: Ghost, instagram: IconInstagram, linkedin: IconLinkedIn, facebook: IconFacebook, youtube: IconYouTube, x: IconX };

export function LinkHub({ channel = "hub", campaign, stores }: {
  channel?: Channel | "hub"; campaign: Attribution; stores: Record<Store, string>;
}) {
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyFallback, setCopyFallback] = useState(false);

  useEffect(() => {
    let cancel: (() => void) | undefined;
    // Defer so React development remounts don't double-count visits.
    const timer = window.setTimeout(() => {
      initAnalytics(campaign);
      if (channel === "hub") return;
      const store = channel === "app-store" || channel === "google-play"
        ? channel : detectStore(navigator.userAgent, navigator.maxTouchPoints);
      if (store) {
        setNotice(`جاري فتح ${store === "app-store" ? "App Store" : "Google Play"}… إذا لم يفتح، اختر المتجر أدناه.`);
        cancel = trackedNavigate(stores[store], campaign, store, true);
      } else setNotice("حمّل بلوكه على جوالك. اختر أحد المتجرين لتحميل التطبيق.");
    }, 50);
    return () => { window.clearTimeout(timer); cancel?.(); };
  }, [channel, campaign, stores]);

  async function share() {
    const url = "https://go.blokkah.app";
    try {
      if (navigator.share) {
        await navigator.share({ title: "بلوكه | العقار وأكثر", url });
        track("share", campaign, { method: "native" });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        track("share", campaign, { method: "copy" });
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setCopyFallback(true);
    }
  }

  return (
    <div className="hub-shell">
      {measurementId && <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />}
      <a className="hub-skip" href="#main">انتقل إلى المحتوى</a>
      <header className="hub-header">
        <a href="/" aria-label="بلوكه، الرئيسية" className="hub-wordmark"><Image src="/brand/logo/darkLogoSquare.svg" alt="بلوكه" width={110} height={110} priority /></a>
        <span className="hub-header-note">العقار بشكل مختلف</span>
        <button className="hub-share" onClick={share} aria-label="مشاركة رابط بلوكه">{copied ? <Check size={17} /> : <Share2 size={17} />}<span>{copied ? "تم النسخ" : "شارك بلوكه"}</span></button>
      </header>
      <NewsTicker />
      <main id="main" className="hub-main">
        <section className="hub-intro">
          <span className="hub-eyebrow">وجهتك للعقار تبدأ هنا</span>
          <h1>خطوتك الجاية،<br /><span>تبدأ من بلوكه.</span></h1>
          <p>عقارك القادم، وجديدنا، وكل طرق التواصل معنا.<br className="desktop-break" /> اختر وجهتك… وخلّنا نقرّب لك المسافة.</p>
        </section>
        <section className="hub-download" aria-labelledby="download-title">
          <div className="hub-download-copy">
            <span className="hub-kicker"><Smartphone size={16} /> تطبيق بلوكه</span>
            <h2 id="download-title">عالم العقار.<br />أقرب لك.</h2>
            <p>ابحث عن عقارك التالي بسهولة.<br />خذ بلوكه معك، وين ما كنت.</p>
            <div className="hub-store-buttons">
              {(["app-store", "google-play"] as const).map(store => <a key={store} href={stores[store]} onClick={event => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                  track("store_click", campaign, { destination: store, navigation_type: "manual" });
                  return;
                }
                event.preventDefault();
                trackedNavigate(stores[store], campaign, store, false);
              }} className="hub-store" aria-label={`تحميل بلوكه من ${store === "app-store" ? "App Store" : "Google Play"}`}>
                {store === "app-store" ? <IconApple width={25} height={25} /> : <Play size={23} fill="currentColor" />}
                <span><small>حمّله الآن من</small><strong dir="ltr">{store === "app-store" ? "App Store" : "Google Play"}</strong></span>
              </a>)}
            </div>
            <span className="hub-download-note">متاح لأجهزة iPhone وAndroid</span>
          </div>
          <div className="hub-visual" aria-hidden="true">
            <div className="hub-orbit orbit-one" /><div className="hub-orbit orbit-two" />
            <div className="hub-photo"><Image src="/brand/photos/minimalRealEstatePhoto2.jpg" alt="" fill sizes="(max-width: 600px) 200px, 320px" /></div>
            <div className="hub-app-icon"><Image src="/brand/logo/whiteLogoSquare.svg" alt="" width={100} height={100} /></div>
            <div className="hub-visual-caption"><span className="hub-mini-dot" /> عقار وأكثر <ArrowUpLeft size={15} /></div>
          </div>
        </section>
        {notice && <p className="hub-notice" role="status">{notice} <a href="/">العودة لكل الروابط</a></p>}
        <noscript><p className="hub-notice">اختر متجر جهازك من الروابط أعلاه لتحميل التطبيق.</p></noscript>
        <a className="hub-website" href="https://www.blokkah.app/" onClick={() => track("outbound_click", campaign, { destination: "website" })}>
          <span className="hub-website-icon"><Globe2 size={25} /></span>
          <span><strong>عقارك القادم يستناك</strong><small>تصفّح موقع بلوكه واكتشف وجهتك التالية</small></span>
          <span className="hub-website-domain" dir="ltr">blokkah.app</span><ArrowUpLeft size={22} />
        </a>
        <section className="hub-social" aria-labelledby="social-title">
          <div className="hub-section-heading"><div><span className="hub-kicker">خلّنا على تواصل</span><h2 id="social-title">بلوكه، وين ما تكون.</h2></div><span className="hub-section-note">تابعنا على منصتك المفضلة <ArrowLeft size={16} /></span></div>
          <div className="hub-social-grid">
            {socialLinks.map(link => {
              const Icon = icons[link.id];
              return <a className="hub-social-card" key={link.id} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${link.name} — ${link.handle} (يفتح في نافذة جديدة)`} onClick={() => track("social_click", campaign, { destination: link.id, link_url: link.href })}>
                <span className="hub-social-icon" style={{ background: link.color }}><Icon width={24} height={24} /></span>
                <span className="hub-social-text"><strong dir="ltr">{link.name}</strong><span>{link.description}</span></span>
                <ArrowUpLeft size={19} className="hub-card-arrow" />
              </a>;
            })}
          </div>
        </section>
        <div className="hub-endnote"><span /> المسافة بينك وبين بلوكه… رابط.<span /></div>
      </main>
      <footer className="hub-footer"><span>© {new Date().getFullYear()} بلوكه. جميع الحقوق محفوظة.</span><a href="https://www.blokkah.app/" dir="ltr">BLOKKAH <ArrowUpLeft size={13} /></a></footer>
      {copyFallback && <div className="hub-copy-fallback" role="status"><Copy size={16} /><span>انسخ الرابط:</span><input aria-label="رابط المشاركة" readOnly value="https://go.blokkah.app" onFocus={e => e.target.select()} /><button onClick={() => setCopyFallback(false)}>إغلاق</button></div>}
    </div>
  );
}
