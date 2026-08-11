import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { getDoctorProfile, getServices } from "@/lib/content";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { DnaBackground } from "@/components/ui/DnaBackground";
import { Sparkles } from "@/components/ui/Sparkles";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { Loader } from "@/components/ui/Loader";
import { VideoModalProvider } from "@/components/ui/VideoModal";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Dr. Peerzada Faisal Masood | Urology & Renal Transplant",
  description:
    "Advanced urology, uro-oncology, and robotic surgery care.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, services] = await Promise.all([
    getDoctorProfile(),
    getServices(),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${inter.variable}`}>
        {/* Runs before hydration so the correct theme class is already
            set by the time anything paints — avoids a flash of the
            wrong theme on load. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('theme')==='light'){document.documentElement.classList.add('light');}}catch(e){}})();`,
          }}
        />
        <Loader name={profile.name} />
        <ScrollProgressBar />
        <DnaBackground />
        <Sparkles />
        <VideoModalProvider>
          <Header profile={profile} />
          {children}
          <Footer profile={profile} services={services} />
        </VideoModalProvider>
      </body>
    </html>
  );
}
