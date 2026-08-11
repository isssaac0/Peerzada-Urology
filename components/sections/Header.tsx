"use client";

import { useState } from "react";
import Link from "next/link";
import type { DoctorProfile } from "@/types/content";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Patient Journey", href: "/patient-journey" },
  { label: "About", href: "/about" },
];

export function Header({ profile }: { profile: DoctorProfile }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-muted/10 bg-navy/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-sm font-bold text-ink sm:text-base"
          onClick={() => setIsOpen(false)}
        >
          {profile.name}
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-muted sm:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-accent">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 sm:hidden"
          >
            <span
              className={`h-0.5 w-6 bg-ink transition-transform ${
                isOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-ink transition-opacity ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-ink transition-transform ${
                isOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {isOpen ? (
        <nav className="border-t border-ink-muted/10 bg-navy px-6 py-4 sm:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base font-medium text-ink-muted hover:bg-navy-light hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
