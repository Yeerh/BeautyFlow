import { ArrowRight } from "lucide-react";
import { steps } from "../data/landingContent";
import { SectionHeading } from "./SectionHeading";

export function HowItWorks() {
  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Como funciona"
          title="Um fluxo direto para transformar interesse em agendamento confirmado"
          description="Toda a estrutura foi pensada para reduzir fricção e conduzir a pessoa até a confirmação com rapidez e segurança."
          align="center"
        />

        <div className="mt-12 grid gap-5 xl:grid-cols-4">
          {steps.map((item, index) => (
            <article
              key={item.step}
              className="relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-4xl font-semibold tracking-tight text-[#00C896]">
                  {item.step}
                </span>
                {index < steps.length - 1 ? (
                  <ArrowRight className="hidden h-5 w-5 text-white/30 xl:block" />
                ) : null}
              </div>
              <h3 className="mt-8 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/68">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
