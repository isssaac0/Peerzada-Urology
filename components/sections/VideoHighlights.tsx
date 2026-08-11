"use client";

import Link from "next/link";
import Image from "next/image";
import type { VideoItem } from "@/types/content";
import { Section, SectionEyebrow } from "@/components/ui/Section";
import { Reveal, RevealStagger, StaggerItem } from "@/components/ui/Reveal";
import { useVideoModal } from "@/components/ui/VideoModal";

export function VideoHighlights({ videos }: { videos: VideoItem[] }) {
  const items = videos.slice(0, 6);
  const { open } = useVideoModal();

  return (
    <Section id="videos">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionEyebrow>Patient Stories</SectionEyebrow>
          <h2 className="max-w-2xl text-3xl font-bold text-ink sm:text-4xl">
            Hear it directly from patients
          </h2>
        </div>
        <Link
          href="/videos"
          className="text-sm font-semibold text-accent hover:text-accent-light"
        >
          See all videos →
        </Link>
      </Reveal>

      {items.length === 0 ? (
        <p className="mt-10 text-ink-muted">
          Patient videos will appear here once added through the content
          manager.
        </p>
      ) : (
        <RevealStagger className="mt-10 grid gap-6 sm:grid-cols-3">
          {items.map((video, index) => (
            <StaggerItem key={`${video.url}-${index}`}>
              <button
                type="button"
                onClick={() => open(video.url, video.title)}
                className="group block w-full overflow-hidden rounded-card border border-ink-muted/15 bg-navy-light text-left shadow-glow transition-all duration-300 hover:-translate-y-1 hover:border-accent"
              >
                <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-navy">
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-sm text-ink-faint">
                      Video thumbnail
                    </span>
                  )}
                  <div className="absolute inset-0 bg-navy-deep/0 transition-colors duration-300 group-hover:bg-navy-deep/30" />
                  <span
                    aria-hidden="true"
                    className="absolute inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white transition-transform duration-300 group-hover:scale-110"
                  >
                    ▶
                  </span>
                </div>
                <p className="p-4 text-sm font-semibold text-ink group-hover:text-accent">
                  {video.title}
                </p>
              </button>
            </StaggerItem>
          ))}
        </RevealStagger>
      )}
    </Section>
  );
}
