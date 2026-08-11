"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { GalleryItem } from "@/types/content";
import { Section, SectionEyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function GalleryCarousel({ items }: { items: GalleryItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-card]") as HTMLElement | null;
    const distance = card ? card.offsetWidth + 24 : 320;
    track.scrollBy({ left: distance * direction, behavior: "smooth" });
  };

  return (
    <Section tone="navy-light" id="gallery-preview">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionEyebrow>Gallery</SectionEyebrow>
          <h2 className="max-w-2xl text-3xl font-bold text-ink sm:text-4xl">
            A look inside the practice
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/gallery"
            className="text-sm font-semibold text-accent hover:text-accent-light"
          >
            View all images →
          </Link>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous images"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-muted/25 text-ink-muted transition-colors hover:border-accent hover:text-accent"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next images"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-muted/25 text-ink-muted transition-colors hover:border-accent hover:text-accent"
            >
              →
            </button>
          </div>
        </div>
      </Reveal>

      {items.length === 0 ? (
        <p className="mt-10 text-ink-muted">
          Photos will appear here once added through the content manager.
        </p>
      ) : (
        <div
          ref={trackRef}
          className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, index) => (
            <div
              key={`${item.image}-${index}`}
              data-card
              className="relative aspect-[3/4] w-56 shrink-0 snap-start overflow-hidden rounded-card border border-ink-muted/15 bg-navy shadow-glow sm:w-64"
            >
              <Image
                src={item.image}
                alt={item.caption ?? "Gallery photo"}
                fill
                className="object-cover"
              />
              {item.caption ? (
                <div className="absolute inset-x-0 bottom-0 bg-navy-deep/80 p-3 text-xs text-ink-muted backdrop-blur">
                  {item.caption}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
