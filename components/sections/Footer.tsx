import Link from "next/link";
import type { DoctorProfile, Service } from "@/types/content";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M13.5 22v-8.5H16l.5-3.5h-3V7.8c0-1 .3-1.7 1.7-1.7H16.6V3.1C16.3 3.1 15.3 3 14.1 3c-2.5 0-4.2 1.5-4.2 4.4v2.6H7.4V13.5H9.9V22h3.6z" />
    </svg>
  );
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Patient Journey", href: "/patient-journey" },
  { label: "Gallery", href: "/gallery" },
  { label: "Videos", href: "/videos" },
];

const aboutLinks = [
  { label: "Credentials & Training", href: "/credentials" },
  { label: "Awards & Achievements", href: "/awards" },
  { label: "Research Papers", href: "/research" },
];

export function Footer({
  profile,
  services,
}: {
  profile: DoctorProfile;
  services: Service[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 overflow-hidden border-t border-white/10 bg-gradient-to-b from-[#1E4C94] to-[#0A1830]">
      {/* A crisp glowing line across the top, like a neon tube — this is
          what gives an actual "shine" quality, rather than a blurred
          patch that read as uneven/patchy against the gradient. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[2px] bg-[#4FC3F7] shadow-[0_0_16px_3px_rgba(79,195,247,0.7)]"
      />
      <Container className="relative py-16">
        <Reveal>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: identity */}
          <div>
            <p className="text-lg font-bold text-ink">{profile.name}</p>
            <p className="mt-1 text-sm text-accent">{profile.title}</p>
            <p className="mt-4 max-w-xs text-sm text-ink-muted">
              {profile.tagline}
            </p>
            <div className="mt-5 flex gap-4 text-ink-muted">
              <a
                href="#"
                aria-label="Facebook"
                className="transition-colors hover:text-accent"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>

          {/* Column 2: quick nav */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              Quick Navigation
            </p>
            <ul className="mt-4 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-muted hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: solutions offered */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              Solutions Offered
            </p>
            <ul className="mt-4 space-y-3">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-sm text-ink-muted hover:text-ink"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: about the doctor */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              About {profile.name}
            </p>
            <ul className="mt-4 space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-muted hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </Reveal>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-xs text-ink-faint">
            © {year} {profile.name}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
