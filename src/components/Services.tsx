import { Droplets, Gem, Heart, Leaf, Sparkles, SunMedium } from "lucide-react";
import { services } from "../data/landingContent";
import { SectionHeading } from "./SectionHeading";

const iconMap = {
  sparkles: Sparkles,
  droplets: Droplets,
  gem: Gem,
  heart: Heart,
  leaf: Leaf,
  sun: SunMedium,
} as const;

export function Services() {
  return (
    <section id="servicos" className="scroll-mt-28 px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Serviços"
          title="Protocolos estéticos pensados para valor percebido e recorrência"
          description="Cada tratamento foi posicionado para comunicar sofisticação, benefício claro e segurança na tomada de decisão."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = iconMap[service.icon];

            return (
              <article
                key={service.title}
                className="group rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/8 to-white/[0.03] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-[#F8C8DC]/35"
              >
                <div className="inline-flex rounded-2xl border border-[#F8C8DC]/25 bg-[#F8C8DC]/10 p-3 text-[#F8C8DC] transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/68">{service.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
