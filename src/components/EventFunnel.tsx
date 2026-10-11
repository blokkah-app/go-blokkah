"use client";

import Image from "next/image";
import { ArrowRight, Gift, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { MonshaatShareCard } from "@/components/MonshaatShareCard";
import { SocialFooter } from "@/components/SocialFooter";
import { VisitMotivationModal } from "@/components/VisitMotivationModal";
import { copy, ROLES, type RoleId } from "@/lib/content";
import { formatArabicCount } from "@/lib/format";
import { submitErrorMessage } from "@/lib/form-errors";

type Step = "welcome" | "form" | "gift";

type StatsPayload = { beforeYouCount: number; demo: boolean };

async function fetchStats(): Promise<StatsPayload> {
  const res = await fetch("/api/stats", { cache: "no-store" });
  const data = (await res.json()) as {
    beforeYouCount: number;
    demo?: boolean;
  };
  return { beforeYouCount: data.beforeYouCount, demo: !!data.demo };
}

function BlokkahBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden text-[var(--color-text)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[var(--color-page)]" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.22]"
          style={{
            backgroundImage: "url(/brand/photos/hero.jpg)",
            backgroundPosition: "center bottom",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-page)] via-[var(--color-page)]/92 to-[var(--color-page-accent)]" />
        <div className="absolute -top-20 end-0 size-[min(100vw,24rem)] rounded-full bg-[var(--color-sky)]/10 blur-[90px] motion-safe:animate-pulse-soft" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-1 flex-col">
        <VisitMotivationModal />
        <div className="flex flex-1 flex-col">{children}</div>
        <SocialFooter />
      </div>
    </div>
  );
}

