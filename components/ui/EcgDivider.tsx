// A minimal, on-theme section divider — a flat line with a single small
// heartbeat blip in the middle, instead of a plain border. Kept subtle
// (thin stroke, low opacity, no animation) so it reads as a quiet detail,
// not a decoration competing for attention.
export function EcgDivider() {
  return (
    <div className="relative z-10 h-px w-full overflow-hidden bg-navy">
      <svg
        aria-hidden="true"
        viewBox="0 0 400 24"
        preserveAspectRatio="none"
        className="mx-auto h-6 w-full max-w-5xl text-ink-muted/20"
      >
        <path
          d="M0 12H160L172 12L180 2L190 22L198 12L210 12H400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
