"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Service } from "@/types/content";
import { Section, SectionEyebrow } from "@/components/ui/Section";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Reveal, RevealStagger, StaggerItem } from "@/components/ui/Reveal";
import { useVideoModal } from "@/components/ui/VideoModal";

const shineContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 1.1 } },
};

const shineGlowVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: [0, 1, 0],
    transition: { duration: 1.3, ease: "easeInOut" as const },
  },
};

export function ServiceDetail({ service }: { service: Service }) {
  const { open } = useVideoModal();
  const summaryImage = service.images?.[1] ?? service.images?.[0] ?? service.heroImage;
  const trifectaImage = service.images?.[0] ?? service.heroImage;

  const journeyBlocks = [
    { heading: service.problemDiagnosisHeading, body: service.problemDiagnosisBody },
    { heading: service.procedurePrecisionHeading, body: service.procedurePrecisionBody },
    { heading: service.lifeRecoveryHeading, body: service.lifeRecoveryBody },
  ];

  return (
    <article>
      <section className="bg-navy-radial pb-16 pt-28 sm:pb-20 sm:pt-36">
        <Reveal className="mx-auto w-full max-w-4xl px-6 text-center">
          <h1 className="text-3xl font-bold text-ink sm:text-5xl">
            {service.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink-muted sm:text-lg">
            {service.shortDescription}
          </p>
        </Reveal>
        {service.heroImage ? (
          <Reveal
            delay={0.15}
            className="mx-auto mt-10 aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-card px-6"
          >
            <div className="relative h-full w-full overflow-hidden rounded-card">
              <Image
                src={service.heroImage}
                alt={service.title}
                fill
                className="object-cover"
              />
            </div>
          </Reveal>
        ) : null}
      </section>

      {/* Problem & Diagnosis / Procedure & Precision / Life & Recovery —
          side by side, with an automatic sequential "shine" that lights
          up card 1, then card 2, then card 3 once this section scrolls
          into view. It plays through on its own timer rather than being
          tied to further scrolling. */}
      <Section>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={shineContainerVariants}
          className="grid gap-6 lg:grid-cols-3"
        >
          {journeyBlocks.map((block) => (
            <div
              key={block.heading}
              className="relative overflow-hidden rounded-card border border-ink-muted/15 bg-navy-light p-6 shadow-glow"
            >
              <motion.div
                variants={shineGlowVariants}
                className="pointer-events-none absolute inset-0 rounded-card"
                style={{ boxShadow: "0 0 45px 8px rgba(255,107,53,0.35)" }}
                aria-hidden="true"
              />
              <h2 className="text-xl font-bold text-ink">{block.heading}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {block.body}
              </p>
            </div>
          ))}
        </motion.div>
      </Section>

      {/* A single large explainer video from the doctor, in place of a
          static image grid — replaced per request, since a real video
          explaining the procedure carries more than a couple of stock
          photos could. */}
      {service.explainerVideoUrl ? (
        <Section tone="navy-light">
          <Reveal>
            <SectionEyebrow>Watch & Understand</SectionEyebrow>
            <h2 className="max-w-2xl text-3xl font-bold text-ink sm:text-4xl">
              Dr. Peerzada explains {service.title.toLowerCase()}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <button
              type="button"
              onClick={() =>
                open(
                  service.explainerVideoUrl as string,
                  `Dr. Peerzada explains ${service.title}`
                )
              }
              className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-card border border-ink-muted/15 bg-navy shadow-glow"
            >
              <span
                aria-hidden="true"
                className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white transition-transform duration-300 group-hover:scale-110"
              >
                ▶
              </span>
              <span className="absolute bottom-4 left-4 text-sm font-medium text-ink-muted">
                Watch
              </span>
            </button>
          </Reveal>
        </Section>
      ) : null}

      {service.trifectaOutcomes?.length ? (
        <Section>
          <Reveal>
            <SectionEyebrow>The Trifecta Outcome</SectionEyebrow>
            <h2 className="max-w-2xl text-3xl font-bold text-ink sm:text-4xl">
              What this approach is built to achieve
            </h2>
          </Reveal>

          {trifectaImage ? (
            <Reveal
              delay={0.1}
              className="relative mx-auto mt-10 aspect-[21/9] w-full max-w-4xl overflow-hidden rounded-card"
            >
              <Image
                src={trifectaImage}
                alt={`${service.title} outcomes`}
                fill
                className="object-cover"
              />
            </Reveal>
          ) : null}

          <RevealStagger className="mt-10 grid gap-6 lg:grid-cols-3">
            {service.trifectaOutcomes.map((outcome) => (
              <StaggerItem
                key={outcome.title}
                className="rounded-card border border-ink-muted/15 bg-navy p-6 shadow-glow transition-transform duration-300 hover:-translate-y-1"
              >
                <h3 className="text-lg font-semibold text-accent">
                  {outcome.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-ink">
                  {outcome.promise}
                </p>
                <p className="mt-4 text-sm text-ink-muted">
                  {outcome.technique}
                </p>
                <ul className="mt-4 space-y-2">
                  {outcome.execution.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-ink-muted"
                    >
                      <span
                        className="crosshair-mark mt-1"
                        aria-hidden="true"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-ink-muted/15 pt-4 text-sm font-medium text-ink">
                  {outcome.win}
                </p>
              </StaggerItem>
            ))}
          </RevealStagger>
        </Section>
      ) : null}

      {/* Clinical Outcome Summary — text and image side by side rather
          than stacked. */}
      <Section tone="navy-light">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal
            className="prose prose-invert max-w-none prose-headings:font-heading prose-headings:text-ink prose-p:text-ink-muted prose-a:text-accent"
          >
            <div dangerouslySetInnerHTML={{ __html: service.summaryHtml }} />
          </Reveal>
          {summaryImage ? (
            <Reveal
              delay={0.15}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-card"
            >
              <Image
                src={summaryImage}
                alt={`${service.title} summary`}
                fill
                className="object-cover"
              />
            </Reveal>
          ) : null}
        </div>
      </Section>

      {service.faqs?.length ? (
        <Section>
          <Reveal>
            <SectionEyebrow>Frequently Asked Questions</SectionEyebrow>
            <h2 className="max-w-2xl text-3xl font-bold text-ink sm:text-4xl">
              Common questions about {service.title.toLowerCase()}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-10 max-w-3xl">
            <FaqAccordion faqs={service.faqs} />
          </Reveal>
        </Section>
      ) : null}
    </article>
  );
}
