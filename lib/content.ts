import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
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
  const papers = files.map((fullPath) => {
    const { data } = readMarkdownFile(fullPath);
    const slug = path.basename(fullPath, ".md");
    const paper: ResearchPaper = {
      slug,
      title: data.title ?? "",
      journal: data.journal ?? undefined,
      date: data.date ?? "",
      abstract: data.abstract ?? "",
      pdfFile: data.pdfFile ?? undefined,
      externalLink: data.externalLink ?? undefined,
    };
    return paper;
  });
  return papers.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
