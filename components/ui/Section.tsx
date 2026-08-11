import type { ReactNode } from "react";
import { Container } from "./Container";

export function Section({
  children,
  className = "",
  tone = "navy",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "navy" | "navy-light";
  id?: string;
}) {
  const toneClass =
    tone === "navy-light" ? "bg-navy-light/[0.97]" : "bg-navy/[0.97]";

  return (
    <section
      id={id}
      className={`relative z-10 ${toneClass} py-16 sm:py-24 ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="section-eyebrow">
      <span className="crosshair-mark" aria-hidden="true" />
      {children}
    </div>
  );
}
