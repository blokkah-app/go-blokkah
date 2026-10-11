"use client";

import { Globe } from "lucide-react";
import { copy } from "@/lib/content";
import { BLOKKAH_LINKS } from "@/lib/social";
import { IconInstagram, IconLinkedIn, IconX, IconYouTube } from "@/components/BrandIcons";

function linkIcon(id: (typeof BLOKKAH_LINKS)[number]["id"]) {
  switch (id) {
    case "site":
      return <Globe className="size-5" strokeWidth={1.75} />;
    case "x":
      return <IconX className="size-5" />;
    case "instagram":
      return <IconInstagram className="size-5" />;
    case "linkedin":
      return <IconLinkedIn className="size-5" />;
    case "youtube":
      return <IconYouTube className="size-5" />;
    default:
      return null;
  }
}

export function SocialFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`animate-fade-in border-t border-[var(--color-border)] bg-white/60 px-4 py-5 backdrop-blur-sm sm:px-6 ${className}`}
    >
      <p className="mb-3 text-center text-xs font-bold text-[var(--color-text-muted)]">
        {copy.followUs}
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {BLOKKAH_LINKS.map((item, i) => (
          <li
            key={item.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${80 + i * 45}ms` }}
          >
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-11 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white text-[var(--color-navy)] shadow-sm transition hover:border-[var(--color-sky)] hover:text-[var(--color-sky)] hover:shadow-md motion-safe:hover:-translate-y-0.5"
              aria-label={item.label}
              title={item.label}
            >
              {linkIcon(item.id)}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
