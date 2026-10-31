import { notFound } from "next/navigation";
import {
  getPatientJourneyPhaseBySlug,
  getPatientJourneyPhaseSlugs,
} from "@/lib/content";
import { PatientJourneyDetail } from "@/components/sections/PatientJourneyDetail";

export async function generateStaticParams() {
  const slugs = await getPatientJourneyPhaseSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const phase = await getPatientJourneyPhaseBySlug(params.slug);
  return { title: phase ? phase.title : "Patient Journey" };
}

export default async function PatientJourneyPhasePage({
  params,
}: {
  params: { slug: string };
}) {
  const phase = await getPatientJourneyPhaseBySlug(params.slug);

  if (!phase) {
    notFound();
  }

  return (
    <main>
      <PatientJourneyDetail phase={phase} />
    </main>
  );
}
