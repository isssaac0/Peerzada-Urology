"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Award } from "@/types/content";
import { Container } from "@/components/ui/Container";
import { RevealStagger, StaggerItem } from "@/components/ui/Reveal";
import { TopographicBackground } from "@/components/ui/TopographicBackground";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // Don't re-measure everything every time a mobile browser's address bar
  // shows/hides — that is a common source of scroll jank.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

// ---- Layout (all in SVG viewBox units) -------------------------------
// Everything below is derived from the number of awards, so the path, the
// nodes and the cards always stay in step whether there are 3 awards or 30.
const VIEWBOX_W = 1000;
// Nodes sit at 32% / 68% of the width, which leaves exactly enough room
// outside each node for a card to sit INSIDE the container (the previous
// layout let cards hang ~150px outside it, so they were clipped on
// anything narrower than ~1060px).
const LEFT_X = 320;
const RIGHT_X = 680;
const LEFT_X_PCT = (LEFT_X / VIEWBOX_W) * 100;
const RIGHT_X_PCT = (RIGHT_X / VIEWBOX_W) * 100;
// Vertical distance between consecutive nodes (roughly 1 unit ≈ 1px at
// the 1024px container width). Cards alternate sides, so two cards on the
// same side are always 2×NODE_SPACING apart — comfortably more than a
// card is tall — which is why this can be much tighter than the previous
// 230 units (≈185px) without anything touching.
const NODE_SPACING = 124;
// Room above the first / below the last node for half a card.
const EDGE_PAD = 96;

function buildLayout(count: number) {
  const nodeY = Array.from({ length: count }, (_, i) => EDGE_PAD + i * NODE_SPACING);
  const height = EDGE_PAD * 2 + Math.max(count - 1, 0) * NODE_SPACING;

  let d = "";
  nodeY.forEach((y, i) => {
    const x = i % 2 === 0 ? LEFT_X : RIGHT_X;
    if (i === 0) {
      d = `M ${x} ${y}`;
      return;
    }
    const prevX = (i - 1) % 2 === 0 ? LEFT_X : RIGHT_X;
    const prevY = nodeY[i - 1];
    const mid = (y - prevY) / 2;
    d += ` C ${prevX} ${prevY + mid}, ${x} ${y - mid}, ${x} ${y}`;
  });

  return { nodeY, height, d };
}

function isLowPowerDevice(): boolean {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return (
    (nav.hardwareConcurrency ?? 8) <= 2 ||
    (nav.deviceMemory ?? 8) <= 2 ||
    nav.connection?.saveData === true
  );
}

// Path-length units: the path declares pathLength="1", so dash values are
// 0–1 regardless of the real geometry. That removes getTotalLength() (a
// layout read) and means nothing needs recalculating on resize.
// Starting a hair above 1 keeps the round line-cap from drawing a dot
// before the path begins.
const DASH_HIDDEN = 1.001;
const CARD_HIDDEN = { opacity: 0.16, scale: 0.94 };

