import { getPatientJourneyPhases } from "@/lib/content";
import { PatientJourneyGrid } from "@/components/sections/PatientJourneyGrid";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = {
  title: "Patient Journey",
};

export default async function PatientJourneyPage() {
  const phases = await getPatientJourneyPhases();

  return (
    <main>
      <section className="bg-navy-radial pb-12 pt-28 sm:pb-16 sm:pt-36">
        <Reveal className="mx-auto w-full max-w-3xl px-6 text-center">
          <h1 className="text-3xl font-bold text-ink sm:text-5xl">
            Understanding Your Patient Journey
          </h1>
          <p className="mt-4 text-ink-muted sm:text-lg">
            From planning through recovery — a clear look at each phase of
            treatment, so you always know what comes next.
          </p>
        </Reveal>
      </section>
      <PatientJourneyGrid phases={phases} />
    </main>
  );
}
