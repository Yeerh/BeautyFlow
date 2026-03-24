import { useMemo, useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";

type SidebarMenuItem = {
  label: string;
  href?: string;
  icon: ReactNode;
  onClick?: () => void;
};

type RoleSidebarShellProps = {
  badge: string;
  title: string;
  description: string;
  menuItems: SidebarMenuItem[];
  userName: string;
  userSubtitle: string;
  userImageUrl?: string | null;
  actions?: ReactNode;
  navigation?: ReactNode;
  children: ReactNode;
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function SidebarLogo({ expanded }: { expanded: boolean }) {
  return (
    <Link
      to="/"
      className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-black/20 px-3 py-3 text-white transition-colors duration-200 hover:border-[#00C896]/35 hover:text-[#00C896]"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,#00C896,#F8C8DC)] text-sm font-bold text-[#0B0B0B]">
        BF
      </div>
      {expanded ? (
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em]">BeautyFlow</p>
          <p className="text-xs text-white/48">Painel do sistema</p>
        </div>
      ) : null}
    </Link>
  );
}

export function RoleSidebarShell({
  badge,
  title,
  description,
  menuItems,
  userName,
  userSubtitle,
  userImageUrl,
  actions,
  navigation,
  children,
}: RoleSidebarShellProps) {
  const [open, setOpen] = useState(false);
  const userInitials = useMemo(() => getInitials(userName || "BeautyFlow"), [userName]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0B0B] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[#F8C8DC]/14 blur-3xl" />
        <div className="absolute right-[-6rem] top-1/4 h-80 w-80 rounded-full bg-[#00C896]/10 blur-3xl" />
        <div className="absolute bottom-[-4rem] left-1/3 h-72 w-72 rounded-full bg-[#F8C8DC]/8 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col gap-6 p-4 sm:p-6 lg:flex-row">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-6 px-4 py-4">
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
              <SidebarLogo expanded={open} />

              <div className="mt-6 flex flex-col gap-2">
                {menuItems.map((item) => (
                  <SidebarLink key={item.label} link={item} />
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-3">
              <div className="flex items-center gap-3">
                {userImageUrl ? (
                  <img
                    src={userImageUrl}
                    alt={userName}
                    className="h-11 w-11 rounded-[1rem] object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white/10 text-sm font-semibold text-white">
                    {userInitials || "BF"}
                  </div>
                )}

                {open ? (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{userName}</p>
                    <p className="truncate text-xs text-white/48">{userSubtitle}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </SidebarBody>
        </Sidebar>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-full border border-[#F8C8DC]/25 bg-[#F8C8DC]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#F8C8DC]">
                    {badge}
                  </span>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/64 transition-colors duration-200 hover:border-[#00C896]/35 hover:text-[#00C896]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar ao site
                  </Link>
                </div>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  {title}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
                  {description}
                </p>
              </div>

              {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
            </div>

            {navigation ? <div className="mt-5 hidden">{navigation}</div> : null}
          </header>

          <main className="mt-6 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
