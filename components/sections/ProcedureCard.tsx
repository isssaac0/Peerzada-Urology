import Link from "next/link";
import type { SurgicalProcedure } from "@/types/content";
import { ProcedureCollage } from "@/components/procedures/ProcedureCollage";
import { formatDate } from "@/lib/publication";

export function ProcedureCard({ procedure }: { procedure: SurgicalProcedure }) {
  const count = procedure.steps.length;
  const date = procedure.date
    ? formatDate(procedure.date, { month: "short", year: "numeric" }, "UTC")
    : "";
  return (
    <Link
      href={`/procedures/${procedure.slug}`}
      className="group block rounded-2xl focus-visible:outline-offset-4"
    >
      <ProcedureCollage
        steps={procedure.steps}
        title={procedure.title}
        blurred={procedure.contentWarning}
      />
      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
          {procedure.category}
          {date ? <span className="text-ink-faint"> · {date}</span> : null}
        </p>
        <h3 className="mt-1.5 text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
          {procedure.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-muted">
          {procedure.description.replace(/\s+/g, " ")}
        </p>
        <p className="mt-3 flex items-center justify-between text-sm">
          <span className="text-ink-faint">
            {count} {count === 1 ? "stage" : "stages"}
          </span>
          <span className="font-semibold text-accent">
            Explore procedure <span aria-hidden="true">→</span>
          </span>
        </p>
      </div>
    </Link>
  );
}

// Same grid as the Videos section: three across, then the next row.
export function ProcedureGrid({
  procedures,
}: {
  procedures: SurgicalProcedure[];
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {procedures.map((procedure) => (
        <ProcedureCard key={procedure.slug} procedure={procedure} />
      ))}
    </div>
  );
}
