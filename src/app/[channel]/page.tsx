import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LinkHub } from "@/components/LinkHub";
import { ShortRedirect } from "@/components/ShortRedirect";
import { attribution, isChannel, shortLinkDestinations, storeUrl, type Query } from "@/lib/link-hub";
export const metadata: Metadata = {
  title: "حمّل تطبيق بلوكه | العقار وأكثر",
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};
export default async function ChannelPage({ params, searchParams }: {
  params: Promise<{ channel: string }>; searchParams: Promise<Query>;
}) {
  const { channel } = await params;
  if (!isChannel(channel)) notFound();
  const campaign = attribution(channel, await searchParams);
  const destination = shortLinkDestinations[channel as keyof typeof shortLinkDestinations];
  if (destination) {
    const url = channel === "google-play"
      ? storeUrl("google-play", campaign)
      : channel === "app-store" || channel === "apple-store"
        ? storeUrl("app-store", campaign, process.env.APPLE_PROVIDER_TOKEN)
        : destination;
    const name = channel === "apple-store" || channel === "app-store" ? "App Store"
      : channel === "google-play" ? "Google Play"
        : channel === "website" ? "موقع بلوكه" : channel;
    return <ShortRedirect destination={name} url={url} campaign={campaign}
      eventName={channel === "app-store" || channel === "apple-store" || channel === "google-play" ? "store_click" : "outbound_redirect"} />;
  }
  return <LinkHub channel={channel} campaign={campaign} stores={{
    "app-store": storeUrl("app-store", campaign, process.env.APPLE_PROVIDER_TOKEN),
    "google-play": storeUrl("google-play", campaign),
  }} />;
}
