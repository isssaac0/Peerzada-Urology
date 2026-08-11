import Link from "next/link";
import Image from "next/image";
import type { PatientJourneyPhase } from "@/types/content";
import { Section, SectionEyebrow } from "@/components/ui/Section";
import { Reveal, RevealStagger, StaggerItem } from "@/components/ui/Reveal";

export function PatientJourneyGrid({
  phases,
  tone = "navy-light",
  direction,
}: {
  phases: PatientJourneyPhase[];
  tone?: "navy" | "navy-light";
  direction?: "up" | "left" | "right" | "scale";
}) {
  return (
    <Section tone={tone} id="patient-journey">
      <Reveal direction={direction}>
        <SectionEyebrow>Your Journey</SectionEyebrow>
        <h2 className="max-w-2xl text-3xl font-bold text-ink sm:text-4xl">
          Select a phase to understand what to expect
        </h2>
      </Reveal>

      <RevealStagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {phases.map((phase) => (
          <StaggerItem key={phase.slug}>
            <Link
              href={`/patient-journey/${phase.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-card border border-ink-muted/15 bg-navy shadow-glow transition-all duration-300 hover:-translate-y-1 hover:border-accent"
            >
              {phase.image ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={phase.image}
                    alt={phase.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {phase.phaseLabel}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-ink group-hover:text-accent">
                  {phase.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-ink-muted">
                  {phase.summary}
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-accent">
                  Read this phase →
                </span>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </RevealStagger>
    </Section>
  );
}
