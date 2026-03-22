import { Facebook, Instagram, MessageCircle, PhoneCall } from "lucide-react";
import { contactLinks, navLinks } from "../data/landingContent";

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          <a href="#inicio" className="text-lg font-semibold tracking-[0.18em] text-white">
            BeautyFlow
          </a>
          <p className="mt-4 text-sm leading-7 text-white/65">
            Clínica de estética com posicionamento premium, foco em experiência e uma jornada pensada para conversão.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#F8C8DC]">Navegação</p>
            <div className="mt-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-white/65 transition-colors duration-300 hover:text-[#F8C8DC]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#F8C8DC]">Contato</p>
            <div className="mt-4 space-y-3 text-sm text-white/65">
              <a
                href={`tel:${contactLinks.phone.replace(/\D/g, "")}`}
                className="flex items-center gap-3 transition-colors duration-300 hover:text-[#F8C8DC]"
              >
                <PhoneCall className="h-4 w-4" />
                {contactLinks.phone}
              </a>
              <a
                href={contactLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 transition-colors duration-300 hover:text-[#F8C8DC]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={`mailto:${contactLinks.email}`}
                className="transition-colors duration-300 hover:text-[#F8C8DC]"
              >
                {contactLinks.email}
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#F8C8DC]">Redes sociais</p>
            <div className="mt-4 flex gap-3">
              <a
                href={contactLinks.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F8C8DC]/40 hover:text-[#F8C8DC]"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={contactLinks.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F8C8DC]/40 hover:text-[#F8C8DC]"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-white/45">
        © {new Date().getFullYear()} BeautyFlow. Todos os direitos reservados.
      </div>
    </footer>
  );
}
