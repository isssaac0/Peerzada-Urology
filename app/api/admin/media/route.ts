import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".jfif", ".jfi", ".jpe", ".pjpeg", ".pjp", ".bmp", ".svg", ".ico"]);

function collectImages(dir: string): Array<{ name: string; path: string }> {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectImages(fullPath);
    if (!entry.isFile() || !IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) return [];
    const relative = path.relative(path.join(process.cwd(), "public"), fullPath).split(path.sep).join("/");
    return [{ name: entry.name, path: `/${relative}` }];
  });
}

export async function GET() {
  const images = collectImages(UPLOADS_DIR).sort((a, b) => a.path.localeCompare(b.path));
  return NextResponse.json(images, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
