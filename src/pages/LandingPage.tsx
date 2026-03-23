import { AboutApp } from "@/components/AboutApp";
import { Benefits } from "@/components/Benefits";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Navbar } from "@/components/Navbar";
import { Services } from "@/components/Services";
import { SocialProof } from "@/components/SocialProof";
import { Testimonials } from "@/components/Testimonials";

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0B0B0B] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-16 top-0 h-72 w-72 rounded-full bg-[#00C896]/14 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#00C896]/8 blur-3xl" />
      </div>

      <Navbar />

      <main>
        <Hero />
        <SocialProof />
        <Services />
        <AboutApp />
        <Benefits />
        <HowItWorks />
        <Testimonials />
        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}
