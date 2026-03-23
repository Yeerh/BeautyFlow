import { Star } from "lucide-react";
import { testimonials } from "../data/landingContent";
import { SectionHeading } from "./SectionHeading";

const avatarShells = [
  "from-[#00C896]/18 to-white/10",
  "from-white/[0.08] to-white/[0.02]",
  "from-[#00C896]/12 to-white/[0.06]",
] as const;

export function Testimonials() {
  return (
    <section id="depoimentos" className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Depoimentos"
          title="Confiança que se reflete em comentários e indicações"
          description="Quando a jornada é clara, rápida e bem apresentada, a percepção de profissionalismo aparece naturalmente nas avaliações."
        />

        <div className="mt-12 grid gap-5 xl:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial.name}
              className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/8 to-white/[0.03] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00C896]/25"
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br ${avatarShells[index % avatarShells.length]} text-[#00C896]`}
                >
                  <span className="material-symbols-rounded text-[30px] leading-none">
                    {testimonial.avatarIcon}
                  </span>
                </div>

                <div className="flex gap-1 text-[#00C896]">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={`${testimonial.name}-${starIndex}`}
                      className="h-4 w-4 fill-current"
                    />
                  ))}
                </div>
              </div>

              <p className="mt-6 text-base leading-8 text-white/78">
                "{testimonial.comment}"
              </p>

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
