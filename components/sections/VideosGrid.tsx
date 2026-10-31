"use client";

import Image from "next/image";
import type { VideoItem } from "@/types/content";
import { Reveal, RevealStagger, StaggerItem } from "@/components/ui/Reveal";
import { SectionEyebrow } from "@/components/ui/Section";
import { useVideoModal } from "@/components/ui/VideoModal";

// The full /videos listing — mirrors the homepage VideoHighlights component
// so a video opens in the in-page modal everywhere on the site, never in a
// new tab.
export function VideosGrid({ videos }: { videos: VideoItem[] }) {
  const { open } = useVideoModal();

  return (
    <>
      <Reveal>
        <SectionEyebrow>Watch</SectionEyebrow>
      </Reveal>
      {videos.length === 0 ? (
        <p className="text-ink-muted">
          Videos will appear here once added through the content manager.
        </p>
      ) : (
        <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video, index) => (
            <StaggerItem key={`${video.url}-${index}`}>
              <button
                type="button"
                onClick={() => open(video.url, video.title)}
                className="group block w-full overflow-hidden rounded-card border border-ink-muted/15 bg-navy-light text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent"
              >
                <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-navy">
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-sm text-ink-faint">
                      Video thumbnail
                    </span>
                  )}
                  <span
                    aria-hidden="true"
                    className="absolute inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white"
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
    </>
  );
}
