import Image from "next/image";
import { getDoctorProfile, getQualifications } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealStagger, StaggerItem } from "@/components/ui/Reveal";

export const metadata = {
  title: "Credentials & Training",
};

export default async function CredentialsPage() {
  const [profile, qualifications] = await Promise.all([
    getDoctorProfile(),
    Promise.resolve(getQualifications()),
  ]);

  return (
    <main>
      <section className="bg-navy-radial pb-16 pt-28 sm:pb-20 sm:pt-36">
        <Reveal className="mx-auto w-full max-w-3xl px-6 text-center">
          <h1 className="text-3xl font-bold text-ink sm:text-5xl">
            The Training Behind the Practice
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink-muted sm:text-lg">
            Every stage below built directly on the one before it — a
            straight line from a general medical foundation to
            fellowship-level surgical specialization.
          </p>
        </Reveal>
      </section>

      {/* A vertical story timeline, deliberately different from the
          homepage's marquee + compact grid — each stage gets real space
          and its own narrative, one at a time, rather than being
          summarized in a quick-scan format. */}
      <Section>
        <div className="relative mx-auto max-w-3xl">
          <div
            className="absolute bottom-0 left-6 top-0 w-px bg-ink-muted/15"
            aria-hidden="true"
          />
          <RevealStagger className="space-y-16">
            {qualifications.map((q, index) => (
              <StaggerItem key={q.degree} className="relative pl-16">
                <span className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent bg-navy text-lg font-bold text-accent shadow-glow">
                  {index + 1}
                </span>
                <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-ink">{q.degree}</h2>
                    {q.institution ? (
                      <p className="mt-1 text-accent">{q.institution}</p>
                    ) : null}
                  </div>
                  {q.logo ? (
                    <div className="relative h-16 w-32 shrink-0 rounded-card bg-white/95 p-3">
                      <Image
                        src={q.logo}
                        alt={q.institution}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  ) : null}
                </div>
              </StaggerItem>
            ))}
          </RevealStagger>
        </div>
      </Section>

      <Section tone="navy-light">
        <Reveal
          className="prose prose-invert mx-auto max-w-3xl prose-headings:font-heading prose-headings:text-ink prose-p:leading-relaxed prose-p:text-ink-muted"
        >
          <h2>Why this progression matters</h2>
          <p>
            This isn&apos;t training that stopped once a degree was earned.
            {profile.name} moved deliberately from a broad surgical
            foundation into an increasingly specialized track — general
            surgery, then renal transplant and urology specifically, then
            focused, hands-on training in minimally invasive and robotic
            technique. The awards and fellowships recognized elsewhere on
            this site were largely earned during and immediately after this
            training period, a reflection of how seriously that foundation
            was built.
          </p>
        </Reveal>
      </Section>
    </main>
  );
}
