import { LinkHub } from "@/components/LinkHub";
import { attribution, storeUrl, type Query } from "@/lib/link-hub";

export default async function Home({ searchParams }: { searchParams: Promise<Query> }) {
  const campaign = attribution("hub", await searchParams);
  return <LinkHub campaign={campaign} stores={{
    "app-store": storeUrl("app-store", campaign, process.env.APPLE_PROVIDER_TOKEN),
    "google-play": storeUrl("google-play", campaign),
  }} />;
}
