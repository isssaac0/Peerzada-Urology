"use client";

import { useState } from "react";
import type { SymptomChecklistEntry } from "@/types/content";
import { SeverityBadge } from "@/components/ui/SeverityBadge";

export function SymptomChecker({
  symptoms,
}: {
  symptoms: SymptomChecklistEntry[];
}) {
  const [selected, setSelected] = useState<SymptomChecklistEntry | null>(
    null
  );

  if (!symptoms?.length) return null;

  return (
    <div className="rounded-card border border-ink-muted/15 bg-navy-light p-6 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">
        Tap what you&apos;re experiencing
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {symptoms.map((item) => {
          const isActive = selected?.symptom === item.symptom;
          return (
            <button
              key={item.symptom}
              type="button"
              onClick={() => setSelected(item)}
              className={`rounded-full border px-4 py-2 text-left text-sm font-medium transition-colors ${
                isActive
                  ? "border-accent bg-accent/10 text-ink"
                  : "border-ink-muted/25 text-ink-muted hover:border-accent hover:text-ink"
              }`}
            >
              {item.symptom}
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="mt-6 rounded-card bg-navy p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-ink">
              {selected.symptom}
            </h3>
            <SeverityBadge severity={selected.verdict} />
          </div>
          <p className="mt-3 text-ink-muted">{selected.guidance}</p>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-ink-faint">
        This is a general reference, not a diagnosis. When in doubt, contact
        your care team directly.
      </p>
    </div>
  );
}
