"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { frameLayout } from "@/lib/framing";
import type { SurgicalStep } from "@/types/content";

type LayerProps = {
  photo: SurgicalStep;
  alt: string;
  sizes: string;
  quality?: number;
  priority?: boolean;
  // Skip lazy-loading (tiny thumbnails that are already on screen).
  eager?: boolean;
  // "contain": the whole framed photo is visible (viewer, cards).
  // "cover": the frame fills the stage, centre-cropped (small thumbnails).
  fit?: "contain" | "cover";
  backdrop?: boolean;
  // Entries created before framing existed have no recorded size. Their
  // real shape is measured once the image loads and reported here.
  measured?: number | null;
  onMeasure?: (aspect: number) => void;
};

// The photograph + its blurred ambient backdrop. Must sit inside a
// `.photo-stage` (it relies on that element's container-query units).
export function PhotoLayers({
  photo,
  alt,
  sizes,
  quality = 82,
  priority = false,
  eager = false,
  fit = "contain",
  backdrop = true,
  measured = null,
  onMeasure,
}: LayerProps) {
  const layout = frameLayout(photo);
  const aspect = layout.known ? layout.aspect : (measured ?? layout.aspect);
  const img = layout.img;

  return (
    <>
      {backdrop ? (
        <div className="photo-stage__bg" aria-hidden="true">
          <Image
            src={photo.image}
            alt=""
            fill
            sizes="96px"
            quality={30}
            className="scale-125 object-cover opacity-50 blur-2xl saturate-150"
          />
        </div>
      ) : null}
      <div
        className={`photo-frame ${fit === "cover" ? "photo-frame--cover" : ""}`}
        style={{ "--a": aspect } as CSSProperties}
      >
        {img && photo.width && photo.height ? (
          // Known size: lay the photo out with plain percentages. (next/image
          // forbids width/height styles together with `fill`, so the real
          // pixel size is passed instead; CSS then sizes it inside the frame.)
          <Image
            src={photo.image}
            alt={alt}
            width={photo.width}
            height={photo.height}
            sizes={sizes}
            quality={quality}
            priority={priority}
            loading={eager ? "eager" : undefined}
            draggable={false}
            style={{
              position: "absolute",
              width: img.width,
              height: img.height,
              left: img.left,
              top: img.top,
              maxWidth: "none",
            }}
          />
        ) : (
          // Legacy entry without a recorded size: show it whole and report
          // its real shape once loaded.
          <Image
            src={photo.image}
            alt={alt}
            fill
            sizes={sizes}
            quality={quality}
            priority={priority}
            loading={eager ? "eager" : undefined}
            draggable={false}
            className="object-contain"
            onLoad={
              onMeasure
                ? (e) => {
                    const t = e.currentTarget;
                    if (t.naturalWidth && t.naturalHeight) {
                      onMeasure(t.naturalWidth / t.naturalHeight);
                    }
                  }
                : undefined
            }
          />
        )}
      </div>
    </>
  );
}

// A self-contained stage: cards, thumbnails, previews.
export function PhotoStage({
  photo,
  alt,
  sizes,
  quality,
  priority,
  eager,
  fit,
  backdrop,
  fixedAspect,
  blurred = false,
  className = "",
}: Omit<LayerProps, "measured" | "onMeasure"> & {
  // Force the stage's own shape (e.g. 4/3 on cards, 1 on thumbnails);
  // otherwise the stage takes the shape of the framed photograph.
  fixedAspect?: number;
  // Soften the picture (graphic-content covers).
  blurred?: boolean;
  className?: string;
}) {
  const [measured, setMeasured] = useState<number | null>(null);
  const layout = frameLayout(photo);
  const stageAspect =
    fixedAspect ?? (layout.known ? layout.aspect : (measured ?? layout.aspect));

  return (
    <div
      className={`photo-stage ${className}`}
      style={{ "--sa": stageAspect } as CSSProperties}
    >
      <div className={`absolute inset-0 ${blurred ? "scale-110 blur-xl" : ""}`}>
        <PhotoLayers
          photo={photo}
          alt={alt}
          sizes={sizes}
          quality={quality}
          priority={priority}
          eager={eager}
          fit={fit}
          backdrop={backdrop}
          measured={measured}
          onMeasure={setMeasured}
        />
      </div>
    </div>
  );
}
