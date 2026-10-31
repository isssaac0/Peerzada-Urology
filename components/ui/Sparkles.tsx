const DOTS = [
  { x: 63.4, y: 4.4, size: 1.9, delay: 1.34, duration: 5.2 },
  { x: 67.0, y: 87.6, size: 1.6, delay: 2.53, duration: 3.1 },
  { x: 23.0, y: 50.5, size: 1.5, delay: 1.19, duration: 4.9 },
  { x: 54.3, y: 23.2, size: 2.4, delay: 4.86, duration: 3.0 },
  { x: 79.4, y: 69.0, size: 2.0, delay: 0.93, duration: 5.9 },
  { x: 34.3, y: 10.9, size: 1.6, delay: 5.08, duration: 4.8 },
  { x: 79.5, y: 72.1, size: 2.3, delay: 5.84, duration: 4.1 },
  { x: 55.0, y: 81.6, size: 2.4, delay: 5.17, duration: 4.7 },
  { x: 69.6, y: 6.4, size: 1.8, delay: 1.74, duration: 3.2 },
  { x: 24.3, y: 11.7, size: 1.9, delay: 3.81, duration: 4.1 },
  { x: 37.5, y: 22.1, size: 1.9, delay: 5.62, duration: 4.9 },
  { x: 60.5, y: 18.4, size: 2.6, delay: 0.98, duration: 4.1 },
  { x: 97.0, y: 63.4, size: 2.3, delay: 4.11, duration: 5.5 },
  { x: 76.5, y: 24.0, size: 1.5, delay: 1.89, duration: 3.8 },
  { x: 22.3, y: 92.5, size: 2.8, delay: 1.89, duration: 5.0 },
  { x: 40.0, y: 89.8, size: 2.2, delay: 1.59, duration: 3.7 },
  { x: 55.9, y: 27.2, size: 2.4, delay: 5.39, duration: 4.2 },
  { x: 23.1, y: 97.8, size: 2.3, delay: 0.55, duration: 3.1 },
  { x: 12.5, y: 62.2, size: 2.7, delay: 2.53, duration: 3.2 },
  { x: 38.6, y: 97.6, size: 2.3, delay: 5.83, duration: 5.6 },
  { x: 3.1, y: 71.2, size: 2.5, delay: 3.22, duration: 3.8 },
  { x: 63.5, y: 12.7, size: 2.2, delay: 2.72, duration: 5.9 },
  { x: 86.1, y: 27.3, size: 2.3, delay: 1.07, duration: 5.7 },
  { x: 85.6, y: 30.7, size: 2.5, delay: 3.65, duration: 3.5 },
  { x: 75.2, y: 53.8, size: 2.7, delay: 3.18, duration: 3.0 },
  { x: 33.1, y: 3.9, size: 2.9, delay: 5.27, duration: 5.5 },
  { x: 31.5, y: 7.6, size: 2.8, delay: 5.68, duration: 3.3 },
  { x: 48.7, y: 8.6, size: 2.6, delay: 4.6, duration: 3.4 },
  { x: 47.6, y: 54.8, size: 1.9, delay: 5.23, duration: 4.3 },
  { x: 22.3, y: 53.8, size: 2.6, delay: 1.21, duration: 3.9 },
  { x: 97.5, y: 64.4, size: 2.2, delay: 3.11, duration: 3.4 },
  { x: 23.6, y: 34.5, size: 2.4, delay: 1.38, duration: 3.7 },
  { x: 8.8, y: 62.6, size: 1.8, delay: 5.43, duration: 5.6 },
  { x: 8.8, y: 24.8, size: 2.5, delay: 1.29, duration: 3.4 },
  { x: 91.8, y: 56.8, size: 2.2, delay: 4.71, duration: 5.4 },
  { x: 20.3, y: 11.3, size: 2.1, delay: 2.54, duration: 4.4 },
  { x: 72.0, y: 66.6, size: 3.0, delay: 0.59, duration: 4.2 },
  { x: 34.6, y: 84.7, size: 1.9, delay: 1.14, duration: 4.3 },
  { x: 42.5, y: 28.7, size: 1.9, delay: 5.54, duration: 4.3 },
  { x: 84.7, y: 54.8, size: 1.6, delay: 6.0, duration: 5.5 },
  { x: 95.0, y: 90.9, size: 2.8, delay: 1.0, duration: 4.5 },
  { x: 22.5, y: 40.5, size: 1.6, delay: 2.27, duration: 6.0 },
  { x: 27.5, y: 77.3, size: 2.2, delay: 2.54, duration: 5.9 },
  { x: 97.6, y: 55.4, size: 2.6, delay: 0.93, duration: 3.9 },
  { x: 95.0, y: 57.6, size: 2.3, delay: 4.49, duration: 3.2 },
  { x: 58.1, y: 50.3, size: 2.8, delay: 0.94, duration: 5.9 },
  { x: 9.7, y: 19.8, size: 2.4, delay: 4.05, duration: 3.7 },
  { x: 13.5, y: 87.5, size: 1.9, delay: 3.57, duration: 4.9 },
  { x: 42.2, y: 58.0, size: 2.3, delay: 5.61, duration: 3.6 },
  { x: 70.8, y: 24.9, size: 2.1, delay: 4.03, duration: 3.9 },
  { x: 32.4, y: 74.2, size: 1.6, delay: 2.75, duration: 6.0 },
  { x: 97.6, y: 9.0, size: 1.8, delay: 1.59, duration: 5.8 },
  { x: 86.6, y: 86.4, size: 2.1, delay: 0.95, duration: 5.5 },
  { x: 69.5, y: 60.7, size: 3.0, delay: 3.92, duration: 3.0 },
  { x: 80.4, y: 30.7, size: 2.5, delay: 5.63, duration: 3.4 },
];

// A subtle, site-wide sparkle/glitter texture — small dots at fixed
// (not randomly regenerated) positions, each softly twinkling on its own
// timer via a pure CSS animation. Kept low-opacity and modest in size so
// it reads as ambient texture on the navy background, not as clutter or
// distraction on a medical site.
export function Sparkles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {DOTS.map((dot, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-accent"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            animation: `sparkle-twinkle ${dot.duration}s ease-in-out ${dot.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
