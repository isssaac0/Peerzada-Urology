// Non-destructive photo framing for surgical photographs.
//
// The original upload is never modified. For each stage the CMS stores a
// small set of adjustments next to the image path, and this module turns
// them into CSS at render time:
//
//   ratio   — shape of the frame: "original" or one of FRAME_RATIOS
//   zoom    — 1 (fit the frame exactly) … MAX_ZOOM
//   focusX/focusY — 0–100, which part of the photo the frame is aligned to
//                   (50/50 = centred), exactly like CSS object-position
//   width/height  — the original's pixel size, recorded at upload so the
//                   crop can be computed without loading the image first
//
// IMPORTANT: public/admin/surgical-steps-widget.js contains the same
// maths (it runs inside Decap CMS and cannot import this file). Keep the
// two in sync — the CMS preview and the website must always agree.

// Stored as "4x3" rather than "4:3" on purpose: YAML reads an unquoted
// 4:3 as a base-60 number, which would silently corrupt the setting.
export const FRAME_RATIOS = [
  "original",
  "1x1",
  "4x5",
  "3x4",
  "4x3",
  "3x2",
  "16x9",
] as const;
export type FrameRatio = (typeof FRAME_RATIOS)[number];

export const MAX_ZOOM = 4;
// Used only when a legacy entry has no recorded dimensions.
export const FALLBACK_ASPECT = 4 / 3;

export interface Framing {
  ratio?: FrameRatio;
  zoom?: number;
  focusX?: number;
  focusY?: number;
  width?: number;
  height?: number;
}

export interface FrameLayout {
  // Width ÷ height of the frame.
  aspect: number;
  // Percentage geometry for the <img> inside the frame, or null when the
  // photo's dimensions are unknown (the caller then just "contains" it).
  img: { width: string; height: string; left: string; top: string } | null;
  // True when the frame shape could be derived without loading the image.
  known: boolean;
}

export function parseRatio(ratio: string): number {
  const [w, h] = ratio.split("x").map(Number);
  return w > 0 && h > 0 ? w / h : FALLBACK_ASPECT;
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

export function frameLayout(f: Framing): FrameLayout {
  const hasDims = !!(f.width && f.height && f.width > 0 && f.height > 0);
  const imageAspect = hasDims ? f.width! / f.height! : null;
  const ratio = f.ratio ?? "original";

  let aspect: number;
  if (ratio === "original") aspect = imageAspect ?? FALLBACK_ASPECT;
  else aspect = parseRatio(ratio);

  if (imageAspect === null) return { aspect, img: null, known: false };

  const zoom = clamp(f.zoom ?? 1, 1, MAX_ZOOM);
  const fx = clamp(f.focusX ?? 50, 0, 100);
  const fy = clamp(f.focusY ?? 50, 0, 100);

  // "Cover" size of the photo inside the frame, then scaled by zoom.
  const w = Math.max(1, imageAspect / aspect) * 100 * zoom;
  const h = Math.max(1, aspect / imageAspect) * 100 * zoom;

  return {
    aspect,
    known: true,
    img: {
      width: `${w}%`,
      height: `${h}%`,
      left: `${((100 - w) * fx) / 100}%`,
      top: `${((100 - h) * fy) / 100}%`,
    },
  };
}
