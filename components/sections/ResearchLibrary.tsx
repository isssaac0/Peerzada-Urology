"use client";

import { useId, useState } from "react";
import type { ResearchPaper } from "@/types/content";
import {
  doiUrl,
  formatDate,
  normaliseDoi,
  splitAbstract,
  splitCitationTitle,
} from "@/lib/publication";

// Collapsing only helps when there is something worth collapsing.
const COLLAPSE_THRESHOLD = 360;
// Publication dates are entered in IST; formatting in a fixed zone keeps
// server and browser output identical.
const TZ = "Asia/Kolkata";

function AuthorLine({
  authors,
  highlight,
}: {
  authors: string[];
  highlight?: string;
}) {
  const key = highlight?.toLowerCase();
  return (
    <p className="mt-3 text-sm leading-relaxed text-ink-muted">
      {authors.map((author, i) => {
        const isDoctor = key ? author.toLowerCase().includes(key) : false;
        return (
          <span key={`${author}-${i}`}>
            {isDoctor ? (
              <strong className="font-semibold text-ink">{author}</strong>
            ) : (
              author
            )}
            {i < authors.length - 1 ? ", " : ""}
          </span>
        );
      })}
    </p>
  );
}

function ActionLink({
  href,
  children,
  variant = "secondary",
  download = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  download?: boolean;
}) {
  const classes =
    variant === "primary"
      ? "bg-accent text-white hover:bg-accent-dark"
      : "border border-ink-muted/40 text-ink hover:border-accent hover:text-accent";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...(download ? { download: true } : {})}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${classes}`}
    >
      {children}
    </a>
  );
}

function Publication({
  paper,
  doctorSurname,
}: {
  paper: ResearchPaper;
  doctorSurname?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const abstractId = useId();

  // Older entries typed the whole citation into the title field. If the
  // text before the first full stop is clearly an author list, lay it out
  // as authors + title; the stored entry itself is never changed.
  const split = splitCitationTitle(paper.title);
  const authors = paper.authors?.length ? paper.authors : split.authors;
  const title = paper.authors?.length
    ? paper.title.replace(/\s+/g, " ").trim()
    : split.title;

  const sections = splitAbstract(paper.abstract);
  const plainAbstract = paper.abstract.replace(/\s+/g, " ").trim();
  const collapsible = plainAbstract.length > COLLAPSE_THRESHOLD;

  const year = paper.date
    ? formatDate(paper.date, { year: "numeric" }, TZ)
    : "";
  const fullDate = paper.date
    ? formatDate(paper.date, { day: "numeric", month: "long", year: "numeric" }, TZ)
    : "";

  const doi = paper.doi ? normaliseDoi(paper.doi) : "";
  const hasDoi = doi.length > 0;
  // Offer "View Publication" for a stored link, or via the DOI when no
  // separate link was provided.
  const publicationHref = paper.externalLink || (hasDoi ? doiUrl(doi) : "");

  return (
    <article className="grid gap-4 border-t border-ink-muted/15 py-10 first:border-t-0 first:pt-0 md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-10">
      <div className="md:pt-1">
        {year ? (
          <p className="font-heading text-2xl font-bold tabular-nums text-ink">
            {year}
          </p>
        ) : null}
        {fullDate ? (
          <p className="mt-1 text-xs text-ink-faint">
            <time dateTime={paper.date}>{fullDate}</time>
          </p>
        ) : null}
      </div>

      <div className="min-w-0">
        {paper.journal ? (
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            {paper.journal}
          </p>
        ) : null}
        <h2 className="mt-2 font-heading text-xl font-bold leading-snug text-ink sm:text-2xl">
          {title}
        </h2>

        {authors.length > 0 ? (
          <AuthorLine authors={authors} highlight={doctorSurname} />
        ) : null}

        {hasDoi ? (
          <p className="mt-2 text-xs text-ink-faint">
            DOI{" "}
            <a
              href={doiUrl(doi)}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-medium text-ink-muted underline decoration-ink-muted/40 underline-offset-2 hover:text-accent hover:decoration-accent"
            >
              {doi}
            </a>
          </p>
        ) : null}

        {plainAbstract ? (
          <div className="mt-6 border-l-2 border-ink-muted/20 pl-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Abstract
            </p>

            <div id={abstractId} className="mt-2">
              {collapsible && !expanded ? (
                <p className="line-clamp-4 text-sm leading-relaxed text-ink-muted">
                  {plainAbstract}
                </p>
              ) : sections.length > 1 || sections[0]?.heading ? (
                <dl className="space-y-3">
                  {sections.map((section, i) => (
                    <div key={`${section.heading ?? "lead"}-${i}`}>
                      {section.heading ? (
                        <dt className="text-xs font-semibold uppercase tracking-wider text-ink">
                          {section.heading}
                        </dt>
                      ) : null}
                      <dd className="mt-0.5 text-sm leading-relaxed text-ink-muted">
                        {section.text}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm leading-relaxed text-ink-muted">
                  {plainAbstract}
                </p>
              )}
            </div>

            {collapsible ? (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-controls={abstractId}
                className="mt-3 text-sm font-semibold text-accent hover:text-accent-light"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Actions are rendered only for resources that actually exist. */}
        {paper.pdfFile || publicationHref ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {paper.pdfFile ? (
              <ActionLink href={paper.pdfFile} variant="primary">
                Read Research Paper
              </ActionLink>
            ) : null}
            {publicationHref ? (
              <ActionLink href={publicationHref}>View Publication</ActionLink>
            ) : null}
            {paper.pdfFile ? (
              <ActionLink href={paper.pdfFile} download>
                Download PDF
              </ActionLink>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function ResearchLibrary({
  papers,
  doctorSurname,
}: {
  papers: ResearchPaper[];
  doctorSurname?: string;
}) {
  return (
    <div>
      {papers.map((paper) => (
        <Publication
          key={paper.slug}
          paper={paper}
          doctorSurname={doctorSurname}
        />
      ))}
    </div>
  );
}
