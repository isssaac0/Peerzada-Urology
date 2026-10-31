// Display-only helpers for the research library. Nothing here changes the
// stored CMS content — it only decides how existing text is laid out.

// Matches Vancouver-style author lists such as
// "Masood PF, Jain S, Bhusal I, Nayyar R, Seth A"
const AUTHOR_LIST = /^(?:[A-Z][\p{L}'’-]+(?: [\p{L}'’-]+)* [A-Z]{1,4})(?:, (?:[A-Z][\p{L}'’-]+(?: [\p{L}'’-]+)* [A-Z]{1,4}))*$/u;

/**
 * Older entries were typed as a full citation in the title field
 * ("Authors. Title. "). If — and only if — the text before the first
 * ". " is unmistakably an author list, split it out for display.
 * Otherwise the title is returned untouched.
 */
export function splitCitationTitle(title: string): {
  title: string;
  authors: string[];
} {
  const trimmed = title.replace(/\s+/g, " ").trim();
  const idx = trimmed.indexOf(". ");
  if (idx > 0) {
    const head = trimmed.slice(0, idx);
    const rest = trimmed.slice(idx + 2).trim();
    if (rest && AUTHOR_LIST.test(head)) {
      return {
        title: rest.replace(/[\s.]+$/, ""),
        authors: head.split(", ").map((a) => a.trim()),
      };
    }
  }
  return { title: trimmed, authors: [] };
}

export type AbstractSection = { heading?: string; text: string };

// Structured-abstract headings, in the order they normally appear.
const HEADINGS = [
  "Background",
  "Introduction",
  "Objectives?",
  "Aims?",
  "Purpose",
  "Materials and methods",
  "Patients and methods",
  "Methods",
  "Results",
  "Conclusions?",
];
const HEADING_RE = new RegExp(`(?:^|\\s)(${HEADINGS.join("|")})(?=\\s+[A-Z0-9])`, "g");

/**
 * Splits an abstract that was pasted as one run-on string
 * ("Objectives … Materials and methods … Results … Conclusion …") into
 * labelled sections. Falls back to a single paragraph when fewer than two
 * recognised headings are found. The wording itself is never altered.
 */
export function splitAbstract(abstract: string): AbstractSection[] {
  const text = abstract.replace(/\s+/g, " ").trim();
  if (!text) return [];

  const hits: { heading: string; start: number; bodyStart: number }[] = [];
  HEADING_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = HEADING_RE.exec(text))) {
    const start = m.index + (m[0].length - m[1].length);
    hits.push({ heading: m[1], start, bodyStart: start + m[1].length });
  }
  if (hits.length < 2) return [{ text }];

  const sections: AbstractSection[] = [];
  if (hits[0].start > 0) {
    const lead = text.slice(0, hits[0].start).trim();
    if (lead) sections.push({ text: lead });
  }
  hits.forEach((hit, i) => {
    const end = i + 1 < hits.length ? hits[i + 1].start : text.length;
    sections.push({
      heading: hit.heading,
      text: text.slice(hit.bodyStart, end).trim(),
    });
  });
  return sections;
}

export function normaliseDoi(doi: string): string {
  return doi
    .trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "");
}

export function doiUrl(doi: string): string {
  return `https://doi.org/${normaliseDoi(doi)}`;
}

export function formatDate(
  iso: string,
  options: Intl.DateTimeFormatOptions,
  timeZone: string
): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { ...options, timeZone });
}
