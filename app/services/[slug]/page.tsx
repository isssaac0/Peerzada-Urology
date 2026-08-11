import { notFound } from "next/navigation";
import { getServiceBySlug, getServiceSlugs } from "@/lib/content";
import { ServiceDetail } from "@/components/sections/ServiceDetail";

export async function generateStaticParams() {
  const slugs = await getServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const service = await getServiceBySlug(params.slug);
  return { title: service ? service.title : "Service" };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const service = await getServiceBySlug(params.slug);

  if (!service) {
    notFound();
  }

  return (
    <main>
      <ServiceDetail service={service} />
    </main>
  );
}
