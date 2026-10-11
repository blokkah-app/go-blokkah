"use client";

import Image from "next/image";
import Script from "next/script";
import { useEffect } from "react";
import { ArrowUpLeft } from "lucide-react";
import type { Attribution } from "@/lib/link-hub";
import { initAnalytics, measurementId, trackedNavigate } from "@/lib/hub-analytics";

export function ShortRedirect({ destination, url, campaign, eventName }: {
  destination: string; url: string; campaign: Attribution; eventName: string;
}) {
  useEffect(() => {
    let cancel: (() => void) | undefined;
    const timer = window.setTimeout(() => {
      initAnalytics(campaign);
      cancel = trackedNavigate(url, campaign, destination, true, eventName);
    }, 30);
    return () => { window.clearTimeout(timer); cancel?.(); };
  }, [campaign, destination, eventName, url]);

  return <main className="hub-redirect">
    {measurementId && <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />}
    <Image src="/brand/logo/darkLogoSquare.svg" alt="بلوكه" width={92} height={92} priority />
    <p role="status">جاري تحويلك إلى {destination}…</p>
    <a href={url}>إذا ما تم التحويل، اضغط هنا <ArrowUpLeft size={16} /></a>
  </main>;
}
