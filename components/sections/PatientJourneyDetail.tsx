import Image from "next/image";
import type { PatientJourneyPhase } from "@/types/content";
import { Section, SectionEyebrow } from "@/components/ui/Section";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RecoveryMeter } from "@/components/ui/RecoveryMeter";
import { UrineColorMatcher } from "@/components/ui/UrineColorMatcher";
import { SymptomChecker } from "@/components/ui/SymptomChecker";
import { Reveal, RevealStagger, StaggerItem } from "@/components/ui/Reveal";

export function PatientJourneyDetail({
  phase,
}: {
  phase: PatientJourneyPhase;
}) {
  const hasInteractiveTools =
    (phase.recoveryMilestones && phase.recoveryMilestones.length > 0) ||
    (phase.urineColorGuide && phase.urineColorGuide.length > 0) ||
    (phase.symptomChecklist && phase.symptomChecklist.length > 0);

  return (
    <article>
      <section className="bg-navy-radial pb-16 pt-28 sm:pb-20 sm:pt-36">
        <Reveal className="mx-auto w-full max-w-3xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            {phase.phaseLabel}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-ink sm:text-5xl">
            {phase.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink-muted sm:text-lg">
            {phase.summary}
          </p>
        </Reveal>
        {phase.image ? (
          <Reveal
            delay={0.15}
            className="mx-auto mt-10 aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-card px-6"
          >
            <div className="relative h-full w-full overflow-hidden rounded-card">
              <Image
                src={phase.image}
                alt={phase.title}
                fill
                className="object-cover"
              />
            </div>
          </Reveal>
        ) : null}
      </section>

      <Section>
        <Reveal
          className="prose prose-invert mx-auto max-w-3xl prose-headings:font-heading prose-headings:text-ink prose-p:leading-relaxed prose-p:text-ink-muted prose-li:text-ink-muted prose-a:text-accent"
        >
          <div dangerouslySetInnerHTML={{ __html: phase.bodyHtml }} />
        </Reveal>
      </Section>

      {phase.keyPoints?.length ? (
        <Section tone="navy-light">
          <Reveal>
            <SectionEyebrow>At a Glance</SectionEyebrow>
            <h2 className="max-w-2xl text-3xl font-bold text-ink sm:text-4xl">
              Key points for this phase
            </h2>
          </Reveal>
          <RevealStagger className="relative mx-auto mt-10 max-w-2xl border-l-2 border-accent/25 pl-10">
            {phase.keyPoints.map((point, index) => (
              <StaggerItem key={point} className="relative mb-8 last:mb-0">
                <span className="absolute -left-[42px] top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-accent bg-navy text-xs font-bold text-accent">
                  {index + 1}
                </span>
                <p className="text-ink-muted">{point}</p>
              </StaggerItem>
            ))}
          </RevealStagger>
        </Section>
      ) : null}

      {hasInteractiveTools ? (
        <Section>
          <Reveal>
            <SectionEyebrow>Interactive Tools</SectionEyebrow>
            <h2 className="max-w-2xl text-3xl font-bold text-ink sm:text-4xl">
              Track your recovery
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-8">
            {phase.recoveryMilestones?.length ? (
              <Reveal delay={0.05}>
                <RecoveryMeter milestones={phase.recoveryMilestones} />
              </Reveal>
            ) : null}
            {phase.urineColorGuide?.length ? (
              <Reveal delay={0.1}>
                <UrineColorMatcher colorGuide={phase.urineColorGuide} />
              </Reveal>
            ) : null}
            {phase.symptomChecklist?.length ? (
              <Reveal delay={0.15}>
                <SymptomChecker symptoms={phase.symptomChecklist} />
              </Reveal>
            ) : null}
          </div>
        </Section>
      ) : null}

      {phase.faqs?.length ? (
        <Section tone="navy-light">
          <Reveal>
            <SectionEyebrow>Frequently Asked Questions</SectionEyebrow>
            <h2 className="max-w-2xl text-3xl font-bold text-ink sm:text-4xl">
              Common questions about this phase
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-10 max-w-3xl">
            <FaqAccordion faqs={phase.faqs} />
          </Reveal>
        </Section>
      ) : null}
    </article>
  );
}
