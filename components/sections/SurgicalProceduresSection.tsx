import Link from "next/link";
import type { SurgicalProcedure } from "@/types/content";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ProcedureGrid } from "@/components/sections/ProcedureCard";

// Maximum number of procedures shown on the homepage. The rest live on /procedures.
const HOME_PROCEDURE_LIMIT = 6;

// Homepage section. Placed immediately after Training & Credentials
// (see app/page.tsx). The anchor id is referenced by the header link.
export function SurgicalProceduresSection({
  procedures,
}: {
  procedures: SurgicalProcedure[];
}) {
  const visible = procedures.slice(0, HOME_PROCEDURE_LIMIT);
  const hasMore = procedures.length > HOME_PROCEDURE_LIMIT;

  return (
    <Section id="surgical-procedures" className="sm:!py-28">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="section-eyebrow">
            <span className="crosshair-mark" aria-hidden="true" />
            Surgical Procedures
          </p>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Surgery, shown one stage at a time
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-ink-muted">
            Selected procedures, photographed at each stage and titled by the
            surgeon. Every case is published with the patient&apos;s consent.
          </p>
        </div>
        {procedures.length > 0 ? (
          <Link
            href="/procedures"
            className="text-sm font-semibold text-accent hover:text-accent-light"
          >
            Explore surgical procedures →
          </Link>
        ) : null}
      </Reveal>

      {procedures.length === 0 ? (
        <p className="mt-12 text-ink-muted">
          Surgical procedures will appear here once added through the content
          manager.
        </p>
      ) : (
        <Reveal className="mt-14">
          <ProcedureGrid procedures={visible} />
          {hasMore ? (
            <div className="mt-12 flex justify-center">
              <Link
                href="/procedures"
                className="inline-flex items-center gap-2 rounded-full border border-accent/40 px-7 py-3 text-sm font-semibold text-accent transition hover:border-accent hover:bg-accent/10"
              >
                Explore surgical procedures
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : null}
        </Reveal>
      )}
    </Section>
  );
}
