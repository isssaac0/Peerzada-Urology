"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

// A Link whose "/#section" target scrolls smoothly when the visitor is
// already on that page (Next.js's own hash navigation jumps instantly).
// From any other page it behaves as a normal link and lands on the section.
export function SmoothAnchorLink({
  href,
  onClick,
  ...rest
}: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const pathname = usePathname();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return;
    const targetPath = href.slice(0, hashIndex) || "/";
    const id = href.slice(hashIndex + 1);
    if (targetPath !== pathname) return;

    const el = document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    window.history.pushState(null, "", href);
  };

  return <Link href={href} onClick={handleClick} {...rest} />;
}
