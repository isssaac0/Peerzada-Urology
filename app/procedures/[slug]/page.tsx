import { notFound } from "next/navigation";
import {
  getSurgicalProcedureBySlug,
  getSurgicalProcedures,
} from "@/lib/content";
import { formatDate } from "@/lib/publication";
import { ProcedureCase } from "@/components/procedures/ProcedureCase";

export const dynamicParams = false;

export function generateStaticParams() {
  return getSurgicalProcedures().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const procedure = getSurgicalProcedureBySlug(params.slug);
  if (!procedure) return { title: "Surgical Procedures" };
  return {
    title: procedure.title,
    description: procedure.description.replace(/\s+/g, " ").slice(0, 160),
  };
}

export default function ProcedurePage({
  params,
}: {
  params: { slug: string };
}) {
  const procedure = getSurgicalProcedureBySlug(params.slug);
  if (!procedure) notFound();

  const count = procedure.steps.length;
  const date = procedure.date
    ? formatDate(
        procedure.date,
        { day: "numeric", month: "long", year: "numeric" },
        "UTC"
      )
    : "";
  const meta = `${count} ${count === 1 ? "stage" : "stages"}${date ? ` · ${date}` : ""}`;

  return (
    <main className="bg-navy">
      <ProcedureCase
        title={procedure.title}
        category={procedure.category}
        description={procedure.description}
        meta={meta}
        steps={procedure.steps}
        contentWarning={procedure.contentWarning}
      />
    </main>
  );
}
