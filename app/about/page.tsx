import { getDoctorProfile, getQualifications, getAwards } from "@/lib/content";
import { QualificationsGrid } from "@/components/sections/QualificationsGrid";
import { AwardsGrid } from "@/components/sections/AwardsGrid";
import { TrainingStrip } from "@/components/sections/TrainingStrip";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = {
  title: "About the Doctor",
};

export default async function AboutPage() {
  const [profile, qualifications, awards] = await Promise.all([
    getDoctorProfile(),
    Promise.resolve(getQualifications()),
    Promise.resolve(getAwards()),
  ]);

  return (
    <main>
      <section className="bg-navy-radial pb-16 pt-28 sm:pb-20 sm:pt-36">
        <div className="mx-auto w-full max-w-3xl px-6 text-center">
          <h1 className="text-3xl font-bold text-ink sm:text-5xl">
            {profile.name}
          </h1>
          <p className="mt-3 font-medium text-accent">{profile.title}</p>
        </div>
      </section>

      <TrainingStrip
        qualifications={qualifications}
        practicingHospital={{ name: profile.hospital, logo: profile.hospitalLogo }}
      />

      <Section>
        <Reveal
          className="prose prose-invert mx-auto max-w-3xl prose-headings:font-heading prose-headings:text-ink prose-p:leading-relaxed prose-p:text-ink-muted prose-a:text-accent"
        >
          <div dangerouslySetInnerHTML={{ __html: profile.bioHtml }} />
        </Reveal>
      </Section>

      <QualificationsGrid qualifications={qualifications} />
      <AwardsGrid awards={awards} />
    </main>
  );
}
