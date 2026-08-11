import {
  getDoctorProfile,
  getQualifications,
  getAwards,
  getServices,
  getPatientJourneyPhases,
  getVideos,
  getGalleryItems,
} from "@/lib/content";
import { Hero } from "@/components/sections/Hero";
import { TrainingStrip } from "@/components/sections/TrainingStrip";
import { QualificationsGrid } from "@/components/sections/QualificationsGrid";
import { AwardsFlowPath } from "@/components/sections/AwardsFlowPath";
import { SpecialtyExplorer } from "@/components/sections/SpecialtyExplorer";
import { PatientJourneyGrid } from "@/components/sections/PatientJourneyGrid";
import { ApproachHighlight } from "@/components/sections/ApproachHighlight";
import { ExploreMoreGrid } from "@/components/sections/ExploreMoreGrid";
import { VideoHighlights } from "@/components/sections/VideoHighlights";
import { GalleryCarousel } from "@/components/sections/GalleryCarousel";
import { StoryThread } from "@/components/ui/StoryThread";
import { EcgDivider } from "@/components/ui/EcgDivider";

export default async function Home() {
  const [profile, qualifications, awards, services, patientJourneyPhases] =
    await Promise.all([
      getDoctorProfile(),
      Promise.resolve(getQualifications()),
      Promise.resolve(getAwards()),
      getServices(),
      getPatientJourneyPhases(),
    ]);
  const videos = getVideos();
  const galleryItems = getGalleryItems();

  return (
    <main>
      <Hero profile={profile} />
      <StoryThread>
        <TrainingStrip
          qualifications={qualifications}
          practicingHospital={{ name: profile.hospital, logo: profile.hospitalLogo }}
        />
        <EcgDivider />
        <VideoHighlights videos={videos} />
        <EcgDivider />
        <QualificationsGrid qualifications={qualifications} direction="left" />
        <EcgDivider />
        <ApproachHighlight image="https://picsum.photos/seed/approach-highlight/900/700" />
        <EcgDivider />
        <SpecialtyExplorer services={services} />
        <EcgDivider />
        <PatientJourneyGrid phases={patientJourneyPhases} tone="navy" direction="right" />
        <EcgDivider />
        <AwardsFlowPath awards={awards} />
        <EcgDivider />
        <ExploreMoreGrid doctorName={profile.name} />
        <EcgDivider />
        <GalleryCarousel items={galleryItems} />
      </StoryThread>
    </main>
  );
}
