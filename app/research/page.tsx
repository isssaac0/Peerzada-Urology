import { getDoctorProfile, getResearchPapers } from "@/lib/content";
import { Section, SectionEyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ResearchLibrary } from "@/components/sections/ResearchLibrary";

export const metadata = {
  title: "Research & Publications",
};

export default async function ResearchPage() {
  const [papers, profile] = await Promise.all([
    Promise.resolve(getResearchPapers()),
    getDoctorProfile(),
  ]);

  // Used only to emphasise the doctor's own name in author lists.
  const surname = profile.name.trim().split(/\s+/).pop();

  return (
    <main>
      <section className="bg-navy-radial pb-16 pt-28 sm:pb-20 sm:pt-36">
        <Reveal className="mx-auto w-full max-w-3xl px-6 text-center">
          <h1 className="text-3xl font-bold text-ink sm:text-5xl">
            Research & Publications
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink-muted sm:text-lg">
            Published research and academic work, available to read or
            download where the paper is openly shared.
          </p>
        </Reveal>
      </section>

      <Section>
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-2 border-b border-ink-muted/15 pb-4">
          <SectionEyebrow>Publications</SectionEyebrow>
          {papers.length > 0 ? (
            <p className="text-sm text-ink-faint">
              {papers.length} {papers.length === 1 ? "publication" : "publications"}
            </p>
          ) : null}
        </div>

        {papers.length === 0 ? (
          <p className="text-ink-muted">
            Research papers will appear here once added through the content
            manager.
          </p>
        ) : (
          <Reveal>
            <ResearchLibrary papers={papers} doctorSurname={surname} />
          </Reveal>
        )}
      </Section>
    </main>
  );
}
