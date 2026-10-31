import Image from "next/image";
import type { ImageFocus } from "@/types/content";
import { parseFramedSrc } from "@/lib/imageFraming";

// Fills whatever placeholder it is placed in — the PARENT decides the size;
// this never changes it — with no empty bars: the photo always covers the
// placeholder.
//
// What stays visible is the doctor's choice. In the CMS every image field
// has a crop editor locked to this placeholder's shape; the crop (zoom +
// focus) travels inside the image value ("/uploads/x.jpg#f=1.4,40,55") and
// is applied here with plain CSS. Older images without a saved crop are
// centred (or use the `focus` fallback).

const FOCUS_POSITION: Record<ImageFocus, [number, number]> = {
  center: [50, 50],
  top: [50, 0],
  bottom: [50, 100],
  left: [0, 50],
  right: [100, 50],
};

export function FitImage({
  src,
  alt,
  sizes = "(min-width: 1024px) 600px, 100vw",
  quality = 82,
  priority = false,
  focus = "center",
}: {
  src: string;
  alt: string;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  focus?: ImageFocus;
  // Accepted for compatibility; cropping is now chosen in the CMS.
  tolerance?: number;
}) {
  const framed = parseFramedSrc(src);
  const [fx, fy] = framed.hasFraming
    ? [framed.x, framed.y]
    : FOCUS_POSITION[focus];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={framed.src}
        alt={alt}
        fill
        // A zoomed crop shows a smaller part of the file, so ask for more
        // pixels to keep it sharp.
        sizes={framed.zoom > 1 ? `${Math.round(100 * framed.zoom)}vw` : sizes}
        quality={quality}
        priority={priority}
        className="object-cover"
        style={{
          objectPosition: `${fx}% ${fy}%`,
          transform: framed.zoom > 1 ? `scale(${framed.zoom})` : undefined,
          transformOrigin: `${fx}% ${fy}%`,
        }}
      />
    </div>
  );
}
