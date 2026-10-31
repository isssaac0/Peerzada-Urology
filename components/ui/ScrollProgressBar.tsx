"use client";

import { motion, useScroll, useSpring } from "framer-motion";

// A thin, restrained scroll-progress line — the kind of quiet detail that
// signals intentionality without asking for attention. Spring-smoothed so
// it trails scroll position slightly rather than jumping frame to frame.
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left bg-accent"
    />
  );
}
