import { CalendarCheck2, Home, LogIn, Sparkles, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { contactLinks } from "@/data/landingContent";
import { NavBar as TubelightNavBar } from "@/components/ui/tubelight-navbar";

const navItems = [
  { name: "Início", url: "#inicio", icon: Home },
  { name: "Serviços", url: "#servicos", icon: Sparkles },
  { name: "Sobre", url: "#sobre", icon: UserRound },
  { name: "Agendar", url: "#cta", icon: CalendarCheck2 },
] as const;

export function Navbar() {
  return (
    <TubelightNavBar
      items={navItems}
      action={
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
