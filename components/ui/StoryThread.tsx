"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

// A thin connecting line that draws itself down the homepage as you
// scroll — a literal narrative thread tying every section together,
// instead of each one just fading in independently. Uses the same
// simple, already-proven pattern as DnaBackground (framer-motion's
// useScroll mapped directly to a stroke property) rather than GSAP
// ScrollTrigger, deliberately — that combination caused real sync
// problems elsewhere in this project, and this effect doesn't need
// anything more complex than a direct 1:1 scroll mapping.
export function StoryThread({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <div ref={containerRef} className="relative">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-6 top-0 hidden h-full w-4 sm:left-10 md:block"
        preserveAspectRatio="none"
        viewBox="0 0 4 1000"
      >
        <line
          x1="2"
          y1="0"
          x2="2"
          y2="1000"
          stroke="currentColor"
          strokeWidth="1"
          className="text-ink-muted/10"
        />
        <motion.line
          x1="2"
          y1="0"
          x2="2"
          y2="1000"
          stroke="#FF6B35"
          strokeWidth="1.5"
          strokeOpacity="0.4"
          pathLength={pathLength}
          style={{
            pathLength,
          }}
        />
      </svg>
      {children}
    </div>
  );
}