function CounterHero({
  beforeYou,
  youNumber,
  loading,
}: {
  beforeYou: number | null;
  youNumber: number | null;
  loading: boolean;
}) {
  return (
    <div
      className="relative mx-auto w-full max-w-[20rem] animate-fade-in-up sm:max-w-[22rem]"
      style={{ animationDelay: "120ms" }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 size-[min(100%,17rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-sky)]/15 blur-[40px]"
        aria-hidden
      />
      <div className="surface-card relative rounded-[1.75rem] px-5 pb-7 pt-8 sm:rounded-[2rem] sm:px-8 sm:pb-9 sm:pt-10">
        <div className="flex items-center justify-center gap-2 text-[var(--color-sky)]">
          <Sparkles className="size-4" strokeWidth={2} />
          <p className="text-center text-xs font-bold tracking-wide text-[var(--color-text-muted)] sm:text-sm">
            {copy.counterHeroTitle}
          </p>
        </div>

        <div className="relative mx-auto mt-6 flex aspect-square w-[min(100%,15.5rem)] items-center justify-center sm:mt-8 sm:w-[17.5rem]">
          <div
            className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--color-border)]"
            aria-hidden
          />
          <div
            className="absolute inset-[10%] rounded-full border border-[var(--color-sky-soft)] bg-gradient-to-b from-white to-[#f6fbff]"
            aria-hidden
          />
          <div className="relative z-[1] text-center">
            <p className="text-sm font-semibold text-[var(--color-text-muted)] sm:text-base">
              {copy.counterYou}
            </p>
            {loading || youNumber === null ? (
              <div className="mt-3 flex h-[4.5rem] items-center justify-center sm:h-[5.25rem]">
                <span className="text-lg text-[var(--color-text-muted)] sm:text-xl">
                  {copy.counterLoading}
                </span>
              </div>
            ) : (
              <p
                className="mt-1 bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-navy-mid)] bg-clip-text font-black tabular-nums tracking-tight text-transparent sm:mt-2"
                style={{
                  fontSize: "clamp(2.75rem, 12vw, 4.25rem)",
                  lineHeight: 1.05,
                }}
              >
                {formatArabicCount(youNumber)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-[var(--color-border)] pt-5 sm:mt-8 sm:pt-6">
          {loading || beforeYou === null ? (
            <div className="h-8" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-center sm:gap-3">
              <span className="text-2xl font-bold tabular-nums text-[var(--color-sky)] sm:text-3xl">
                {formatArabicCount(beforeYou)}
              </span>
              <span className="text-sm font-semibold text-[var(--color-text-muted)] sm:text-base">
                {copy.counterBefore}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function EventFunnel() {
  const [step, setStep] = useState<Step>("welcome");
  const [beforeYou, setBeforeYou] = useState<number | null>(null);
  const [statsDemo, setStatsDemo] = useState(false);
  const [role, setRole] = useState<RoleId | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formRole, setFormRole] = useState<RoleId | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchStats()
      .then((d) => {
        if (!cancelled) {
          setBeforeYou(d.beforeYouCount);
          setStatsDemo(d.demo);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBeforeYou(363);
          setStatsDemo(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshStats = () => {
    void fetchStats()
      .then((d) => {
        setBeforeYou(d.beforeYouCount);
        setStatsDemo(d.demo);
      })
      .catch(() => {
        setBeforeYou(363);
        setStatsDemo(true);
      });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const youNumber = beforeYou !== null ? beforeYou + 1 : null;
  const statsLoading = beforeYou === null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          role: formRole,
          website: honeypot,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        const key = data.error ?? "network";
        setFormError(
          submitErrorMessage[key] ?? submitErrorMessage.network,
        );
        setSubmitting(false);
        return;
      }
      setRole(formRole as RoleId);
      try {
        const d = await fetchStats();
        setBeforeYou(d.beforeYouCount);
        setStatsDemo(d.demo);
      } catch {
        if (beforeYou !== null) {
          setBeforeYou(beforeYou + 1);
        }
      }
      setStep("gift");
    } catch {
      setFormError(submitErrorMessage.network);
    } finally {
      setSubmitting(false);
    }
  };

  const gift = role ? copy.gifts[role] : null;
  const hookParts = copy.heroHook.split(".. ");
  const hookLead = hookParts[0] ?? copy.heroHook;
  const hookAccent =
    hookParts.length > 1 ? hookParts.slice(1).join(".. ") : null;

  return (
    <BlokkahBackdrop>
      {step === "welcome" && (
        <div className="flex flex-1 flex-col px-4 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8">
          <header
            className="mx-auto flex w-full max-w-lg animate-fade-in-up items-center justify-between gap-4"
            style={{ animationDelay: "40ms" }}
          >
            <Image
              src="/brand/logo/darkLogoSquare.svg"
              alt="Blokkah"
              width={52}
              height={52}
              className="h-[3.25rem] w-[3.25rem] shrink-0 drop-shadow-sm sm:h-14 sm:w-14"
              priority
            />
            <p className="max-w-[13rem] text-end text-xs font-semibold leading-relaxed text-[var(--color-text-muted)] sm:max-w-[15rem] sm:text-sm">
              {copy.tagline}
            </p>
          </header>

          <main className="mx-auto mt-6 flex w-full max-w-lg flex-1 flex-col sm:mt-10">
            <p
              className="animate-fade-in-up text-center text-sm font-bold text-[var(--color-sky)] sm:text-base"
              style={{ animationDelay: "80ms" }}
            >
              {copy.heroHookLead}
            </p>
            <h1
              className="animate-fade-in-up mt-3 text-center text-2xl font-extrabold leading-snug tracking-tight text-[var(--color-navy)] sm:text-3xl md:text-[2rem]"
              style={{ animationDelay: "100ms" }}
            >
              <span>{hookLead}</span>
              {hookAccent ? (
                <>
                  <span className="text-[var(--color-sky)]">.. </span>
                  <span>{hookAccent}</span>
                </>
              ) : null}
            </h1>

            <div className="mt-8 sm:mt-10">
              <CounterHero
                beforeYou={beforeYou}
                youNumber={youNumber}
                loading={statsLoading}
              />
            </div>

            <div
              className="surface-card animate-fade-in-up mt-8 rounded-3xl px-5 py-5 sm:mt-10 sm:px-6 sm:py-6"
              style={{ animationDelay: "180ms" }}
            >
              <p className="text-center text-base font-bold leading-relaxed text-[var(--color-navy)] sm:text-lg">
                {copy.challengeLine}
              </p>
              <p className="mt-2 text-center text-sm font-medium text-[var(--color-text-muted)] sm:text-base">
                {copy.challengeSub}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep("form")}
              className="btn-navy animate-fade-in-up mt-6 w-full rounded-2xl px-6 py-4 text-base font-extrabold transition sm:mt-8 sm:py-[1.125rem] sm:text-lg"
              style={{ animationDelay: "220ms" }}
            >
              {copy.ctaContinue}
            </button>
            <p
              className="animate-fade-in mt-3 text-center text-xs text-[var(--color-text-muted)] sm:text-sm"
              style={{ animationDelay: "260ms" }}
            >
              {copy.ctaHint}
            </p>

            {statsDemo && (
              <p className="mt-4 text-center text-[0.7rem] text-[var(--color-text-muted)] sm:text-xs">
                {copy.statsDemoBanner}
              </p>
            )}
          </main>
        </div>
      )}

      {step === "form" && (
        <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
          <div className="mx-auto w-full max-w-lg flex-1 animate-fade-in-up">
            <button
              type="button"
              onClick={() => setStep("welcome")}
              className="btn-ghost-light mb-6 inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold"
            >
              <ArrowRight className="size-4" strokeWidth={2} />
              {copy.back}
            </button>

            <div className="surface-card rounded-[1.75rem] p-6 sm:rounded-[2rem] sm:p-8">
              <div className="mb-6 flex justify-center">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[#f6fbff] p-3 shadow-sm">
                  <Image
                    src="/brand/logo/darkLogoSquare.svg"
                    alt="Blokkah"
                    width={56}
                    height={56}
                    className="h-14 w-14"
                  />
                </div>
              </div>
              <h2 className="text-center text-xl font-extrabold text-[var(--color-navy)] sm:text-2xl">
                {copy.formTitle}
              </h2>
              <p className="mt-2 text-center text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-base">
                {copy.formSubtitle}
              </p>

              <form className="mt-8 space-y-5" onSubmit={onSubmit}>
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--color-navy)]"
                  >
                    <UserRound className="size-4 text-[var(--color-sky)]" strokeWidth={2} />
                    {copy.nameLabel}
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={copy.namePlaceholder}
                    required
                    autoComplete="name"
                    className="input-light w-full rounded-2xl px-4 py-3.5 text-base"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-bold text-[var(--color-navy)]"
                  >
                    {copy.phoneLabel}
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={copy.phonePlaceholder}
                    required
                    autoComplete="tel"
                    className="input-light w-full rounded-2xl px-4 py-3.5 text-base"
                  />
                </div>
                <fieldset>
                  <legend className="mb-3 block text-sm font-bold text-[var(--color-navy)]">
                    {copy.roleLabel}
                  </legend>
                  <div className="space-y-2.5">
                    {ROLES.map((r) => (
                      <label
                        key={r.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 transition motion-safe:hover:scale-[1.01] ${
                          formRole === r.id
                            ? "border-[var(--color-sky)] bg-[#e8f7fd] shadow-[0_0_0_1px_rgba(0,174,239,0.25)]"
                            : "border-[var(--color-border)] bg-white hover:border-[var(--color-sky-soft)]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={r.id}
                          checked={formRole === r.id}
                          onChange={() => setFormRole(r.id)}
                          className="size-5 accent-[var(--color-sky)]"
                        />
                        <span className="font-semibold text-[var(--color-navy)]">
                          {r.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {formError && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !formRole}
                  className="btn-navy w-full rounded-2xl px-6 py-4 text-base font-extrabold disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {submitting ? copy.submitting : copy.submitCta}
                </button>
                <p className="text-center text-xs text-[var(--color-text-muted)]">
                  {copy.privacyNote}
                </p>
              </form>
            </div>
          </div>
        </div>
      )}

      {step === "gift" && gift && role && (
        <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-12">
          <div className="animate-fade-in-up surface-card mx-auto w-full max-w-lg rounded-[1.75rem] px-6 py-10 text-center sm:rounded-[2rem] sm:px-10 sm:py-12">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[#f6fbff] shadow-sm">
              <Image
                src="/brand/logo/darkLogoSquare.svg"
                alt="Blokkah"
                width={56}
                height={56}
                className="h-14 w-14"
              />
            </div>
            <p className="mt-6 text-sm font-bold text-[var(--color-sky)]">
              {copy.shareCardThanks}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold leading-snug text-[var(--color-navy)] sm:text-3xl">
              {gift.title}
            </h2>
            <p className="mt-6 inline-flex items-center justify-center gap-2 text-base font-bold text-[var(--color-sky)] sm:text-lg">
              <Gift className="size-5" strokeWidth={2} />
              {gift.giftLabel}
            </p>
            <p className="mt-2 text-lg font-semibold leading-relaxed text-[var(--color-navy)] sm:text-xl">
              {gift.giftBody}
            </p>
            <blockquote className="surface-card mt-8 rounded-2xl border border-[var(--color-border)] bg-[#fafcff] px-5 py-5 text-start text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-base">
              {gift.foot}
              <cite className="mt-3 block text-sm font-bold not-italic text-[var(--color-sky)]">
                {gift.footEm}
              </cite>
            </blockquote>

            <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <MonshaatShareCard />
            </div>

            <button
              type="button"
              onClick={() => {
                setStep("welcome");
                setRole(null);
                setName("");
                setPhone("");
                setFormRole("");
                setHoneypot("");
                void refreshStats();
              }}
              className="btn-ghost-light mt-8 w-full rounded-2xl py-3.5 text-base font-bold"
            >
              {copy.again}
            </button>
          </div>
        </div>
      )}
    </BlokkahBackdrop>
  );
}
