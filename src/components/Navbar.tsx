import { useState } from "react";
import { ArrowUpRight, Menu, MessageCircle, X } from "lucide-react";
import { ButtonLink } from "./ButtonLink";
import { contactLinks, navLinks } from "../data/landingContent";

const logoSrc = "/logo%20(2).png";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6">
        <nav className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.04))] px-4 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-4">
            <a href="#inicio" className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/90 p-2 shadow-[0_10px_30px_rgba(248,200,220,0.18)]">
                <img
                  src={logoSrc}
                  alt="Logotipo BeautyFlow"
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block text-sm font-semibold uppercase tracking-[0.24em] text-white">
                  BeautyFlow
                </span>
                <span className="block text-xs text-white/55">
                  Clínica de estética premium
                </span>
              </span>
            </a>

            <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-black/25 p-1.5 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm text-white/70 transition-all duration-300 hover:bg-white/6 hover:text-[#F8C8DC]"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <a
                href={contactLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white/75 transition-all duration-300 hover:border-[#F8C8DC]/40 hover:text-[#F8C8DC]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <ButtonLink
                href={contactLinks.schedule}
                className="px-5 py-2.5 text-sm"
                icon={<ArrowUpRight className="h-4 w-4" />}
              >
                Agendar Agora
              </ButtonLink>
            </div>

            <button
              type="button"
              aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white transition-colors duration-300 hover:border-[#F8C8DC]/50 hover:text-[#F8C8DC] md:hidden"
              onClick={() => setIsOpen((current) => !current)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {isOpen ? (
            <div className="mt-4 rounded-[1.75rem] border border-white/10 bg-black/35 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)] md:hidden">
              <div className="space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block rounded-2xl px-3 py-3 text-sm text-white/80 transition-colors duration-300 hover:bg-white/5 hover:text-[#F8C8DC]"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              </div>
              <div className="mt-4 grid gap-3 border-t border-white/10 pt-4">
                <a
                  href={contactLinks.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-medium text-white/80 transition-colors duration-300 hover:border-[#F8C8DC]/40 hover:text-[#F8C8DC]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Falar no WhatsApp
                </a>
                <ButtonLink href={contactLinks.schedule} className="flex w-full">
                  Agendar Agora
                </ButtonLink>
              </div>
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
