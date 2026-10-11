# Blokkah link hub

Arabic, responsive Next.js link hub for `https://go.blokkah.app`.

## Run

Node 22.18+; `npm install`, optionally copy `.env.example` to `.env.local`, then `npm run dev`.
Development uses Webpack to avoid the observed Turbopack/PostCSS worker exhaustion on Windows. Production builds continue to use Next.js's default bundler.
`npm test` checks device routing, attribution, destination safety, and Analytics navigation fallback.
`npm run build` builds production; `npm start` serves it.

## Links for the marketing team

| Placement | Short URL |
| --- | --- |
| Main hub | https://go.blokkah.app/ |
| Snapchat | https://go.blokkah.app/snapchat |
| Instagram | https://go.blokkah.app/instagram |
| X | https://go.blokkah.app/x |
| LinkedIn | https://go.blokkah.app/linkedin |
| Facebook | https://go.blokkah.app/facebook |
| YouTube | https://go.blokkah.app/youtube |
| App Store directly | https://go.blokkah.app/apple-store |
| Google Play directly | https://go.blokkah.app/google-play |
| Main website directly | https://go.blokkah.app/website |
| QR / generic download | https://go.blokkah.app/download |

The homepage stays a hub. The short paths in this table immediately forward to the matching official social profile, store, or website and send a best-effort `outbound_redirect` / `store_click` event to GA4 first. `app-store` remains an alias for `apple-store`. When the browser has JavaScript disabled or Analytics cannot load, a working destination link is shown. The home-page social cards continue to open official profiles.

Example paid campaign:
`https://go.blokkah.app/instagram?utm_medium=paid_social&utm_campaign=launch_october&utm_content=reel_01`

Example print QR payload:
`https://go.blokkah.app/download?utm_source=brochure&utm_medium=qr&utm_campaign=launch_october`

Supported parameters: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`. Source defaults to the path, medium to `social` (`qr` for download), campaign to `app_download`. The immutable `link_channel` still identifies the path if source is overridden. Do not put personal information in campaign parameters. Unknown query fields are not passed to stores or included in the configured GA page location. Destinations are fixed in `src/lib/link-hub.ts`; visitors cannot inject a redirect destination.

## Activate Google Analytics 4

1. Create/select a GA4 property and a **Web** stream for `https://go.blokkah.app`.
2. The supplied property `G-NNCWK2Y8FG` is configured by default. To change it, set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...` in the hosting environment **before building**, then rebuild/deploy. An explicitly empty value disables Analytics. The existing tag sends one manual page view; do not paste a second copy of the Google snippet into the layout.
3. In the web stream's Enhanced Measurement settings, disable automatic page views based on browser history changes to avoid duplicating the explicit page views here. Do not also install a second GA/GTM page-view tag.
4. Register event-scoped custom dimensions for `link_channel`, `destination`, `navigation_type`, and any custom campaign parameters required for explorations. Standard acquisition dimensions use the configured campaign source/medium/name.
5. Use Realtime/DebugView or Tag Assistant to verify events from a real device. Mark `store_click` as a key event **only as a store handoff**, never as an install. Filter `navigation_type=manual` to compare deliberate clicks with automatic handoffs.

| Event | Meaning |
| --- | --- |
| `page_view` | Hub or channel page loaded |
| `link_visit` | Visit with link channel and UTM context |
| `store_click` | Manual or automatic navigation attempt to a store |
| `social_click` | Click on an official social profile |
| `outbound_click` | Click to the main website |
| `outbound_redirect` | Short social/website link redirect |
| `share` | Successful share / copy action |

Events are best-effort browser analytics. Ad blockers, disabled JS, network failure, or leaving too quickly can prevent measurement. Store navigation waits for the event callback with a maximum 1.2-second fallback; Analytics never blocks navigation indefinitely. Nothing on this website confirms a completed store load or an install.

## Actual installs and attribution: app work required

The mobile app source and Google account configuration are outside this repository.

- Add **Google Analytics for Firebase** to both apps and link their Firebase project to the same GA4 property. Verify `first_open` (first launch after installation/reinstallation, not a store download) and the actual in-app conversion events, e.g. registration.
- Android links carry URL-encoded UTM values in Google Play's `referrer`. Implement/verify **Google Play Install Referrer** handling in the app to associate campaign context with first launch and subsequent conversions; transmitting parameters alone does not complete attribution.
- iOS links carry Apple's `ct` campaign token. Set `APPLE_PROVIDER_TOKEN` to the provider token from App Store Connect for campaign reporting there. iOS does not provide a Google Play-style referrer, and this web redirect cannot reliably attach every organic install to a channel in Firebase. Use supported Apple campaign/ad attribution reporting or a separately selected attribution solution; do not claim deterministic cross-platform attribution from GA4 web events.
- Optionally link GA4/Firebase to BigQuery, then create Looker Studio reports for visits → store handoffs → verified app first opens/conversions. Keep app first opens separate from website handoffs and only join where supported attribution identifiers exist.
- Firebase Dynamic Links was shut down on August 25, 2025; this project does not depend on it.

References: [GA4 event parameters](https://developers.google.com/analytics/devguides/collection/ga4/event-parameters), [Firebase Analytics](https://firebase.google.com/docs/analytics/get-started), [Install Referrer](https://developer.android.com/google/play/installreferrer), [Apple campaign links](https://developer.apple.com/help/app-store-connect/view-app-analytics/manage-campaigns/), [Dynamic Links shutdown](https://firebase.google.com/support/dynamic-links-faq).

## News strip and motion

`/api/news` converts [Al Watan's free public RSS service](https://www.alwatan.com.sa/rss) (economy feed `/rssFeed/4`) into JSON, without an API key. It selects up to eight property/housing headlines published within 30 days, displays publication dates and publisher links, and refreshes every 15 minutes. This is publisher RSS, not a guaranteed-availability commercial API. Requests time out after eight seconds; failures and empty results show explicit UI states, never invented headlines. External links are restricted to HTTPS article URLs on the publisher's domain, with duplicates and malformed XML discarded.

The ticker pauses on hover and has a pause/resume button; keyboard users can scroll focused news links. Reduced-motion preferences disable scrolling and decorative animations. Hero entrance/drift animations finish within four seconds; the texture is a local static SVG.

## Deployment

Deploy this repository to a Node-compatible Next.js host (for example, the existing Blokkah hosting account), configure the environment above, and attach `go.blokkah.app` using the host's prescribed DNS records and HTTPS. The GA4 ID has been supplied and configured; no hosting account or DNS access was provided. Deployment and verification in GA4 reports have not been performed. The URLs above describe the intended production routes, not a claim that the domain is already deployed.

Existing event components and Sheets APIs are retained but unused by the hub; their previous Google Sheets setup is unrelated to GA4.
"# go-blokkah" 
