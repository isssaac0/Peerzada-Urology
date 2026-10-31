import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { FRAME_RATIOS, MAX_ZOOM, type FrameRatio } from "@/lib/framing";
import type {
  DoctorProfile,
  Qualification,
  Award,
  Service,
  PatientJourneyPhase,
  ClinicTiming,
  GalleryItem,
  VideoItem,
  BlogPost,
  ResearchPaper,
  SurgicalProcedure,
  SurgicalStep,
  ImageFocus,
} from "@/types/content";

const CONTENT_DIR = path.join(process.cwd(), "content");

async function markdownToHtml(markdown: string): Promise<string> {
  if (!markdown) return "";
  const result = await remark().use(remarkHtml).process(markdown);
  return result.toString();
}

function readMarkdownFile(fullPath: string) {
  const raw = fs.readFileSync(fullPath, "utf8");
  return matter(raw);
}

// gray-matter (js-yaml) turns bare YAML timestamps into Date objects.
// Normalise to ISO strings so values are serialisable and predictable.
function toIsoString(value: unknown): string {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toISOString();
  }
  return typeof value === "string" ? value : "";
}

function finiteNumber(value: unknown): number | undefined {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
}

const clampNumber = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

const IMAGE_FOCI: ImageFocus[] = ["center", "top", "bottom", "left", "right"];

function listMarkdownFiles(dirName: string): string[] {
  const dirPath = path.join(CONTENT_DIR, dirName);
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(dirPath, file));
}

// ---------- Doctor Profile ----------

export async function getDoctorProfile(): Promise<DoctorProfile> {
  const fullPath = path.join(CONTENT_DIR, "doctor-profile.md");
  const { data, content } = readMarkdownFile(fullPath);
  const bioHtml = await markdownToHtml(content);

  return {
    name: data.name ?? "",
    credentials: data.credentials ?? "",
    title: data.title ?? "",
    hospital: data.hospital ?? "",
    hospitalLogo: data.hospitalLogo ?? undefined,
    yearsExperience: data.yearsExperience ?? undefined,
    surgeriesCount: data.surgeriesCount ?? undefined,
    patientsTreated: data.patientsTreated ?? undefined,
    tagline: data.tagline ?? "",
    heroImage: data.heroImage ?? undefined,
    bioHtml,
  };
}

// ---------- Qualifications ----------

export function getQualifications(): Qualification[] {
  const files = listMarkdownFiles("qualifications");
  const items = files.map((fullPath) => {
    const { data } = readMarkdownFile(fullPath);
    const item: Qualification = {
      degree: data.degree ?? "",
      institution: data.institution ?? "",
      logo: data.logo ?? undefined,
      order: data.order ?? 0,
    };
    return item;
  });
  return items.sort((a, b) => a.order - b.order);
}

// ---------- Awards & Achievements ----------

export function getAwards(): Award[] {
  const files = listMarkdownFiles("awards");
  const items = files.map((fullPath) => {
    const { data } = readMarkdownFile(fullPath);
    const item: Award = {
      title: data.title ?? "",
      description: data.description ?? undefined,
      certificateImage: data.certificateImage ?? undefined,
      order: data.order ?? 0,
    };
    return item;
  });
  return items.sort((a, b) => a.order - b.order);
}

// ---------- Services ----------

export async function getServices(): Promise<Service[]> {
  const files = listMarkdownFiles("services");

  const services = await Promise.all(
    files.map(async (fullPath) => {
      const { data, content } = readMarkdownFile(fullPath);
      const summaryHtml = await markdownToHtml(content);
      const slug = path.basename(fullPath, ".md");

      const service: Service = {
        slug,
        title: data.title ?? "",
        shortDescription: data.shortDescription ?? "",
        icon: data.icon ?? "endourology",
        order: data.order ?? 0,
        heroImage: data.heroImage ?? undefined,
        heroImageCard: data.heroImageCard ?? undefined,
        heroImageExplorer: data.heroImageExplorer ?? undefined,
        heroFocus: IMAGE_FOCI.includes(data.heroFocus)
          ? (data.heroFocus as ImageFocus)
          : undefined,
        images: data.images ?? undefined,
        explainerVideoUrl: data.explainerVideoUrl ?? undefined,
        problemDiagnosisHeading: data.problemDiagnosisHeading ?? "",
        problemDiagnosisBody: data.problemDiagnosisBody ?? "",
        procedurePrecisionHeading: data.procedurePrecisionHeading ?? "",
        procedurePrecisionBody: data.procedurePrecisionBody ?? "",
        lifeRecoveryHeading: data.lifeRecoveryHeading ?? "",
        lifeRecoveryBody: data.lifeRecoveryBody ?? "",
        trifectaOutcomes: data.trifectaOutcomes ?? [],
        summaryHtml,
        faqs: data.faqs ?? [],
      };
      return service;
    })
  );

  return services.sort((a, b) => a.order - b.order);
}

