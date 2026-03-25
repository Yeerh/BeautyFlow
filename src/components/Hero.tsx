import { LogIn, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { ButtonLink } from "@/components/ButtonLink";
import { MinimalistHero } from "@/components/ui/minimalist-hero";
import { Typewriter } from "@/components/ui/typewriter-text";
import { contactLinks } from "@/data/landingContent";

const heroNavLinks = [
  { label: "INICIO", href: "#inicio" },
  { label: "SERVICOS", href: "#servicos" },
  { label: "SOBRE", href: contactLinks.aboutPlatform },
  { label: "LOCAIS", href: "#locais" },
  { label: "PLANOS", href: "#beneficios" },
] as const;

export function Hero() {
  return (
    <MinimalistHero
      id="inicio"
      logoText="BeautyFlow."
      navLinks={heroNavLinks}
      leadText="Aplicativo de agendamento para negocios de beleza"
      title={
        <Typewriter
          text={["Agende seu atendimento"]}
          speed={42}
          loop={false}
          className="block min-h-[2.8em] max-w-4xl text-[#F8C8DC]"
          cursorClassName="bg-[#F8C8DC]"
        />
      }
      description={
        <>
          Um sistema pensado para barbearias, saloes, clinicas de estetica e
          studios que precisam de uma experiencia mais profissional, rapida e
          clara para converter agendamentos.
        </>
      }
      primaryAction={
        <ButtonLink href={contactLinks.schedule} className="px-7 py-3.5">
          Agendar atendimento
        </ButtonLink>
      }
      secondaryAction={
        <ButtonLink
          href={contactLinks.whatsapp}
          variant="secondary"
          external
          icon={<MessageCircle className="h-4 w-4" />}
          className="px-7 py-3.5"
        >
          Falar no WhatsApp
        </ButtonLink>
      }
      imageSrc="/woman-getting-treatment-hairdresser-shop.jpg"
      imageAlt="Atendimento em salao de beleza"
      overlayText={{
        part1: "beauty",
        part2: "flow.",
      }}
      headerAction={
        <Link
          to={contactLinks.clientPortal}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-3 text-sm font-semibold text-[#00C896] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#00C896]/16"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Login</span>
        </Link>
      }
    />
  );
}
