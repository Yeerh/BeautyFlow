import { MeshGradient } from "@paper-design/shaders-react";
import { useEffect, useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ButtonLink";

type HeroSectionProps = {
  id?: string;
  title?: string;
  highlightText?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  colors?: string[];
  distortion?: number;
  swirl?: number;
  speed?: number;
  offsetX?: number;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  buttonClassName?: string;
  maxWidth?: string;
  veilOpacity?: string;
  children?: ReactNode;
};

const defaultColors = [
  "#0B0B0B",
  "#1A1A1A",
  "#00C896",
  "#FFFFFF",
  "#F8C8DC",
  "#0B0B0B",
] as const;

function cn(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function HeroSection({
  id,
  title = "Agende seu atendimento em segundos",
  highlightText = "simples, rápido e profissional",
  description = "Um aplicativo para agendamento de serviços em barbearias e salões de beleza.",
  buttonText = "Agendar agora",
  onButtonClick,
  colors = [...defaultColors],
  distortion = 1.2,
  swirl = 0.65,
  speed = 0.8,
  offsetX = 0.08,
  className,
  contentClassName,
  titleClassName,
  descriptionClassName,
  buttonClassName,
  maxWidth = "max-w-6xl",
  veilOpacity = "bg-black/60",
  children,
}: HeroSectionProps) {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const update = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  const fallbackContent = (
    <div className={cn("mx-auto w-full px-6 py-24 text-center", maxWidth)}>
      <h1
        className={cn(
          "text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl",
          titleClassName,
        )}
      >
        {title} <span className="text-[#00C896]">{highlightText}</span>
      </h1>
      <p
        className={cn(
          "mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/72",
          descriptionClassName,
        )}
      >
        {description}
      </p>
      <div className="mt-10 flex justify-center">
        {onButtonClick ? (
          <button
            type="button"
            onClick={onButtonClick}
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-[#00C896] px-7 py-3.5 text-sm font-semibold text-[#0B0B0B] shadow-[0_16px_40px_rgba(0,200,150,0.28)] transition-transform duration-300 hover:-translate-y-0.5",
              buttonClassName,
            )}
          >
            {buttonText}
          </button>
        ) : (
          <ButtonLink href="#cta" className={cn("px-7 py-3.5", buttonClassName)}>
            {buttonText}
          </ButtonLink>
        )}
      </div>
    </div>
  );

  return (
    <section
      id={id}
      className={cn(
        "relative isolate overflow-hidden bg-[#0B0B0B]",
        mounted ? "min-h-screen" : "",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        {mounted ? (
          <>
            <MeshGradient
              width={dimensions.width}
              height={dimensions.height}
              colors={colors}
              distortion={distortion}
              swirl={swirl}
              grainMixer={0}
              grainOverlay={0}
              speed={speed}
              offsetX={offsetX}
            />
            <div className={cn("absolute inset-0", veilOpacity)} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,200,150,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(248,200,220,0.08),transparent_24%),linear-gradient(180deg,rgba(11,11,11,0.18)_0%,rgba(11,11,11,0.34)_28%,rgba(11,11,11,0.76)_100%)]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#0B0B0B]" />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.04]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(11,11,11,0.1)_58%,rgba(11,11,11,0.36)_100%)]" />
      </div>

      <div className={cn("relative z-10", contentClassName)}>
        {children ?? fallbackContent}
      </div>
    </section>
  );
}
