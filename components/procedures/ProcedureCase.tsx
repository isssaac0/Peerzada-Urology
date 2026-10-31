"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PhotoStage } from "@/components/ui/PhotoStage";
import type { SurgicalStep } from "@/types/content";

const ACK_KEY = "procedure-warning-acknowledged";
// Every stage photograph sits in the same fixed 4:3 placeholder. The whole
// photograph is shown inside it (never cropped or zoomed); a soft blurred
// copy fills any leftover space. The full-screen view shows it uncropped.
const STAGE_ASPECT = 4 / 3;

type Props = {
  title: string;
  category: string;
  description: string;
  meta: string;
  steps: SurgicalStep[];
  contentWarning: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");

function Lightbox({
  title,
  steps,
  index,
  onChange,
  onClose,
}: {
  title: string;
  steps: SurgicalStep[];
  index: number;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const total = steps.length;
  const go = useCallback(
    (i: number) => onChange(Math.min(Math.max(i, 0), total - 1)),
    [onChange, total]
  );

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, onClose]);

  const step = steps[index];
  const arrow =
    "absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-accent disabled:pointer-events-none disabled:opacity-0";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — ${step.title}`}
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (dx < -50) go(index + 1);
        else if (dx > 50) go(index - 1);
      }}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4 text-white">
        <p className="min-w-0 truncate text-sm font-semibold sm:text-base">
          <span className="mr-3 text-accent">{pad(index + 1)}</span>
          {step.title}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close full-screen view"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl leading-none transition hover:bg-accent"
        >
          ×
        </button>
      </div>
      <div className="relative min-h-0 flex-1">
        <Image
          key={step.image}
          src={step.image}
          alt={`${title} — ${step.title}`}
          fill
          sizes="100vw"
          quality={90}
          className="object-contain"
          priority
        />
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous photograph" className={`${arrow} left-3`}>
          <span aria-hidden="true">←</span>
        </button>
        <button type="button" onClick={() => go(index + 1)} disabled={index === total - 1} aria-label="Next photograph" className={`${arrow} right-3`}>
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <p className="py-3 text-center text-xs text-white/60">
        {index + 1} / {total}
      </p>
    </div>
  );
}

// The procedure page: a sticky "case sheet" on the left (what it is, and a
// stage index) and the stages themselves, one after another, on the right.
export function ProcedureCase({
  title,
  category,
  description,
  meta,
  steps,
  contentWarning,
}: Props) {
  const [acknowledged, setAcknowledged] = useState(!contentWarning);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (!contentWarning) return;
    try {
      if (window.sessionStorage.getItem(ACK_KEY) === "1") setAcknowledged(true);
    } catch {
      /* ignore */
    }
  }, [contentWarning]);

  const acknowledge = () => {
    setAcknowledged(true);
    try {
      window.sessionStorage.setItem(ACK_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  // Highlight the stage currently being read.
  useEffect(() => {
    if (!acknowledged) return;
    const sections = document.querySelectorAll<HTMLElement>("[data-stage]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(Number(entry.target.getAttribute("data-stage")));
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [acknowledged]);

  const jump = (i: number) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById(`stage-${i}`)
      ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 pb-24 pt-24 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-16 lg:pt-28">
      {/* ---------------- Case sheet ---------------- */}
      <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-3">
        <Link
          href="/procedures"
          className="text-sm font-semibold text-accent hover:text-accent-light"
        >
          ← Surgical procedures
        </Link>
        {category ? (
          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            {category}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-2 text-sm text-ink-faint">{meta}</p>
        <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-ink-muted">
          {description}
        </p>

        <nav aria-label="Stages" className="mt-10 hidden lg:block">
          <ol className="relative space-y-0.5 border-l border-ink-muted/20">
            {steps.map((s, i) => (
              <li key={`${s.image}-${i}`}>
                <button
                  type="button"
                  onClick={() => jump(i)}
                  disabled={!acknowledged}
                  aria-current={acknowledged && active === i ? "step" : undefined}
                  className={`-ml-px flex w-full items-baseline gap-3 border-l-2 py-1.5 pl-4 pr-2 text-left text-sm transition-colors disabled:cursor-not-allowed ${
                    acknowledged && active === i
                      ? "border-accent text-ink"
                      : "border-transparent text-ink-muted hover:text-ink"
                  }`}
                >
                  <span className="w-6 shrink-0 text-xs font-bold tabular-nums text-accent">
                    {pad(i + 1)}
                  </span>
                  <span className="min-w-0">{s.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <p className="mt-10 text-xs leading-relaxed text-ink-faint">
          Published with the patient&apos;s consent, for general information
          only. Every patient and operation is different.
        </p>
      </aside>

      {/* ---------------- Stages ---------------- */}
      <div className="min-w-0">
        {/* Mobile / tablet: stage chips that stay under the site header */}
        <nav
          aria-label="Stages"
          className="sticky top-16 z-20 -mx-6 mb-6 flex gap-2 overflow-x-auto bg-navy/90 px-6 py-3 backdrop-blur lg:hidden"
        >
          {steps.map((s, i) => (
            <button
              key={`${s.image}-${i}`}
              type="button"
              onClick={() => jump(i)}
              disabled={!acknowledged}
              aria-label={`Go to stage ${i + 1}: ${s.title}`}
              aria-current={acknowledged && active === i ? "step" : undefined}
              className={`h-9 min-w-9 shrink-0 rounded-full px-3 text-sm font-bold tabular-nums transition-colors disabled:opacity-40 ${
                acknowledged && active === i
                  ? "bg-accent text-white"
                  : "bg-ink/10 text-ink-muted"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </nav>

        {acknowledged ? (
          <div className="space-y-14">
            {steps.map((step, i) => (
              <section
                key={`${step.image}-${i}`}
                id={`stage-${i}`}
                data-stage={i}
                className="scroll-mt-32 lg:scroll-mt-28"
              >
                <div className="mb-4 flex items-baseline gap-4">
                  <span className="text-4xl font-bold tabular-nums text-accent/40 sm:text-5xl">
                    {pad(i + 1)}
                  </span>
                  <h2 className="text-xl font-semibold text-ink sm:text-2xl">
                    {step.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={`View ${step.title} full screen`}
                  className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl"
                >
                  <PhotoStage
                    photo={step}
                    alt={`${title} — ${step.title}`}
                    sizes="(min-width: 1024px) 860px, 100vw"
                    fixedAspect={STAGE_ASPECT}
                  />
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white opacity-90 backdrop-blur transition group-hover:bg-accent">
                    Full screen
                  </span>
                </button>
              </section>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[22rem] flex-col items-center justify-center gap-4 rounded-2xl bg-navy-light px-6 py-14 text-center">
            <p className="text-lg font-semibold text-ink">Surgical photographs</p>
            <p className="max-w-md text-sm leading-relaxed text-ink-muted">
              The stages that follow include photographs taken during surgery,
              which some people may find graphic or distressing.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={acknowledge}
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
              >
                View the stages
              </button>
              <Link
                href="/procedures"
                className="rounded-full border border-ink-muted/40 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
              >
                Go back
              </Link>
            </div>
          </div>
        )}
      </div>

      {open !== null ? (
        <Lightbox
          title={title}
          steps={steps}
          index={open}
          onChange={setOpen}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  );
}
