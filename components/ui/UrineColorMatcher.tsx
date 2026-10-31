"use client";

import { useState } from "react";
import type { UrineColorGuideEntry } from "@/types/content";
import { SeverityBadge } from "@/components/ui/SeverityBadge";

export function UrineColorMatcher({
  colorGuide,
}: {
  colorGuide: UrineColorGuideEntry[];
}) {
  const [index, setIndex] = useState(0);

  if (!colorGuide?.length) return null;

  const selected = colorGuide[index];

  return (
    <div className="rounded-card border border-ink-muted/15 bg-navy-light p-6 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">
        Drag to match the closest color
      </p>

      <div
        className="mt-6 h-16 w-full rounded-card border border-ink-muted/20 transition-colors"
        style={{ backgroundColor: selected.hex }}
        aria-hidden="true"
      />

      <input
        type="range"
        min={0}
        max={colorGuide.length - 1}
        step={1}
        value={index}
        onChange={(e) => setIndex(Number(e.target.value))}
        className="mt-6 w-full accent-accent"
        aria-label="Match your urine color on this scale"
      />

      <div className="mt-6 rounded-card bg-navy p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-ink">{selected.label}</h3>
          <SeverityBadge severity={selected.severity} />
        </div>
        <p className="mt-3 text-ink-muted">{selected.guidance}</p>
      </div>

      <p className="mt-4 text-xs text-ink-faint">
        This is a general reference, not a diagnosis. When in doubt, contact
        your care team directly.
      </p>
    </div>
  );
}
