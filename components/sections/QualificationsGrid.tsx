import type { Qualification } from "@/types/content";
import { Section, SectionEyebrow } from "@/components/ui/Section";
import { Reveal, RevealStagger, StaggerItem } from "@/components/ui/Reveal";

export function QualificationsGrid({
  qualifications,
  direction,
}: {
  qualifications: Qualification[];
  direction?: "up" | "left" | "right" | "scale";
}) {
  return (
    <Section tone="navy-light" id="qualifications">
      <Reveal direction={direction}>
        <SectionEyebrow>Training & Credentials</SectionEyebrow>
        <h2 className="max-w-2xl text-3xl font-bold text-ink sm:text-4xl">
          A foundation built at some of India&apos;s leading institutions
        </h2>
      </Reveal>

      <RevealStagger className="mt-10 grid gap-6 sm:grid-cols-2">
        {qualifications.map((q) => (
          <StaggerItem
            key={q.degree}
            className="rounded-card border border-ink-muted/15 bg-navy p-6 shadow-glow transition-transform duration-300 hover:-translate-y-1"
          >
            <p className="text-lg font-semibold text-ink">{q.degree}</p>
            {q.institution ? (
              <p className="mt-1 text-sm text-ink-muted">{q.institution}</p>
            ) : null}
          </StaggerItem>
        ))}
      </RevealStagger>
    </Section>
  );
}