export async function getServiceBySlug(
  slug: string
): Promise<Service | null> {
  const services = await getServices();
  return services.find((service) => service.slug === slug) ?? null;
}

export async function getServiceSlugs(): Promise<string[]> {
  const files = listMarkdownFiles("services");
  return files.map((fullPath) => path.basename(fullPath, ".md"));
}

// ---------- Patient Journey ----------

export async function getPatientJourneyPhases(): Promise<
  PatientJourneyPhase[]
> {
  const files = listMarkdownFiles("patient-journey");

  const phases = await Promise.all(
    files.map(async (fullPath) => {
      const { data, content } = readMarkdownFile(fullPath);
      const bodyHtml = await markdownToHtml(content);
      const slug = path.basename(fullPath, ".md");

      const phase: PatientJourneyPhase = {
        slug,
        order: data.order ?? 0,
        phaseLabel: data.phaseLabel ?? "",
        title: data.title ?? "",
        summary: data.summary ?? "",
        image: data.image ?? undefined,
        keyPoints: data.keyPoints ?? undefined,
        bodyHtml,
        faqs: data.faqs ?? [],
        recoveryMilestones: data.recoveryMilestones ?? undefined,
        urineColorGuide: data.urineColorGuide ?? undefined,
        symptomChecklist: data.symptomChecklist ?? undefined,
      };
      return phase;
    })
  );

  return phases.sort((a, b) => a.order - b.order);
}

export async function getPatientJourneyPhaseBySlug(
  slug: string
): Promise<PatientJourneyPhase | null> {
  const phases = await getPatientJourneyPhases();
  return phases.find((phase) => phase.slug === slug) ?? null;
}

export async function getPatientJourneyPhaseSlugs(): Promise<string[]> {
  const files = listMarkdownFiles("patient-journey");
  return files.map((fullPath) => path.basename(fullPath, ".md"));
}

// ---------- Clinic Timings ----------
// Left empty by design — the doctor populates these himself via the CMS.

export function getClinicTimings(): ClinicTiming[] {
  const files = listMarkdownFiles("clinic-timings");
  return files.map((fullPath) => {
    const { data } = readMarkdownFile(fullPath);
    const item: ClinicTiming = {
      hospitalName: data.hospitalName ?? "",
      location: data.location ?? "",
      days: data.days ?? "",
      hours: data.hours ?? "",
      mapUrl: data.mapUrl ?? undefined,
      proTip: data.proTip ?? undefined,
    };
    return item;
  });
}

// ---------- Gallery ----------
// Left empty by design — the doctor uploads photos himself via the CMS.

export function getGalleryItems(): GalleryItem[] {
  const files = listMarkdownFiles("gallery");
  return files.map((fullPath) => {
    const { data } = readMarkdownFile(fullPath);
    const item: GalleryItem = {
      image: data.image ?? "",
      caption: data.caption ?? undefined,
    };
    return item;
  });
}

// ---------- Videos ----------
// Left empty by design — the doctor adds videos himself via the CMS.

export function getVideos(): VideoItem[] {
  const files = listMarkdownFiles("videos");
  return files.map((fullPath) => {
    const { data } = readMarkdownFile(fullPath);
    const item: VideoItem = {
      title: data.title ?? "",
      url: data.url ?? "",
      thumbnail: data.thumbnail ?? undefined,
    };
    return item;
  });
}

// ---------- Blog Posts ----------

