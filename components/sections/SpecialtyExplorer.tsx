"use client";

import { useState } from "react";
import Link from "next/link";
import { FitImage } from "@/components/ui/FitImage";
import { AnimatePresence, motion } from "framer-motion";
import type { Service } from "@/types/content";
import { Section, SectionEyebrow } from "@/components/ui/Section";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { Reveal } from "@/components/ui/Reveal";

export function SpecialtyExplorer({ services }: { services: Service[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = services[activeIndex];
  const highlight = active?.trifectaOutcomes?.[0];

  if (!active) return null;

  return (
    <Section tone="navy-light" id="specialty-explorer" className="max-sm:py-6">
      <Reveal>
        <SectionEyebrow>Solutions Offered</SectionEyebrow>
        <h2 className="max-w-2xl text-3xl font-bold text-ink max-sm:text-xl sm:text-4xl">
          Get Specialized Urological Care
        </h2>
      </Reveal>

      <Reveal
        delay={0.1}
        className="mt-8 grid grid-cols-3 gap-3 max-sm:mt-3 max-sm:gap-1.5 sm:grid-cols-6"
      >
        {services.map((service, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={service.slug}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-pressed={isActive}
              className={`flex flex-col items-center gap-2 rounded-card border p-4 text-center transition-colors max-sm:gap-1 max-sm:p-2 ${
                isActive
                  ? "border-accent bg-accent/10"
                  : "border-ink-muted/15 bg-navy hover:border-accent/50"
              }`}
            >
              <ServiceIcon
                icon={service.icon}
                className={`h-7 w-7 max-sm:h-5 max-sm:w-5 ${isActive ? "text-accent" : "text-ink-muted"}`}
              />
              <span
                className={`text-xs font-semibold max-sm:text-[10px] max-sm:leading-tight sm:text-sm ${
                  isActive ? "text-ink" : "text-ink-muted"
                }`}
              >
                {service.title}
              </span>
            </button>
          );
        })}
      </Reveal>

      <div className="mt-8 grid gap-6 max-sm:mt-3 max-sm:gap-2 lg:grid-cols-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${active.slug}-panel`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 rounded-card border border-ink-muted/15 bg-navy p-8 max-sm:p-3 lg:order-1"
          >
            {highlight ? (
              <>
                <h3 className="text-2xl font-bold text-ink max-sm:text-base">
                  {highlight.title}
                </h3>
                <p className="mt-3 text-ink-muted max-sm:mt-1 max-sm:text-[13px] max-sm:leading-snug">{highlight.promise}</p>
                <ul className="mt-6 space-y-3 max-sm:mt-2 max-sm:space-y-1">
                  {highlight.execution.map((point) => (
                    <li key={point} className="flex items-start gap-3 max-sm:gap-2">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs text-accent max-sm:h-4 max-sm:w-4 max-sm:text-[10px]"
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      <span className="text-ink-muted max-sm:text-[12.5px] max-sm:leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-ink-muted">{active.shortDescription}</p>
            )}
            <Link
              href={`/services/${active.slug}`}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark max-sm:mt-3 max-sm:px-4 max-sm:py-2 max-sm:text-xs"
            >
              Explore {active.title} Care →
            </Link>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${active.slug}-image`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-1 min-h-[280px] overflow-hidden rounded-card max-sm:min-h-[130px] lg:order-2"
          >
            {active.heroImage ? (
              <FitImage src={active.heroImageExplorer || active.heroImage} alt={active.title} focus={active.heroFocus} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-navy-light text-sm text-ink-faint">
                Image will appear here once uploaded via the CMS
              </div>
            )}
            {highlight ? (
              <div className="absolute inset-x-0 top-0 bg-navy-deep/80 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider text-ink backdrop-blur max-sm:py-1 max-sm:text-[10px]">
                {highlight.title}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </Section>
  );
}
