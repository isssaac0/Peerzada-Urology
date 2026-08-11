"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Award } from "@/types/content";
import { Container } from "@/components/ui/Container";
import { RevealStagger, StaggerItem } from "@/components/ui/Reveal";
import { TopographicBackground } from "@/components/ui/TopographicBackground";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const VIEWBOX_W = 900;
const VIEWBOX_H = 2960;
const LEFT_X_PCT = (230 / VIEWBOX_W) * 100;
const RIGHT_X_PCT = (670 / VIEWBOX_W) * 100;

const NODE_Y = [100, 330, 560, 790, 1020, 1250, 1480, 1710, 1940, 2170, 2400, 2630, 2860];

const PATH_D =
  "M 230 100 C 230 215.0, 670 215.0, 670 330 C 670 445.0, 230 445.0, 230 560 C 230 675.0, 670 675.0, 670 790 C 670 905.0, 230 905.0, 230 1020 C 230 1135.0, 670 1135.0, 670 1250 C 670 1365.0, 230 1365.0, 230 1480 C 230 1595.0, 670 1595.0, 670 1710 C 670 1825.0, 230 1825.0, 230 1940 C 230 2055.0, 670 2055.0, 670 2170 C 670 2285.0, 230 2285.0, 230 2400 C 230 2515.0, 670 2515.0, 670 2630 C 670 2745.0, 230 2745.0, 230 2860";

// The one signature animation on this site — everywhere else uses the
// simpler Reveal/stagger treatment. Real award data drives an organic
// scroll-scrubbed path that draws itself in as the section is scrolled,
// connecting every achievement, in order, to an actual card.
//
// Background is a slow-drifting field of thin topographic contour lines
// (see TopographicBackground) — replaces two earlier, rejected attempts
// (an ambient breathing glow, a traveling pulse+trail). A contour field
// has no single object with a crisp edge for the eye to latch onto, and
// tiles natively to cover any section height.
//
// Note: certificate photos intentionally do NOT appear here — that's
// reserved for the dedicated /awards page, which has its own simpler,
// non-animated layout built for exactly that.
export function AwardsFlowPath({ awards }: { awards: Award[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathContainerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const items = awards.slice(0, NODE_Y.length);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const pathEl = pathRef.current;
      if (!pathEl || !pathContainerRef.current) return;

      const length = pathEl.getTotalLength();
      pathEl.style.strokeDasharray = `${length}`;
      pathEl.style.strokeDashoffset = `${length}`;

      nodeRefs.current.forEach((el) => {
        if (el) {
          el.style.opacity = "0.16";
          el.style.transform = "translateY(-50%) scale(0.94)";
        }
      });

      // Unchanged: path draw-in and card reveal, both tied to scroll
      // progress via the section's exact enter-to-exit range.
      const st = ScrollTrigger.create({
        trigger: pathContainerRef.current,
        start: "top center",
        end: "bottom center",
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          pathEl.style.strokeDashoffset = `${length * (1 - progress)}`;

          nodeRefs.current.forEach((el, i) => {
            if (!el) return;
            const threshold = Math.max(NODE_Y[i] / VIEWBOX_H, 0.02);
            const revealed = progress >= threshold - 0.015;
            el.style.opacity = revealed ? "1" : "0.16";
            el.style.transform = `translateY(-50%) scale(${revealed ? 1 : 0.94})`;
          });
        },
      });

      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoad);

      return () => {
        st.kill();
        window.removeEventListener("load", onLoad);
      };
    });

    return () => mm.revert();
  }, [items.length]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-navy py-24 sm:py-32">
      <Container className="relative">
        <div className="text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent">
            <span className="crosshair-mark" aria-hidden="true" />
            Awards & Achievements
          </div>
          <h2 className="mx-auto max-w-2xl text-3xl font-bold text-ink sm:text-4xl">
            Recognized nationally and internationally for surgical excellence
          </h2>
        </div>
      </Container>

      {/* Desktop / tablet: the signature scroll-scrubbed flow path */}
      <div
        ref={pathContainerRef}
        className="relative mx-auto mt-16 hidden w-full max-w-3xl px-6 md:block"
        style={{ aspectRatio: `${VIEWBOX_W} / ${VIEWBOX_H}` }}
      >
        {/* Slow-drifting topographic contour lines, sits behind
            everything else in this container. */}
        <TopographicBackground />

        <svg
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          className="absolute inset-0 h-full w-full overflow-visible"
          fill="none"
        >
          <path
            ref={pathRef}
            d={PATH_D}
            stroke="#FF6B35"
            strokeOpacity="0.55"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        {items.map((award, i) => {
          const isLeft = i % 2 === 0;
          const topPct = (NODE_Y[i] / VIEWBOX_H) * 100;
          return (
            <div key={award.title}>
              <div
                className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-navy"
                style={{
                  top: `${topPct}%`,
                  left: `${isLeft ? LEFT_X_PCT : RIGHT_X_PCT}%`,
                }}
                aria-hidden="true"
              />
              <div
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                className="absolute w-[42%] rounded-card border border-ink-muted/15 bg-navy-light p-4 shadow-glow transition-opacity duration-300 sm:p-5"
                style={{
                  top: `${topPct}%`,
                  transform: "translateY(-50%)",
                  opacity: 0.16,
                  ...(isLeft
                    ? { right: `${100 - LEFT_X_PCT}%`, marginRight: "1.25rem" }
                    : { left: `${RIGHT_X_PCT}%`, marginLeft: "1.25rem" }),
                }}
              >
                <p className="text-sm font-semibold text-ink sm:text-base">
                  {award.title}
                </p>
                {award.description ? (
                  <p className="mt-1.5 text-xs text-ink-muted sm:text-sm">
                    {award.description}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: a plain, fully responsive vertical list — unchanged */}
      <div className="relative mt-12 md:hidden">
        <Container>
          <RevealStagger className="relative border-l-2 border-accent/25 pl-6">
            {items.map((award) => (
              <StaggerItem key={award.title} className="relative mb-6 last:mb-0">
                <span
                  className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-navy"
                  aria-hidden="true"
                />
                <div className="rounded-card border border-ink-muted/15 bg-navy-light p-4 shadow-glow">
                  <p className="text-sm font-semibold text-ink">{award.title}</p>
                  {award.description ? (
                    <p className="mt-1.5 text-xs text-ink-muted">
                      {award.description}
                    </p>
                  ) : null}
                </div>
              </StaggerItem>
            ))}
          </RevealStagger>
        </Container>
      </div>
    </section>
  );
}
