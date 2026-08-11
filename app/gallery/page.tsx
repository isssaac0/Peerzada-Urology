import Image from "next/image";
import { getGalleryItems } from "@/lib/content";
import { Section, SectionEyebrow } from "@/components/ui/Section";
import { Reveal, RevealStagger, StaggerItem } from "@/components/ui/Reveal";

export const metadata = {
  title: "Gallery",
};

export default function GalleryPage() {
  const items = getGalleryItems();

  return (
    <main>
      <section className="bg-navy-radial pb-12 pt-28 sm:pb-16 sm:pt-36">
        <div className="mx-auto w-full max-w-3xl px-6 text-center">
          <h1 className="text-3xl font-bold text-ink sm:text-5xl">Gallery</h1>
        </div>
      </section>

      <Section>
        <Reveal>
          <SectionEyebrow>Photos</SectionEyebrow>
        </Reveal>
        {items.length === 0 ? (
          <p className="text-ink-muted">
            Photos will appear here once added through the content manager.
          </p>
        ) : (
          <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <StaggerItem
                key={`${item.image}-${index}`}
                className="group overflow-hidden rounded-card border border-ink-muted/15 bg-navy-light transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.caption ?? "Gallery photo"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {item.caption ? (
                  <figcaption className="p-4 text-sm text-ink-muted">
                    {item.caption}
                  </figcaption>
                ) : null}
              </StaggerItem>
            ))}
          </RevealStagger>
        )}
      </Section>
    </main>
  );
}
