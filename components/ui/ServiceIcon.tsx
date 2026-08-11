import type { ServiceIconKey } from "@/types/content";

const commonProps = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const icons: Record<ServiceIconKey, JSX.Element> = {
  endourology: (
    <svg {...commonProps}>
      <circle cx="19" cy="19" r="11" />
      <path d="M27 27L38 38" />
      <circle cx="19" cy="19" r="3.5" />
    </svg>
  ),
  "uro-oncology": (
    <svg {...commonProps}>
      <path d="M24 6l14 5v10c0 10-6 17-14 21-8-4-14-11-14-21V11l14-5z" />
      <path d="M24 18v12M18 24h12" />
    </svg>
  ),
  andrology: (
    <svg {...commonProps}>
      <circle cx="24" cy="14" r="7" />
      <path d="M12 40c0-8 5.4-13 12-13s12 5 12 13" />
      <path d="M17 27l3 4 4-6 3 4 4-5" />
    </svg>
  ),
  "reconstructive-urology": (
    <svg {...commonProps}>
      <path d="M14 24a10 10 0 0 1 10-10h4" />
      <path d="M34 24a10 10 0 0 1-10 10h-4" />
      <path d="M28 10l6 4-6 4M20 30l-6 4 6 4" />
    </svg>
  ),
  "renal-transplant": (
    <svg {...commonProps}>
      <path d="M16 14c-5 0-8 5-8 11s4 11 9 11c3 0 4-2 5-4" />
      <path d="M32 34c5 0 8-5 8-11s-4-11-9-11c-3 0-4 2-5 4" />
      <path d="M20 24h8M25 20l3 4-3 4" />
    </svg>
  ),
  "laparoscopy-robotic": (
    <svg {...commonProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M14 14l8 8" />
      <path d="M22 22l8-8" />
      <circle cx="33" cy="11" r="3" />
      <path d="M22 22l-4 12" />
      <circle cx="17" cy="37" r="3" />
    </svg>
  ),
};

export function ServiceIcon({
  icon,
  className = "h-8 w-8 text-accent",
}: {
  icon: ServiceIconKey;
  className?: string;
}) {
  return <span className={className}>{icons[icon]}</span>;
}
