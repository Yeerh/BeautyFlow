import type { CSSProperties, ReactNode } from "react";
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
  speed?: number;
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
};

const defaultColors = ["#F8C8DC", "#F5E6E8", "#FFFFFF"] as const;

function cn(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const safeHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const value = Number.parseInt(safeHex, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function HeroSection({
  id,
  title = "Sua agenda cheia todos os dias",
  highlightText = "sem depender só do Instagram",
  description = "Automatize seus agendamentos, reduza faltas e aumente seu faturamento.",
  buttonText = "Agendar agora",
  onButtonClick,
  colors = [...defaultColors],
  distortion = 1.2,
  speed = 0.8,
  className,
  contentClassName,
  children,
}: HeroSectionProps) {
  const [primary, secondary, tertiary] = [
    colors[0] ?? defaultColors[0],
    colors[1] ?? defaultColors[1],
    colors[2] ?? defaultColors[2],
  ];

  const velocity = Math.max(speed, 0.15);
  const blur = Math.max(80, Math.round(110 * distortion));

  const layerOneStyle: CSSProperties = {
    background: `radial-gradient(circle, ${withAlpha(primary, 0.42)} 0%, ${withAlpha(primary, 0.08)} 42%, transparent 72%)`,
    filter: `blur(${blur}px)`,
    animation: `hero-shader-float ${26 / velocity}s ease-in-out infinite`,
  };

  const layerTwoStyle: CSSProperties = {
    background: `radial-gradient(circle, ${withAlpha(secondary, 0.32)} 0%, ${withAlpha(secondary, 0.08)} 40%, transparent 70%)`,
    filter: `blur(${Math.round(blur * 0.9)}px)`,
    animation: `hero-shader-drift ${22 / velocity}s ease-in-out infinite`,
  };

  const layerThreeStyle: CSSProperties = {
    background: `radial-gradient(circle, ${withAlpha(tertiary, 0.22)} 0%, ${withAlpha(tertiary, 0.05)} 38%, transparent 66%)`,
    filter: `blur(${Math.round(blur * 1.08)}px)`,
    animation: `hero-shader-pulse ${16 / velocity}s ease-in-out infinite`,
  };

  const backgroundMesh: CSSProperties = {
    background: [
      `radial-gradient(circle at 20% 18%, ${withAlpha(primary, 0.18)} 0%, transparent 28%)`,
      `radial-gradient(circle at 82% 12%, ${withAlpha(secondary, 0.14)} 0%, transparent 24%)`,
      `radial-gradient(circle at 50% 72%, ${withAlpha(tertiary, 0.1)} 0%, transparent 30%)`,
      "linear-gradient(180deg, rgba(11,11,11,0.96) 0%, rgba(11,11,11,0.9) 52%, rgba(11,11,11,0.98) 100%)",
    ].join(", "),
  };

  const fallbackContent = (
    <div className="mx-auto max-w-4xl px-6 py-24 text-center lg:px-8">
      <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
        {title} <span className="text-[#F8C8DC]">{highlightText}</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/72">
        {description}
      </p>
      <div className="mt-10 flex justify-center">
        {onButtonClick ? (
          <button
            type="button"
            onClick={onButtonClick}
            className="inline-flex items-center justify-center rounded-full bg-[#F8C8DC] px-7 py-3.5 text-sm font-semibold text-[#0B0B0B] shadow-[0_16px_40px_rgba(248,200,220,0.35)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            {buttonText}
          </button>
        ) : (
          <ButtonLink href="#cta" className="px-7 py-3.5">
            {buttonText}
          </ButtonLink>
        )}
      </div>
    </div>
  );

  return (
    <section
      id={id}
      className={cn("relative isolate overflow-hidden bg-[#0B0B0B]", className)}
    >
      <div className="pointer-events-none absolute inset-0" style={backgroundMesh} />
      <div
        className="pointer-events-none absolute -left-[12%] top-[-8%] h-[24rem] w-[24rem] rounded-full"
        style={layerOneStyle}
      />
      <div
        className="pointer-events-none absolute right-[-12%] top-[10%] h-[22rem] w-[22rem] rounded-full"
        style={layerTwoStyle}
      />
      <div
        className="pointer-events-none absolute bottom-[-12%] left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full"
        style={layerThreeStyle}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.045]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(11,11,11,0.06)_55%,rgba(11,11,11,0.36)_100%)]" />

      <div className={cn("relative z-10", contentClassName)}>
        {children ?? fallbackContent}
      </div>
    </section>
  );
}
