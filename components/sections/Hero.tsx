"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { DoctorProfile } from "@/types/content";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";

// Matches the loader's total on-screen duration (see globals.css
// `loader-exit`: 2.6s). Every hero delay below is offset by this amount
// so the hero's reveal genuinely starts only once the loader is gone —
// previously these ran in parallel, fully finishing underneath the
// loader before it ever faded away.
const LOADER_DURATION = 2.6;
const d = (s: number) => `${(s + LOADER_DURATION).toFixed(2)}s`;

const features = [
  { icon: "scalpel", label: "Minimally Invasive Surgery" },
  { icon: "renal-transplant", label: "Renal Transplant Expertise" },
  { icon: "laparoscopy-robotic", label: "Robotic Assisted Procedures" },
  { icon: "endourology", label: "Advanced Stone Management" },
  { icon: "heart", label: "Patient First Approach" },
] as const;

function FeatureIcon({ icon }: { icon: string }) {
  const common = {
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (icon) {
    case "scalpel":
      return (
        <svg {...common}>
          <path d="M6 26L20 12" />
          <path d="M18 10l4-4 4 4-4 4z" />
          <circle cx="7" cy="25" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "renal-transplant":
      return (
        <svg {...common}>
          <path d="M11 9c-3.3 0-5.3 3.3-5.3 7.3S8 24 11.5 24c2 0 2.6-1.3 3.3-2.7" />
          <path d="M21 23c3.3 0 5.3-3.3 5.3-7.3S24 8 20.5 8c-2 0-2.6 1.3-3.3 2.7" />
          <path d="M13.5 16h5M17 13.3L19.7 16 17 18.7" />
        </svg>
      );
    case "laparoscopy-robotic":
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="2" />
          <path d="M10.5 10.5l6 6" />
          <path d="M16.5 16.5l5.5-5.5" />
          <circle cx="23" cy="10" r="2" />
          <path d="M16.5 16.5l-3 8" />
          <circle cx="12.5" cy="26" r="2" />
        </svg>
      );
    case "endourology":
      return (
        <svg {...common}>
          <circle cx="13" cy="13" r="7.5" />
          <path d="M18.3 18.3L26 26" />
          <circle cx="13" cy="13" r="2.5" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M16 26s-9.5-6-9.5-13A5.5 5.5 0 0116 9.7 5.5 5.5 0 0125.5 13c0 7-9.5 13-9.5 13z" />
        </svg>
      );
    default:
      return null;
  }
}

export function Hero({ profile }: { profile: DoctorProfile }) {
  const nameWords = profile.name.split(" ");
  const mid = Math.ceil(nameWords.length / 2);
  const nameLine1 = nameWords.slice(0, mid).join(" ");
  const nameLine2 = nameWords.slice(mid).join(" ");

  const stats = [
    profile.yearsExperience
      ? { label: "Years of Experience", value: profile.yearsExperience }
      : null,
    profile.patientsTreated
      ? { label: "Patients Treated", value: profile.patientsTreated }
      : null,
    { label: "Gold Medals", value: "3" },
  ].filter(Boolean) as { label: string; value: string }[];

  // Counters start counting once the stats row itself has revealed
  // (matching that element's own animation delay below) rather than on
  // page load, so the numbers don't finish counting before they're
  // visible.
  const [countersStarted, setCountersStarted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(
      () => setCountersStarted(true),
      (LOADER_DURATION + 1.7) * 1000
    );
    return () => clearTimeout(timer);
  }, []);

  // Subtle cursor parallax on the photo — shifts a few px opposite the
  // mouse position. Purely additive: mouse-position based, not tied to
  // scroll, so there's no sync risk with anything else on the page.
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const springX = useSpring(mvX, { stiffness: 120, damping: 20 });
  const springY = useSpring(mvY, { stiffness: 120, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    mvX.set(relX * -14);
    mvY.set(relY * -14);
  };
  const handleMouseLeave = () => {
    mvX.set(0);
    mvY.set(0);
  };

  return (
    <section className="relative overflow-hidden bg-navy-radial pb-16 pt-20 sm:pb-20 sm:pt-24">
      <svg
        aria-hidden="true"
        viewBox="0 0 500 500"
        className="pointer-events-none absolute -right-24 top-10 hidden h-[480px] w-[480px] text-ink opacity-[0.05] sm:block lg:-right-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M190 90c-70 0-110 60-110 140s45 150 105 150c35 0 45-25 55-50" />
        <path d="M330 150c55 0 90 55 90 125s-40 130-90 130c-30 0-40-22-50-45" />
      </svg>

      <Container>
        <div
          className="hero-animate mb-6 inline-flex items-center gap-2 rounded-full border border-ink-muted/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent"
          style={{ animationDelay: d(0.1) }}
        >
          <span className="crosshair-mark" aria-hidden="true" />
          Precision-Focused Urology Care
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              <span
                className="hero-animate block"
                style={{ animationDelay: d(0.4) }}
              >
                {nameLine1}
              </span>
              <span
                className="hero-animate block text-accent"
                style={{ animationDelay: d(0.65) }}
              >
                {nameLine2}
              </span>
            </h1>

            <p
              className="hero-animate mt-6 text-sm font-semibold uppercase tracking-wider text-ink-muted"
              style={{ animationDelay: d(0.9) }}
            >
              {profile.credentials}
            </p>

            <p
              className="hero-animate mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg"
              style={{ animationDelay: d(1.05) }}
            >
              {profile.tagline}
            </p>

            <div
              className="hero-animate mt-8 flex flex-wrap gap-4"
              style={{ animationDelay: d(1.2) }}
            >
              <Button href="/services">Explore Specialties</Button>
              <Button href="/patient-journey" variant="secondary">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[10px] text-accent"
                  aria-hidden="true"
                >
                  ▶
                </span>
                See the Patient Journey
              </Button>
            </div>

            {stats.length ? (
              <div
                className="hero-animate mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-ink-muted/10 pt-6"
                style={{ animationDelay: d(1.7) }}
              >
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-extrabold text-accent sm:text-3xl">
                      <Counter value={stat.value} start={countersStarted} />
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div
            className="hero-animate relative mx-auto w-full max-w-[22rem]"
            style={{ animationDelay: d(1.5) }}
          >
            <motion.div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ x: springX, y: springY }}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-navy-light shadow-glow ring-1 ring-ink-muted/10"
            >
              {profile.heroImage ? (
                <Image
                  src={profile.heroImage}
                  alt={profile.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-ink-faint">
                  Doctor photo will appear here once uploaded via the CMS
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy-deep/70 to-transparent" />
            </motion.div>
          </div>
        </div>

        <div
          className="hero-animate mt-16 grid grid-cols-2 gap-4 border-t border-ink-muted/10 pt-8 sm:mt-20 sm:grid-cols-3 sm:pt-10 lg:grid-cols-5"
          style={{ animationDelay: d(1.9) }}
        >
          {features.map((feature) => (
            <div key={feature.label} className="flex items-center gap-3">
              <span className="text-accent">
                <FeatureIcon icon={feature.icon} />
              </span>
              <span className="text-sm font-medium text-ink-muted">
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </Container>

      <div
        className="hero-animate mt-12 flex flex-col items-center gap-2 text-ink-faint"
        style={{ animationDelay: d(2.1) }}
      >
        <span className="flex h-8 w-5 items-start justify-center rounded-full border border-ink-muted/25 p-1">
          <span className="h-1.5 w-1 rounded-full bg-accent" />
        </span>
        <span className="text-xs">Scroll to explore</span>
      </div>
    </section>
  );
}
