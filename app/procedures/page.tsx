import { getSurgicalProcedures } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ProcedureGrid } from "@/components/sections/ProcedureCard";

export const metadata = {
  title: "Surgical Procedures",
};

export default function ProceduresPage() {
  const procedures = getSurgicalProcedures();

  return (
    <main>
      <section className="bg-navy-radial pb-14 pt-32 sm:pb-20 sm:pt-40">
        <Reveal className="mx-auto w-full max-w-6xl px-6">
          <p className="section-eyebrow">
            <span className="crosshair-mark" aria-hidden="true" />
            Surgical Procedures
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-6xl">
            Surgery, shown one stage at a time
          </h1>
          <p className="mt-6 max-w-xl leading-relaxed text-ink-muted sm:text-lg">
            Selected procedures photographed at each stage and titled by the
            surgeon. Every case is published with the patient&apos;s consent.
          </p>
        </Reveal>
      </section>

      <Section className="sm:!pt-20">
        {procedures.length === 0 ? (
          <p className="text-ink-muted">
            Surgical procedures will appear here once added through the
            content manager.
          </p>
        ) : (
          <ProcedureGrid procedures={procedures} />
        )}
      </Section>
    </main>
  );
}
