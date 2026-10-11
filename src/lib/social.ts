/** Official Blokkah links + share helpers for the event page. */

export const SHARE_PHRASE = "منشنا عشان نكون حتى احنا قدها :D";

export const BLOKKAH_LINKS = [
  {
    id: "site",
    href: "https://www.blokkah.app/",
    label: "الموقع",
  },
  {
    id: "x",
    href: "https://x.com/blokkahapp",
    label: "X",
  },
  {
    id: "instagram",
    href: "https://www.instagram.com/blokkah/",
    label: "إنستغرام",
  },
  {
    id: "linkedin",
    href: "https://www.linkedin.com/company/blokkah-app/",
    label: "لينكد إن",
  },
  {
    id: "youtube",
    href: "https://www.youtube.com/@blokkah",
    label: "يوتيوب",
  },
] as const;

export function eventPageUrl(): string {
  if (typeof window === "undefined") return "https://event.blokkah.app";
  return window.location.href;
}

export function buildShareText(): string {
  return `${SHARE_PHRASE}\n${eventPageUrl()}`;
}

export function twitterIntentUrl(text: string): string {
  const params = new URLSearchParams({ text });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function linkedInShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}
