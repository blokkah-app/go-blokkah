"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { copy, visitPopupMessages } from "@/lib/content";

function pickRandomMessage(): string {
  const n = visitPopupMessages.length;
  const i = Math.floor(Math.random() * n);
  return visitPopupMessages[i] ?? visitPopupMessages[0] ?? "";
}

export function VisitMotivationModal() {
  const id = useId();
  const titleId = `${id}-title`;
  const [message] = useState(pickRandomMessage);
  const [open, setOpen] = useState(true);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="visit-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#0a2540]/40 backdrop-blur-[6px]"
        aria-label={copy.modalBackdropClose}
        onClick={close}
      />

      <div className="visit-modal-panel relative z-[1] w-full max-w-[26rem]">
        <div className="relative overflow-hidden rounded-[1.35rem] border border-[var(--color-border)] bg-white shadow-[var(--shadow-float)] sm:rounded-3xl">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "url(/brand/pattern.svg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-hidden
          />
          <div
            className="visit-modal-shine pointer-events-none absolute -left-1/2 top-0 h-full w-full opacity-90"
            aria-hidden
          />

          <button
            type="button"
            onClick={close}
            className="absolute end-3 top-3 z-20 flex size-10 cursor-pointer items-center justify-center rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-navy)] shadow-sm transition hover:border-[var(--color-sky)] hover:text-[var(--color-sky)] sm:end-4 sm:top-4"
            aria-label={copy.modalBackdropClose}
          >
            <X className="size-5" strokeWidth={2} />
          </button>

          <div className="relative px-6 pb-7 pt-10 sm:px-9 sm:pb-8 sm:pt-12">
            <div
              className="mx-auto mb-5 flex w-fit flex-col items-center gap-3 sm:mb-6"
              aria-hidden
            >
              <div className="relative rounded-2xl border border-[var(--color-border)] bg-[#f6fbff] p-2.5 shadow-sm">
                <Image
                  src="/brand/logo/darkLogoSquare.svg"
                  alt=""
                  width={44}
                  height={44}
                  className="size-11"
                />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[0.7rem] font-semibold tracking-wide text-[var(--color-sky)] sm:text-xs">
                  {copy.modalEyebrow}
                </span>
                <span className="rounded-full border border-[var(--color-border)] bg-[#f0f9ff] px-3 py-1 text-xs font-bold text-[var(--color-navy)] sm:text-sm">
                  {copy.modalBrandChip}
                </span>
              </div>
            </div>

            <div className="relative px-1">
              <span
                className="pointer-events-none absolute start-0 top-0 select-none font-serif text-5xl font-black leading-none text-[var(--color-sky)]/25 sm:text-6xl"
                aria-hidden
              >
                «
              </span>
              <p
                id={titleId}
                suppressHydrationWarning
                className="relative z-[1] px-6 text-center text-xl font-extrabold leading-[1.65] text-[var(--color-navy)] sm:px-8 sm:text-2xl sm:leading-[1.7]"
              >
                {message}
              </p>
              <span
                className="pointer-events-none absolute end-0 bottom-0 select-none font-serif text-5xl font-black leading-none text-[var(--color-sky)]/25 sm:text-6xl"
                aria-hidden
              >
                »
              </span>
            </div>

            <div className="mx-auto mt-6 h-px max-w-[12rem] bg-gradient-to-l from-transparent via-[var(--color-border)] to-transparent sm:mt-8" />

            <button
              type="button"
              className="btn-navy mt-6 w-full rounded-2xl py-3.5 text-base font-extrabold tracking-wide sm:mt-8 sm:py-4 sm:text-lg"
              onClick={close}
            >
              {copy.modalDismiss}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
