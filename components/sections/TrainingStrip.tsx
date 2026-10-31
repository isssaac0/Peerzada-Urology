import Image from "next/image";
import type { Qualification } from "@/types/content";

type StripItem = { name: string; logo: string };

export function TrainingStrip({
  qualifications,
  practicingHospital,
}: {
  qualifications: Qualification[];
  practicingHospital?: { name: string; logo?: string };
}) {
  // Only real logos are shown here — an institution with no logo file
  // would otherwise fall back to a plain text badge, which looked
  // inconsistent sitting next to actual logos. Text-only institutions
  // still appear elsewhere (Qualifications section); they just don't
  // belong in a logo strip.
  const byInstitution = new Map<string, StripItem>();
  for (const q of qualifications) {
    if (!q.institution || !q.logo) continue;
    if (!byInstitution.has(q.institution)) {
      byInstitution.set(q.institution, { name: q.institution, logo: q.logo });
    }
  }
  const items: StripItem[] = Array.from(byInstitution.values());

  if (practicingHospital?.name && practicingHospital.logo) {
    items.push({ name: practicingHospital.name, logo: practicingHospital.logo });
  }

  if (items.length === 0) return null;

  // Duplicated so the marquee can loop seamlessly — using 6 copies (not 2)
  // is what fixes visible gaps: with only a handful of logos, 2 copies
  // aren't wide enough to fill a typical desktop viewport, so empty track
  // becomes visible before the next copy scrolls into place. 6 copies
  // comfortably exceeds any realistic screen width.
  const REPEAT = 6;
  const track = Array.from({ length: REPEAT }, () => items).flat();
  const shiftPct = -100 / REPEAT;

  return (
    <div className="overflow-hidden border-y border-ink-muted/10 bg-navy-deep py-8">
      <div className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-ink-faint">
        Institutions
      </div>
      <div
        className="flex w-max animate-marquee items-start justify-start"
        style={{ "--marquee-shift": `${shiftPct}%` } as React.CSSProperties}
      >
        {track.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="mx-5 flex w-56 shrink-0 flex-col items-center gap-2 sm:w-64"
          >
            <div className="flex h-24 w-full items-center justify-center rounded-card bg-white/95 p-4 sm:h-28">
              <div className="relative h-full w-full">
                <Image
                  src={item.logo}
                  alt={item.name}
                  fill
                  sizes="256px"
                  className="object-contain"
                />
              </div>
            </div>
            <p className="max-w-[90%] text-center text-xs font-medium leading-snug text-ink-faint">
              {item.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
