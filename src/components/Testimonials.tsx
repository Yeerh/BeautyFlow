import { Star } from "lucide-react";
import { testimonials } from "../data/landingContent";
import { SectionHeading } from "./SectionHeading";

export function Testimonials() {
  return (
    <section id="depoimentos" className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Depoimentos"
          title="Percepção premium que se reflete em comentários e indicações"
          description="Quando a jornada é clara, elegante e eficiente, a confiança aparece de forma natural nas avaliações."
        />

        <div className="mt-12 grid gap-5 xl:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/8 to-white/[0.03] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-[#F8C8DC]/30"
            >
              <div className="flex gap-1 text-[#F8C8DC]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={`${testimonial.name}-${index}`} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-6 text-base leading-8 text-white/78">"{testimonial.comment}"</p>
              <div className="mt-8 border-t border-white/10 pt-5">
                <p className="text-lg font-semibold text-white">{testimonial.name}</p>
                <p className="mt-1 text-sm text-white/55">{testimonial.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
