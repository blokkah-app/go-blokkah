import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LinkHub } from "@/components/LinkHub";
import { attribution, isChannel, storeUrl, type Query } from "@/lib/link-hub";
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
  return <LinkHub channel={channel} campaign={campaign} stores={{
    "app-store": storeUrl("app-store", campaign, process.env.APPLE_PROVIDER_TOKEN),
    "google-play": storeUrl("google-play", campaign),
  }} />;
}
