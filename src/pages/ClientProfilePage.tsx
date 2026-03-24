import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { CalendarDays, LoaderCircle, Mail, Phone, Upload, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RoleSidebarShell } from "@/components/RoleSidebarShell";
import { useClientAuth } from "@/context/ClientAuthContext";
import { contactLinks } from "@/data/landingContent";
import { buildClientMenu, clientRoutes } from "@/lib/portalNavigation";

export function ClientProfilePage() {
  const navigate = useNavigate();
  const { logout, updateProfile, user } = useClientAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    businessPhotoUrl: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm({
      name: user?.name || "",
      phone: user?.phone || "",
      businessPhotoUrl: user?.businessPhotoUrl || "",
    });
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate(contactLinks.clientPortal, { replace: true });
  };

  const menuItems = buildClientMenu(handleLogout);

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Selecione apenas arquivos de imagem.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";

      if (!result) {
        setUploadError("Não foi possível carregar a imagem selecionada.");
        return;
      }

      setForm((current) => ({
        ...current,
        businessPhotoUrl: result,
      }));
      setUploadError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    setIsSubmitting(true);

    try {
      await updateProfile(form);
      setSubmitSuccess("Perfil atualizado com sucesso.");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Não foi possível atualizar o perfil.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleSidebarShell
      badge="Perfil"
      title="Perfil"
      description="Atualize seus dados e a sua foto de perfil para deixar o atendimento mais completo."
      menuItems={menuItems}
      userName={user?.name || "BeautyFlow"}
      userSubtitle={user?.email || "Agenda pessoal"}
      userImageUrl={user?.businessPhotoUrl || null}
      actions={
        <button
          type="button"
          onClick={() => navigate(clientRoutes.history)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/72 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00C896]/35 hover:text-[#00C896]"
        >
          <CalendarDays className="h-4 w-4" />
          Ver minhas reservas
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
        >
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Editar perfil</h2>
              <p className="mt-1 text-sm text-white/60">
                Nome, telefone e foto ficam salvos na sua conta.
              </p>
            </div>
          </div>

          {(submitError || submitSuccess || uploadError) ? (
            <div className="mt-6 space-y-3">
              {submitError ? (
                <div className="rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
                  {submitError}
                </div>
              ) : null}
              {submitSuccess ? (
                <div className="rounded-[1.25rem] border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-3 text-sm text-[#d7fff4]">
                  {submitSuccess}
                </div>
              ) : null}
              {uploadError ? (
                <div className="rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
                  {uploadError}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="space-y-4">
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-black/20">
                {form.businessPhotoUrl ? (
                  <img
                    src={form.businessPhotoUrl}
                    alt={form.name || "Foto de perfil"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/50">
                    <UserRound className="h-14 w-14" />
                    <span className="text-sm">Sem foto de perfil</span>
                  </div>
                )}
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/72 transition-colors duration-300 hover:border-[#00C896]/35 hover:text-[#00C896]">
                <Upload className="h-4 w-4" />
                Enviar foto
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            <div className="space-y-4">
              <label className="space-y-2">
                <span className="text-sm text-white/60">Nome</span>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                  placeholder="Seu nome completo"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-white/60">Telefone</span>
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  className="w-full rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                  placeholder="(81) 99999-9999"
                  inputMode="tel"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-white/60">E-mail</span>
                <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-white/70">
                  <Mail className="h-4 w-4 text-[#00C896]" />
                  <span className="truncate">{user?.email || "Sem e-mail"}</span>
                </div>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00C896] px-6 py-3.5 text-sm font-semibold text-[#0B0B0B] shadow-[0_16px_40px_rgba(0,200,150,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2ed5a8]"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                {isSubmitting ? "Salvando perfil..." : "Salvar perfil"}
              </button>
            </div>
          </div>
        </form>

        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <h2 className="text-2xl font-semibold text-white">Resumo da conta</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Esses dados são usados para registrar o seu agendamento antes da abertura do
            WhatsApp.
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
              <span className="text-xs uppercase tracking-[0.18em] text-white/38">Nome atual</span>
              <p className="mt-3 text-base font-semibold text-white">
                {user?.name || "BeautyFlow"}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
              <span className="text-xs uppercase tracking-[0.18em] text-white/38">Telefone atual</span>
              <p className="mt-3 text-base font-semibold text-white">
                {user?.phone || "Sem telefone"}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-[#00C896]/18 bg-[#00C896]/10 p-4 text-sm leading-7 text-[#d7fff4]">
              Depois de salvar a foto, ela passa a aparecer no topo do seu portal.
            </div>
          </div>
        </section>
      </div>
    </RoleSidebarShell>
  );
}
