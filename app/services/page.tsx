import { getServices } from "@/lib/content";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = {
  title: "Services & Solutions",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <main>
      <section className="bg-navy-radial pb-12 pt-28 sm:pb-16 sm:pt-36">
        <Reveal className="mx-auto w-full max-w-4xl px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent">
            <span className="crosshair-mark" aria-hidden="true" />
            Solutions Offered
          </div>
          <h1 className="text-3xl font-bold text-ink sm:text-5xl">
            Focused urological care, across every specialty
          </h1>
        </Reveal>
      </section>
      <ServicesGrid services={services} heading="All Specialties" />
    </main>
  );
}
