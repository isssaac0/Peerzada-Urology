import Image from "next/image";
import { getAwards } from "@/lib/content";
import { Section, SectionEyebrow } from "@/components/ui/Section";
import { Reveal, RevealStagger, StaggerItem } from "@/components/ui/Reveal";

export const metadata = {
  title: "Awards & Achievements",
};

export default async function AwardsPage() {
  const awards = getAwards();

  return (
    <main>
      <section className="bg-navy-radial pb-16 pt-28 sm:pb-20 sm:pt-36">
        <Reveal className="mx-auto w-full max-w-3xl px-6 text-center">
          <h1 className="text-3xl font-bold text-ink sm:text-5xl">
            Awards & Achievements
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink-muted sm:text-lg">
            National and international recognition earned across training
            and practice — for academic performance, published research,
            and surgical excellence.
          </p>
        </Reveal>
      </section>

      <Section>
        <Reveal
          className="prose prose-invert mx-auto max-w-3xl prose-headings:font-heading prose-headings:text-ink prose-p:leading-relaxed prose-p:text-ink-muted"
        >
          <p>
            These recognitions span the full arc of training — from early
            academic honors, through gold medals for surgical and
            examination performance, to travel fellowships and publication
            awards from national and international urological societies.
          </p>
        </Reveal>
      </Section>

      <Section tone="navy-light">
        <SectionEyebrow>All Recognitions</SectionEyebrow>
        <RevealStagger className="mt-10 grid gap-6 sm:grid-cols-2">
          {awards.map((award) => (
            <StaggerItem
              key={award.title}
              className="overflow-hidden rounded-card border border-ink-muted/15 bg-navy shadow-glow"
            >
              {award.certificateImage ? (
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={award.certificateImage}
                    alt={`${award.title} certificate`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="p-6">
                <p className="font-semibold text-ink">{award.title}</p>
                {award.description ? (
                  <p className="mt-2 text-sm text-ink-muted">
                    {award.description}
                  </p>
                ) : null}
              </div>
            </StaggerItem>
          ))}
        </RevealStagger>
      </Section>
    </main>
  );
}
