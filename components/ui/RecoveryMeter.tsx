"use client";

import { useState } from "react";
import type { RecoveryMilestone } from "@/types/content";

export function RecoveryMeter({
  milestones,
}: {
  milestones: RecoveryMilestone[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!milestones?.length) return null;

  const active = milestones[activeIndex];

  return (
    <div className="rounded-card border border-ink-muted/15 bg-navy-light p-6 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">
        Tap a stage to see what to expect
      </p>

      <div className="mt-6 flex items-center justify-between gap-1">
        {milestones.map((milestone, index) => {
          const isActive = index === activeIndex;
          const isPast = index < activeIndex;
          return (
            <button
              key={milestone.day}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group flex flex-1 flex-col items-center gap-2"
              aria-current={isActive}
            >
              <span
                className={`h-3 w-3 rounded-full border-2 transition-colors ${
                  isActive
                    ? "border-accent bg-accent"
                    : isPast
                    ? "border-accent bg-transparent"
                    : "border-ink-muted/40 bg-transparent"
                }`}
              />
              <span
                className={`hidden text-center text-xs sm:block ${
                  isActive ? "font-semibold text-ink" : "text-ink-faint"
                }`}
              >
                {milestone.day}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative mt-1 h-1 w-full rounded-full bg-ink-muted/15 sm:hidden" />

      <div className="mt-8 rounded-card bg-navy p-6">
        <p className="text-sm font-semibold text-accent">{active.day}</p>
        <h3 className="mt-1 text-xl font-bold text-ink">{active.label}</h3>
        <p className="mt-3 text-ink-muted">{active.detail}</p>
      </div>

      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
          disabled={activeIndex === 0}
          className="text-sm font-semibold text-ink-muted hover:text-accent disabled:opacity-30"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={() =>
            setActiveIndex((i) => Math.min(milestones.length - 1, i + 1))
          }
          disabled={activeIndex === milestones.length - 1}
          className="text-sm font-semibold text-ink-muted hover:text-accent disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
