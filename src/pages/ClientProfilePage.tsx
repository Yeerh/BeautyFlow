import { CalendarDays, Mail, Phone, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RoleSidebarShell } from "@/components/RoleSidebarShell";
import { useClientAuth } from "@/context/ClientAuthContext";
import { contactLinks } from "@/data/landingContent";
import { buildClientMenu, clientRoutes } from "@/lib/portalNavigation";

export function ClientProfilePage() {
  const navigate = useNavigate();
  const { logout, user } = useClientAuth();

  const handleLogout = () => {
    logout();
    navigate(contactLinks.clientPortal, { replace: true });
  };

  const menuItems = buildClientMenu(handleLogout);

  return (
    <RoleSidebarShell
      badge="Cliente"
      title="Perfil"
      description="Seus dados de conta ficam concentrados aqui para facilitar o próximo agendamento."
      menuItems={menuItems}
      userName={user?.name || "Cliente BeautyFlow"}
      userSubtitle={user?.email || "Área do cliente"}
      actions={
        <button
          type="button"
          onClick={() => navigate(clientRoutes.bookings)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/72 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00C896]/35 hover:text-[#00C896]"
        >
          <CalendarDays className="h-4 w-4" />
          Ir para agendamentos
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
            <UserRound className="h-5 w-5" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-white">Dados da conta</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Essas informações são usadas no registro da reserva.
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
              <span className="text-xs uppercase tracking-[0.18em] text-white/38">Nome</span>
              <p className="mt-3 text-base font-semibold text-white">
                {user?.name || "Cliente BeautyFlow"}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
              <span className="text-xs uppercase tracking-[0.18em] text-white/38">E-mail</span>
              <p className="mt-3 break-all text-base font-semibold text-white">
                {user?.email || "Sem e-mail"}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
              <span className="text-xs uppercase tracking-[0.18em] text-white/38">
                Telefone
              </span>
              <p className="mt-3 text-base font-semibold text-white">
                {user?.phone || "Sem telefone"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <h2 className="text-2xl font-semibold text-white">Resumo da conta</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Use este painel rápido para conferir o cadastro antes de marcar um horário.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/8 bg-black/20 p-4 text-white/74">
              <Mail className="h-5 w-5 text-[#00C896]" />
              <div>
                <p className="text-sm font-semibold text-white">Login principal</p>
                <p className="text-sm text-white/58">{user?.email || "Não informado"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/8 bg-black/20 p-4 text-white/74">
              <Phone className="h-5 w-5 text-[#00C896]" />
              <div>
                <p className="text-sm font-semibold text-white">Contato usado na reserva</p>
                <p className="text-sm text-white/58">{user?.phone || "Não informado"}</p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#00C896]/18 bg-[#00C896]/10 p-4 text-sm leading-7 text-[#d7fff4]">
              Ao escolher um local, o sistema já aproveita seu cadastro para registrar o
              agendamento antes de abrir o WhatsApp.
            </div>
          </div>
        </section>
      </div>
    </RoleSidebarShell>
  );
}
