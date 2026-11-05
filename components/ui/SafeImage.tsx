import Image, { type ImageProps } from "next/image";

// Drop-in replacement for next/image.
//
// next/image runs every picture through its optimizer, which is only
// guaranteed for the mainstream web formats. Anything else a content editor
// might upload through the CMS (.jfif, .jfi, .pjpeg, .bmp, .ico, ...) can be
// rejected by the optimizer on the live host, so the picture silently never
// shows. For those files we skip the optimizer and let the browser load the
// file as-is — browsers decode all of them natively.
//
// Formats the optimizer handles well (jpg, jpeg, png, webp, avif, gif) go
// through exactly the same path as before, so nothing changes for them.

const OPTIMIZABLE = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif"]);

function needsBypass(src: ImageProps["src"]): boolean {
  if (typeof src !== "string") return false; // static imports are always fine
  if (/^data:|^blob:/i.test(src)) return false;
  const path = src.split("#")[0].split("?")[0];
  const dot = path.lastIndexOf(".");
  const slash = path.lastIndexOf("/");
  if (dot === -1 || dot < slash) return false; // no extension: leave as before
  return !OPTIMIZABLE.has(path.slice(dot + 1).toLowerCase());
}

export default function SafeImage(props: ImageProps) {
  const bypass = needsBypass(props.src);
  // eslint-disable-next-line jsx-a11y/alt-text -- alt is supplied by callers via props
  return <Image {...props} unoptimized={props.unoptimized ?? bypass} />;
}
