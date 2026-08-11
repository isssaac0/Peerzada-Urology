import { getResearchPapers } from "@/lib/content";
import { Section, SectionEyebrow } from "@/components/ui/Section";
import { Reveal, RevealStagger, StaggerItem } from "@/components/ui/Reveal";

export const metadata = {
  title: "Research Papers",
};

export default function ResearchPage() {
  const papers = getResearchPapers();

  return (
    <main>
      <section className="bg-navy-radial pb-16 pt-28 sm:pb-20 sm:pt-36">
        <Reveal className="mx-auto w-full max-w-3xl px-6 text-center">
          <h1 className="text-3xl font-bold text-ink sm:text-5xl">
            Research Papers
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink-muted sm:text-lg">
            Published research and academic work, available to read or
            download.
          </p>
        </Reveal>
      </section>

      <Section>
        <SectionEyebrow>Publications</SectionEyebrow>
        {papers.length === 0 ? (
          <p className="text-ink-muted">
            Research papers will appear here once added through the content
            manager.
          </p>
        ) : (
          <RevealStagger className="mt-10 grid gap-6 sm:grid-cols-2">
            {papers.map((paper) => {
              const link = paper.pdfFile ?? paper.externalLink;
              return (
                <StaggerItem
                  key={paper.slug}
                  className="rounded-card border border-ink-muted/15 bg-navy-light p-6 shadow-glow"
                >
                  {paper.date ? (
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                      {new Date(paper.date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                  ) : null}
                  <h2 className="mt-2 text-lg font-semibold text-ink">
                    {paper.title}
                  </h2>
                  {paper.journal ? (
                    <p className="mt-1 text-sm italic text-ink-muted">
                      {paper.journal}
                    </p>
                  ) : null}
                  <p className="mt-3 text-sm text-ink-muted">
                    {paper.abstract}
                  </p>
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block text-sm font-semibold text-accent hover:text-accent-light"
                    >
                      Read the paper →
                    </a>
                  ) : null}
                </StaggerItem>
              );
            })}
          </RevealStagger>
        )}
      </Section>
    </main>
  );
}