// The one signature animation on this site — everywhere else uses the
// simpler Reveal/stagger treatment. Real award data drives an organic
// scroll-scrubbed path that draws itself in as the section is scrolled,
// connecting every achievement, in order, to an actual card.
//
// Animation architecture: ONE scrubbed GSAP timeline on ONE ScrollTrigger.
// The path draw and every card reveal are tweens on that timeline, so
// GSAP interpolates them itself — there is no onUpdate callback, no
// per-frame style writes from our code, no React state, and no layout
// reads while scrolling. Only opacity/transform (compositor-friendly) are
// animated on the cards; the stroke offset is the only paint work.
//
// Background is a slow-drifting field of thin topographic contour lines
// (see TopographicBackground).
//
// Note: certificate photos intentionally do NOT appear here — that's
// reserved for the dedicated /awards page.
export function AwardsFlowPath({ awards }: { awards: Award[] }) {
  const pathContainerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const items = awards;
  const count = items.length;
  const { nodeY, height, d } = useMemo(() => buildLayout(count), [count]);

  useLayoutEffect(() => {
    if (count === 0) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: "(min-width: 1024px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { desktop, reduceMotion } = context.conditions as {
          desktop: boolean;
          reduceMotion: boolean;
        };
        // Below lg the plain list is shown, which has no scroll animation.
        if (!desktop) return;

        const container = pathContainerRef.current;
        const path = pathRef.current;
        const cards = cardRefs.current.slice(0, count).filter(
          (el): el is HTMLDivElement => el !== null
        );
        if (!container || !path || cards.length === 0) return;

        // Reduced motion: show the finished layout, animate nothing.
        if (reduceMotion) {
          gsap.set(path, { strokeDashoffset: 0 });
          gsap.set(cards, { opacity: 1, scale: 1 });
          return;
        }

        gsap.set(path, { strokeDashoffset: DASH_HIDDEN });
        gsap.set(cards, CARD_HIDDEN);

        // Timeline time == scroll progress (0–1). The trigger runs while
        // the viewport's centre line travels from the container's top to
        // its bottom, so at progress p the centre line is p×height down
        // the section. The path front is kept level with that line, and a
        // card appears just as the front reaches its node.
        const first = EDGE_PAD / height;
        const span = (height - EDGE_PAD * 2) / height;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: container,
            start: "top center",
            end: "bottom center",
            // A little smoothing keeps the stroke fluid; on weak devices
            // tie it straight to the scroll position instead (less work).
            scrub: isLowPowerDevice() ? true : 0.5,
            invalidateOnRefresh: true,
          },
        });

        tl.to(path, { strokeDashoffset: 0, duration: span }, first);

        cards.forEach((card, i) => {
          const at = Math.max(nodeY[i] / height - 0.025, 0);
          tl.to(
            card,
            { opacity: 1, scale: 1, duration: 0.05, ease: "power1.out" },
            at
          );
        });

        // Pin the timeline's length to exactly 1 so time maps 1:1 to
        // scroll progress.
        tl.set({}, {}, 1);

        // Everything is torn down by mm.revert() (kills the timeline and
        // its ScrollTrigger and restores inline styles).
      }
    );

    return () => mm.revert();
  }, [count, height, nodeY]);

  // Keep trigger positions correct when content above changes size
  // (web fonts arriving, images settling). One debounced refresh; the
  // ResizeObserver also covers viewport resizes.
  useEffect(() => {
    if (count === 0) return;
    let timer: number | undefined;
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    };
    const observer = new ResizeObserver(refresh);
    observer.observe(document.body);
    document.fonts?.ready.then(refresh);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [count]);

  return (
    <section className="relative overflow-hidden bg-navy py-24 sm:py-32">
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
      {count > 0 ? (
        <div
          ref={pathContainerRef}
          className="relative mx-auto mt-14 hidden w-full max-w-5xl px-6 lg:block"
          style={{ aspectRatio: `${VIEWBOX_W} / ${height}` }}
        >
          {/* Slow-drifting topographic contour lines, sits behind
              everything else in this container. */}
          <TopographicBackground />

          <svg
            viewBox={`0 0 ${VIEWBOX_W} ${height}`}
            className="absolute inset-0 h-full w-full overflow-visible"
            fill="none"
            aria-hidden="true"
          >
            <path
              ref={pathRef}
              d={d}
              pathLength={1}
              stroke="#FF6B35"
              strokeOpacity="0.55"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ strokeDasharray: "1 2", strokeDashoffset: DASH_HIDDEN }}
            />
          </svg>

          {items.map((award, i) => {
            const isLeft = i % 2 === 0;
            const topPct = (nodeY[i] / height) * 100;
            return (
              <div key={`${award.title}-${i}`}>
                <div
                  className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-navy"
                  style={{
                    top: `${topPct}%`,
                    left: `${isLeft ? LEFT_X_PCT : RIGHT_X_PCT}%`,
                  }}
                  aria-hidden="true"
                />
                {/* Outer box only positions; the inner box is what GSAP
                    animates, so the two transforms never fight. */}
                <div
                  className="absolute w-[calc(32%-2rem)] -translate-y-1/2"
                  style={{
                    top: `${topPct}%`,
                    ...(isLeft
                      ? { right: `${100 - LEFT_X_PCT}%`, marginRight: "1.25rem" }
                      : { left: `${RIGHT_X_PCT}%`, marginLeft: "1.25rem" }),
                  }}
                >
                  <div
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className="rounded-card border border-ink-muted/15 bg-navy-light p-4 shadow-glow will-change-[transform,opacity] sm:p-5"
                    style={{ opacity: CARD_HIDDEN.opacity }}
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
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Mobile / tablet: a plain, fully responsive vertical list */}
      <div className="relative mt-12 lg:hidden">
        <Container>
          <RevealStagger className="relative mx-auto max-w-2xl border-l-2 border-accent/25 pl-6">
            {items.map((award, i) => (
              <StaggerItem
                key={`${award.title}-${i}`}
                className="relative mb-6 last:mb-0"
              >
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
