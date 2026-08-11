import { getVideos } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { VideosGrid } from "@/components/sections/VideosGrid";

export const metadata = {
  title: "Videos",
};

export default function VideosPage() {
  const videos = getVideos();

  return (
    <main>
      <section className="bg-navy-radial pb-12 pt-28 sm:pb-16 sm:pt-36">
        <div className="mx-auto w-full max-w-3xl px-6 text-center">
          <h1 className="text-3xl font-bold text-ink sm:text-5xl">Videos</h1>
        </div>
      </section>

      <Section>
        <VideosGrid videos={videos} />
      </Section>
    </main>
  );
}
