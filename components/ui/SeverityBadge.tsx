import type { GuideSeverity } from "@/types/content";

const severityConfig: Record<
  GuideSeverity,
  { label: string; classes: string }
> = {
  normal: {
    label: "Normal",
    classes: "border-green-400/40 bg-green-400/10 text-green-400",
  },
  caution: {
    label: "Worth Monitoring",
    classes: "border-amber-400/40 bg-amber-400/10 text-amber-400",
  },
  emergency: {
    label: "Contact Care Team Now",
    classes: "border-red-400/40 bg-red-400/10 text-red-400",
  },
};

export function SeverityBadge({ severity }: { severity: GuideSeverity }) {
  const config = severityConfig[severity];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
