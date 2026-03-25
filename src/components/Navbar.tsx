import { CalendarCheck2, Home, LogIn, Sparkles, Store, UserRound } from "lucide-react";
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
        <div className="flex items-center gap-2">
          <Link
            to={contactLinks.publicBarbershops}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00C896]/35 hover:text-[#00C896]"
          >
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Barbearias</span>
          </Link>
          <Link
            to={contactLinks.clientPortal}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-3 text-sm font-semibold text-[#00C896] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#00C896]/16"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Login</span>
          </Link>
        </div>
      }
    />
  );
}