export async function getBlogPosts(): Promise<BlogPost[]> {
  const files = listMarkdownFiles("blog");

  const posts = await Promise.all(
    files.map(async (fullPath) => {
      const { data, content } = readMarkdownFile(fullPath);
      const bodyHtml = await markdownToHtml(content);
      const slug = path.basename(fullPath, ".md");

      const post: BlogPost = {
        slug,
        title: data.title ?? "",
        date: data.date ?? "",
        excerpt: data.excerpt ?? "",
        bodyHtml,
        coverImage: data.coverImage ?? undefined,
      };
      return post;
    })
  );

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getBlogPostSlugs(): Promise<string[]> {
  const files = listMarkdownFiles("blog");
  return files.map((fullPath) => path.basename(fullPath, ".md"));
}

// ---------- Research Papers ----------

export function getResearchPapers(): ResearchPaper[] {
  const files = listMarkdownFiles("research");
  const papers = files
    .map((fullPath) => {
      const { data } = readMarkdownFile(fullPath);
      const slug = path.basename(fullPath, ".md");
      const authors = Array.isArray(data.authors)
        ? (data.authors as unknown[])
            .map((a) => (typeof a === "string" ? a.trim() : ""))
            .filter(Boolean)
        : [];
      const paper: ResearchPaper & { draft: boolean } = {
        slug,
        title: data.title ?? "",
        authors: authors.length ? authors : undefined,
        journal: data.journal ?? undefined,
        date: toIsoString(data.date),
        doi: data.doi ? String(data.doi).trim() : undefined,
        abstract: data.abstract ?? "",
        pdfFile: data.pdfFile ?? undefined,
        externalLink: data.externalLink ?? undefined,
        // Entries created before the Draft field existed have none and
        // are therefore treated as published.
        draft: data.draft === true,
      };
      return paper;
    })
    .filter((paper) => !paper.draft)
    .map(({ draft: _draft, ...paper }): ResearchPaper => paper);
  return papers.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// ---------- Surgical Procedures ----------
// A procedure only appears on the site when it is (a) not a draft and
// (b) explicitly marked as having patient consent. Both are CMS checkboxes.

export function getSurgicalProcedures(): SurgicalProcedure[] {
  const files = listMarkdownFiles("procedures");
  const procedures: SurgicalProcedure[] = [];

  for (const fullPath of files) {
    const { data, content } = readMarkdownFile(fullPath);
    if (data.draft === true) continue;
    if (data.consentConfirmed !== true) continue;

    const rawSteps: unknown[] = Array.isArray(data.steps) ? data.steps : [];
    const steps: SurgicalStep[] = rawSteps
      .map((raw, index) => {
        const step = (raw ?? {}) as Record<string, unknown>;
        const image = typeof step.image === "string" ? step.image : "";
        const title =
          typeof step.title === "string" && step.title.trim()
            ? step.title.trim()
            : `Step ${index + 1}`;
        const result: SurgicalStep = { image, title };

        // Optional framing — anything missing or invalid is simply ignored.
        // Accept "4:3" too, in case an entry was edited by hand.
        const ratio = (
          typeof step.ratio === "string" ? step.ratio.replace(":", "x") : ""
        ) as FrameRatio;
        if (FRAME_RATIOS.includes(ratio)) result.ratio = ratio;
        const zoom = finiteNumber(step.zoom);
        if (zoom !== undefined) result.zoom = clampNumber(zoom, 1, MAX_ZOOM);
        const focusX = finiteNumber(step.focusX);
        if (focusX !== undefined) result.focusX = clampNumber(focusX, 0, 100);
        const focusY = finiteNumber(step.focusY);
        if (focusY !== undefined) result.focusY = clampNumber(focusY, 0, 100);
        const width = finiteNumber(step.width);
        const height = finiteNumber(step.height);
        if (width && height && width > 0 && height > 0) {
          result.width = Math.round(width);
          result.height = Math.round(height);
        }
        return result;
      })
      .filter((step) => step.image);

    if (steps.length === 0) continue;

    const description =
      typeof data.description === "string" && data.description.trim()
        ? data.description.trim()
        : content.trim();

    procedures.push({
      slug: path.basename(fullPath, ".md"),
      title: data.title ?? "",
      category: data.category ?? "",
      description,
      date: toIsoString(data.date) || undefined,
      contentWarning: data.contentWarning !== false,
      steps,
    });
  }

  // Newest first; undated procedures follow, alphabetically.
  return procedures.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.title.localeCompare(b.title);
  });
}

export function getSurgicalProcedureBySlug(
  slug: string
): SurgicalProcedure | null {
  return getSurgicalProcedures().find((p) => p.slug === slug) ?? null;
}
