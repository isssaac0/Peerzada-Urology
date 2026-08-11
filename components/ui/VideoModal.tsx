"use client";

import { useState, createContext, useContext, useCallback } from "react";

type VideoModalContextValue = {
  open: (url: string, title: string) => void;
};

const VideoModalContext = createContext<VideoModalContextValue | null>(null);

function isEmbeddableUrl(url: string) {
  return /youtube\.com|youtu\.be|vimeo\.com/.test(url);
}

function toEmbedUrl(url: string) {
  const ytMatch = url.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  return url;
}

export function VideoModalProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<{ url: string; title: string } | null>(
    null
  );

  const open = useCallback((url: string, title: string) => {
    setActive({ url, title });
  }, []);

  const close = () => setActive(null);

  return (
    <VideoModalContext.Provider value={{ open }}>
      {children}
      {active ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-navy-deep/90 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-card bg-navy shadow-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close video"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-navy-deep/80 text-ink hover:bg-accent"
            >
              ✕
            </button>
            <div className="aspect-video w-full">
              {isEmbeddableUrl(active.url) ? (
                <iframe
                  src={toEmbedUrl(active.url)}
                  title={active.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={active.url}
                  controls
                  autoPlay
                  className="h-full w-full"
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </VideoModalContext.Provider>
  );
}

export function useVideoModal() {
  const ctx = useContext(VideoModalContext);
  if (!ctx) {
    throw new Error("useVideoModal must be used within VideoModalProvider");
  }
  return ctx;
}
