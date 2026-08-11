import type { Award } from "@/types/content";
import { Section, SectionEyebrow } from "@/components/ui/Section";
import { Reveal, RevealStagger, StaggerItem } from "@/components/ui/Reveal";

export function AwardsGrid({
  awards,
  tone = "navy",
}: {
  awards: Award[];
  tone?: "navy" | "navy-light";
}) {
  return (
    <Section id="awards" tone={tone}>
      <Reveal>
        <SectionEyebrow>Awards & Achievements</SectionEyebrow>
        <h2 className="max-w-2xl text-3xl font-bold text-ink sm:text-4xl">
          Recognized nationally and internationally for surgical excellence
        </h2>
      </Reveal>

      <RevealStagger className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {awards.map((award) => (
          <StaggerItem key={award.title} className="flex items-start gap-3">
            <span className="crosshair-mark mt-1.5" aria-hidden="true" />
            <span className="text-ink-muted">{award.title}</span>
          </StaggerItem>
        ))}
      </RevealStagger>
    </Section>
  );
}
