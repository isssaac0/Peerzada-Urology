// CMS image fields that appear in fixed-size placeholders store the crop
// the doctor chose INSIDE the image value, after a "#":
//
//     /uploads/x.jpg                  → centred, no zoom (older entries)
//     /uploads/x.jpg#f=1.4,40,55      → zoom 1.4×, focus 40% / 55%
//
// Content files therefore keep a plain string, so nothing needs migrating,
// and browsers never send the "#…" part to the server, so the file is
// still served normally. The original upload is never modified.
// public/admin/surgical-steps-widget.js ("framed_image") writes this.

export interface FramedSrc {
  src: string;
  zoom: number;
  x: number;
  y: number;
  hasFraming: boolean;
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

export const MAX_FRAMED_ZOOM = 4;

export function parseFramedSrc(value: string): FramedSrc {
  const hash = value.indexOf("#f=");
  if (hash === -1) return { src: value, zoom: 1, x: 50, y: 50, hasFraming: false };
  const [z, x, y] = value
    .slice(hash + 3)
    .split(",")
    .map(Number);
  const ok = [z, x, y].every((n) => Number.isFinite(n));
  return {
    src: value.slice(0, hash),
    zoom: ok ? clamp(z, 1, MAX_FRAMED_ZOOM) : 1,
    x: ok ? clamp(x, 0, 100) : 50,
    y: ok ? clamp(y, 0, 100) : 50,
    hasFraming: ok,
  };
}
