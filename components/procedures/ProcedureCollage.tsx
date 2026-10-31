import Image from "next/image";
import type { SurgicalStep } from "@/types/content";

// The procedure's cover: a collage of its stage photographs (first stage
// first). Fixed 4:3 placeholder, whatever the number or shape of photos.
// Tiles are small previews, so they fill their cell; the full photographs
// are always shown, uncropped, on the procedure page.
const LAYOUTS: Record<number, { grid: string; tiles: string[] }> = {
  1: { grid: "grid-cols-1 grid-rows-1", tiles: [""] },
  2: { grid: "grid-cols-2 grid-rows-1", tiles: ["", ""] },
  3: { grid: "grid-cols-2 grid-rows-2", tiles: ["row-span-2", "", ""] },
  4: { grid: "grid-cols-2 grid-rows-2", tiles: ["", "", "", ""] },
  5: {
    grid: "grid-cols-6 grid-rows-2",
    tiles: ["col-span-3", "col-span-3", "col-span-2", "col-span-2", "col-span-2"],
  },
  6: { grid: "grid-cols-3 grid-rows-2", tiles: ["", "", "", "", "", ""] },
};

export function ProcedureCollage({
  steps,
  title,
  blurred = false,
}: {
  steps: SurgicalStep[];
  title: string;
  blurred?: boolean;
}) {
  const shown = steps.slice(0, 6);
  const extra = steps.length - shown.length;
  const layout = LAYOUTS[shown.length];

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-navy-deep">
      <div
        className={`absolute inset-0 grid gap-0.5 ${layout.grid} ${
          blurred ? "scale-110 blur-md" : ""
        }`}
      >
        {shown.map((step, i) => (
          <div
            key={`${step.image}-${i}`}
            className={`relative min-h-0 min-w-0 overflow-hidden ${layout.tiles[i]}`}
          >
            <Image
              src={step.image}
              alt={blurred ? "" : `${title} — ${step.title}`}
              fill
              sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 60vw"
              quality={60}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              style={{
                objectPosition: `${step.focusX ?? 50}% ${step.focusY ?? 50}%`,
              }}
            />
            {extra > 0 && i === shown.length - 1 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-xl font-semibold text-white">
                +{extra + 1}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {blurred ? (
        <div className="absolute inset-0 flex items-end bg-black/25 p-4">
          <span className="rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
            Surgical images · open to view
          </span>
        </div>
      ) : null}
    </div>
  );
}
