export function Loader({ name }: { name: string }) {
  return (
    <div
      aria-hidden="true"
      className="loader-overlay pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-navy-deep px-6"
    >
      <div className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
        {/* Radar-style ping rings, staggered so the overlap reads as one
            continuous pulse rather than three distinct rings. */}
        <span
          className="loader-ping-ring absolute inset-0 rounded-full border border-accent"
          style={{ animationDelay: "0s" }}
        />
        <span
          className="loader-ping-ring absolute inset-0 rounded-full border border-accent"
          style={{ animationDelay: "0.8s" }}
        />
        <span
          className="loader-ping-ring absolute inset-0 rounded-full border border-accent"
          style={{ animationDelay: "1.6s" }}
        />

        {/* Kidney icon, pulsing, clipped inside a circular window with a
            scan-beam sweeping through it — an ultrasound/diagnostic-scan
            feel rather than a plain spinner. */}
        <div className="relative h-12 w-12 overflow-hidden rounded-full sm:h-14 sm:w-14">
          <svg
            viewBox="0 0 60 60"
            className="loader-icon h-12 w-12 text-accent sm:h-14 sm:w-14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 8C12 8 6 18 6 30s7 22 16 22c5 0 6.5-3 8-6.5" />
            <path d="M38 6c9 0 15 10 15 22s-7 22-16 22c-5 0-6.5-3-8-6.5" />
          </svg>
          <span
            className="loader-scan-beam pointer-events-none absolute inset-x-0 h-8"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-ink">
          {name}
        </p>
        <p className="mt-1 text-xs text-ink-faint">Precision Urology Care</p>
      </div>

      <div className="h-1 w-40 overflow-hidden rounded-full bg-ink-muted/15 sm:w-48">
        <div className="loader-progress-bar h-full rounded-full bg-accent" />
      </div>
    </div>
  );
}
