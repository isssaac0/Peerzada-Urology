"use client";

import { useEffect, useRef, useState } from "react";

// A self-contained counting animation — no external animation library,
// just requestAnimationFrame counting from 0 to the target once `start`
// becomes true. Parses the leading number out of strings like "15+" or
// "1000+" and re-appends whatever suffix followed it (+, %, etc.).
export function Counter({
  value,
  start,
  duration = 1600,
}: {
  value: string;
  start: boolean;
  duration?: number;
}) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : "";

  const [display, setDisplay] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!start || hasRun.current) return;
    hasRun.current = true;

    let raf: number;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}
