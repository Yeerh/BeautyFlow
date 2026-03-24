import { useRef } from "react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";

export type SparkItem = {
  id: number;
  imageSrc: string;
  title: string;
  count: number;
  countLabel: string;
  subtitle?: string;
  description?: string;
  href?: string;
  ctaLabel?: string;
};

type SparksCarouselProps = {
  title: string;
  subtitle: string;
  items: SparkItem[];
};

export function SparksCarousel({ title, subtitle, items }: SparksCarouselProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  function scrollCarousel(direction: "left" | "right") {
    const container = carouselRef.current;

    if (!container) {
      return;
    }

    const amount = Math.max(container.clientWidth * 0.82, 320);

    container.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  }

  return (
    <div className="rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,200,150,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(248,200,220,0.12),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#00C896]">
            Prova social
          </span>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/62 sm:text-base">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => scrollCarousel("left")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#00C896]/20 bg-[#00C896]/10 text-[#00C896] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#00C896] hover:text-[#0B0B0B]"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel("right")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#F8C8DC]/20 bg-[#F8C8DC]/10 text-[#F8C8DC] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F8C8DC] hover:text-[#0B0B0B]"
            aria-label="Avancar"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <article
            key={item.id}
            className="group min-w-[88%] snap-start sm:min-w-[28rem] lg:min-w-[24rem]"
          >
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0E0E0E] shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00C896]/25">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.imageSrc}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,11,0.08),rgba(5,7,11,0.84))]" />

                <div className="absolute right-4 top-4 rounded-[1.2rem] border border-white/10 bg-black/35 px-4 py-3 text-right backdrop-blur-xl">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-white/55">
                    {item.countLabel}
                  </span>
                  <span className="mt-1 block text-2xl font-semibold text-white">
                    {String(item.count).padStart(2, "0")}
                  </span>
                </div>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
                <div>
                  <h4 className="text-2xl font-semibold leading-tight text-white">
                    {item.title}
                  </h4>
                  {item.subtitle ? (
                    <p className="mt-3 text-sm font-medium text-[#00C896]">{item.subtitle}</p>
                  ) : null}
                </div>

                {item.description ? (
                  <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white/68">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#F8C8DC]" />
                    {item.description}
                  </div>
                ) : null}

                {item.href ? (
                  <a
                    href={item.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors duration-300 hover:text-[#00C896]"
                  >
                    {item.ctaLabel || "Ver detalhes"}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
