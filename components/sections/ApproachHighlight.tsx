import Image from "next/image";
import { Section, SectionEyebrow } from "@/components/ui/Section";
import { Reveal, RevealStagger, StaggerItem } from "@/components/ui/Reveal";

const highlights = [
  {
    title: "Precision First",
    description:
      "Every procedure is approached with the same underlying discipline — careful planning, precise technique, and a focus on getting it right the first time.",
    detail:
      "From detailed pre-operative imaging to meticulous intra-operative technique, every step is planned around a single well-executed outcome — the same trifecta approach (cancer control, function preservation, minimized complications) used across every specialty on this site.",
  },
  {
    title: "Function-Preserving",
    description:
      "Wherever it's safe to do so, healthy tissue and surrounding function are protected — treatment shouldn't cost more than it needs to.",
    detail:
      "Nerve-sparing and organ-sparing techniques are used wherever oncologically or functionally safe — protecting continence, sexual function, and surrounding organs is treated as part of the outcome, not an afterthought.",
  },
  {
    title: "Faster Recovery",
    description:
      "Minimally invasive and robotic-assisted techniques, used wherever appropriate, mean smaller incisions, less pain, and a quicker return to daily life.",
    detail:
      "Smaller incisions mean less blood loss, shorter hospital stays, and a faster return to normal activity — the same minimally invasive training applied consistently, from stone treatment to complex reconstructive surgery.",
  },
];

export function ApproachHighlight({ image }: { image?: string }) {
  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <SectionEyebrow>The Approach</SectionEyebrow>
          <h2 className="text-3xl font-bold text-ink sm:text-4xl">
            Minimally invasive by training, precise by discipline
          </h2>
          <p className="mt-4 max-w-lg text-ink-muted">
            Dr. Peerzada Faisal Masood trained specifically in minimally
            invasive urology — laparoscopic and robotic surgery — at AIIMS,
            Delhi, on top of a foundation in general surgery, renal
            transplant, and urology. That training shapes how every case is
            approached: not technology for its own sake, but a genuine
            commitment to treating the problem thoroughly while asking as
            little as possible of the patient&apos;s body and recovery.
          </p>
        </Reveal>
        <Reveal
          delay={0.15}
          className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-card bg-navy-light"
        >
          {image ? (
            <Image
              src={image}
              alt="Minimally invasive and robotic surgical approach"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center text-sm text-ink-faint">
              Image will appear here once uploaded via the CMS
            </div>
          )}
        </Reveal>
      </div>

      <RevealStagger className="mt-16 grid gap-6 sm:grid-cols-3">
        {highlights.map((item) => (
          <StaggerItem key={item.title} className="flip-card h-56">
            <div className="flip-card-inner h-full w-full">
              {/* Front face */}
              <div className="flip-card-face flex h-full flex-col rounded-card border border-ink-muted/15 bg-navy-light p-6 shadow-glow">
                <span className="crosshair-mark" aria-hidden="true" />
                <h3 className="mt-3 text-lg font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-ink-muted">
                  {item.description}
                </p>
              </div>
              {/* Back face — inverted colors, more detail */}
              <div className="flip-card-face flip-card-back flex h-full flex-col justify-center rounded-card bg-accent p-6">
                <h3 className="text-lg font-bold text-navy-deep">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-navy-deep">
                  {item.detail}
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </RevealStagger>
    </Section>
  );
}
