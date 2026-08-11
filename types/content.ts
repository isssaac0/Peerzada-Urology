// Shared content types. Every one of these maps directly to a Decap CMS
// collection (see public/admin/config.yml once Stage 4 is built) — the
// fields here should stay in sync with the fields defined there.

export interface DoctorProfile {
  name: string;
  credentials: string;
  title: string;
  hospital: string;
  hospitalLogo?: string;
  tagline: string;
  heroImage?: string;
  yearsExperience?: string;
  surgeriesCount?: string;
  patientsTreated?: string;
  bioHtml: string;
}

export interface Qualification {
  degree: string;
  institution: string;
  logo?: string;
  order: number;
}

export interface Award {
  title: string;
  description?: string;
  certificateImage?: string;
  order: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TrifectaOutcome {
  title: string;
  promise: string;
  technique: string;
  execution: string[];
  win: string;
}

export interface Service {
  slug: string;
  title: string;
  shortDescription: string;
  icon: ServiceIconKey;
  order: number;
  heroImage?: string;
  images?: string[];
  explainerVideoUrl?: string;
  problemDiagnosisHeading: string;
  problemDiagnosisBody: string;
  procedurePrecisionHeading: string;
  procedurePrecisionBody: string;
  lifeRecoveryHeading: string;
  lifeRecoveryBody: string;
  trifectaOutcomes: TrifectaOutcome[];
  summaryHtml: string;
  faqs: FaqItem[];
}

// One simple custom SVG icon per specialty (see components/ui/ServiceIcon.tsx) —
// deliberately not reusing the reference site's 3D renders, which are that
// site's own paid/custom assets.
export type ServiceIconKey =
  | "endourology"
  | "uro-oncology"
  | "andrology"
  | "reconstructive-urology"
  | "renal-transplant"
  | "laparoscopy-robotic";

export interface RecoveryMilestone {
  day: string;
  label: string;
  detail: string;
}

export type GuideSeverity = "normal" | "caution" | "emergency";

export interface UrineColorGuideEntry {
  label: string;
  hex: string;
  guidance: string;
  severity: GuideSeverity;
}

export interface SymptomChecklistEntry {
  symptom: string;
  verdict: GuideSeverity;
  guidance: string;
}

export interface PatientJourneyPhase {
  slug: string;
  order: number;
  phaseLabel: string;
  title: string;
  summary: string;
  image?: string;
  keyPoints?: string[];
  bodyHtml: string;
  faqs: FaqItem[];
  recoveryMilestones?: RecoveryMilestone[];
  urineColorGuide?: UrineColorGuideEntry[];
  symptomChecklist?: SymptomChecklistEntry[];
}

export interface ClinicTiming {
  hospitalName: string;
  location: string;
  days: string;
  hours: string;
  mapUrl?: string;
  proTip?: string;
}

export interface GalleryItem {
  image: string;
  caption?: string;
}

export interface VideoItem {
  title: string;
  url: string;
  thumbnail?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  bodyHtml: string;
  coverImage?: string;
}

export interface ResearchPaper {
  slug: string;
  title: string;
  journal?: string;
  date: string;
  abstract: string;
  pdfFile?: string;
  externalLink?: string;
}
