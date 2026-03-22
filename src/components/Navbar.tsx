import { CalendarCheck2, Home, Sparkles, UserRound } from "lucide-react";
import { NavBar as TubelightNavBar } from "@/components/ui/tubelight-navbar";

const navItems = [
  { name: "Início", url: "#inicio", icon: Home },
  { name: "Serviços", url: "#servicos", icon: Sparkles },
  { name: "Sobre", url: "#sobre", icon: UserRound },
  { name: "Agendar", url: "#cta", icon: CalendarCheck2 },
] as const;

export function Navbar() {
  return <TubelightNavBar items={navItems} />;
}
