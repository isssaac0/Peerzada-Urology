import Link from "next/link";
import Image from "next/image";
import type { Service } from "@/types/content";
import { Section, SectionEyebrow } from "@/components/ui/Section";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { Reveal, RevealStagger, StaggerItem } from "@/components/ui/Reveal";

export function ServicesGrid({
  services,
  heading = "Specialized Care, Focused on Precision",
  tone = "navy-light",
}: {
  services: Service[];
  heading?: string;
  tone?: "navy" | "navy-light";
}) {
  return (
    <Section tone={tone} id="services">
      <Reveal>
        <SectionEyebrow>Solutions Offered</SectionEyebrow>
        <h2 className="max-w-2xl text-3xl font-bold text-ink sm:text-4xl">
          {heading}
        </h2>
      </Reveal>

      <RevealStagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <StaggerItem key={service.slug}>
            <Link
              href={`/services/${service.slug}`}
              className="group block h-full overflow-hidden rounded-card border border-ink-muted/15 bg-navy shadow-glow transition-all duration-300 hover:-translate-y-1 hover:border-accent"
            >
              {service.heroImage ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={service.heroImage}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : null}
              <div className="p-6">
                <ServiceIcon icon={service.icon} />
                <h3 className="mt-4 text-lg font-semibold text-ink group-hover:text-accent">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm text-ink-muted">
                  {service.shortDescription}
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-accent">
                  Learn more →
                </span>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </RevealStagger>
    </Section>
  );
}
