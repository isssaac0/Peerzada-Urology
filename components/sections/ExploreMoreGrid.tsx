import Link from "next/link";
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealStagger, StaggerItem } from "@/components/ui/Reveal";

const items = [
  {
    title: "Credentials & Training",
    href: "/credentials",
    cta: "Click to know more",
    image: "https://picsum.photos/seed/explore-credentials/500/500",
  },
  {
    title: "Awards & Achievements",
    href: "/awards",
    cta: "Click to know more",
    image: "https://picsum.photos/seed/explore-awards/500/500",
  },
  {
    title: "Research Papers",
    href: "/research",
    cta: "View publications",
    image: "https://picsum.photos/seed/explore-research/500/500",
  },
];

export function ExploreMoreGrid({ doctorName }: { doctorName: string }) {
  return (
    <Section>
      <Reveal className="text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent">
          <span className="crosshair-mark" aria-hidden="true" />
          Know More About {doctorName}
        </div>
        <h2 className="mx-auto max-w-2xl text-3xl font-bold text-ink sm:text-4xl">
          Explore more and get to know {doctorName} better
        </h2>
      </Reveal>

      <RevealStagger className="mt-10 grid gap-6 sm:grid-cols-3">
        {items.map((item) => (
          <StaggerItem key={item.title}>
            <Link
              href={item.href}
              className="group flex items-center gap-4 overflow-hidden rounded-card border border-ink-muted/15 bg-navy-light p-4 shadow-glow transition-colors hover:border-accent"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-card">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-ink group-hover:text-accent">
                  {item.title}
                </p>
                <span className="mt-1 inline-block text-sm text-accent">
                  {item.cta} →
                </span>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </RevealStagger>
    </Section>
  );
}
