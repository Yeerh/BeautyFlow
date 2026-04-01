import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

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
  showBackLink?: boolean;
  hideHeaderIntro?: boolean;
  menuItems: SidebarMenuItem[];
  userName: string;
  userSubtitle: string;
  userImageUrl?: string | null;
  actions?: ReactNode;
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

function ShellLogo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-black/20 px-3 py-3 text-white transition-colors duration-200 hover:border-[#00C896]/35 hover:text-[#00C896]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,#00C896,#F8C8DC)] text-sm font-bold text-[#0B0B0B]">
        BF
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em]">BeautyFlow</p>
        <p className="text-xs text-white/48">Portal do sistema</p>
      </div>
    </Link>
  );
}

function UserCard({
  userImageUrl,
  userName,
  userSubtitle,
}: {
  userImageUrl?: string | null;
  userName: string;
  userSubtitle: string;
}) {
  const initials = useMemo(() => getInitials(userName || "BeautyFlow"), [userName]);

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-3">
      <div className="flex items-center gap-3">
        {userImageUrl ? (
          <img
            src={userImageUrl}
            alt={userName}
            className="h-12 w-12 rounded-[1rem] object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white/10 text-sm font-semibold text-white">
            {initials || "BF"}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{userName}</p>
          <p className="truncate text-xs text-white/48">{userSubtitle}</p>
        </div>
      </div>
    </div>
  );
}

function DesktopSidebarItem({ item }: { item: SidebarMenuItem }) {
  const baseClassName =
    "flex w-full items-center gap-3 rounded-[1.25rem] border border-transparent px-4 py-3 text-left text-sm font-medium text-white/74 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-white";

  if (item.onClick) {
    return (
      <button type="button" onClick={item.onClick} className={baseClassName}>
        <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
        <span>{item.label}</span>
      </button>
    );
  }

  return (
    <NavLink
      to={item.href || "/"}
      className={({ isActive }) =>
        cn(
          baseClassName,
          isActive && "border-[#00C896]/25 bg-[#00C896]/12 text-white",
        )
      }
    >
      <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
      <span>{item.label}</span>
    </NavLink>
  );
}

function MobileSidebarItem({
  item,
  onNavigate,
}: {
  item: SidebarMenuItem;
  onNavigate: () => void;
}) {
  const baseClassName =
    "flex w-full items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm font-medium text-white/78 transition-all duration-200 hover:border-[#00C896]/35 hover:text-white";

  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={() => {
          onNavigate();
          item.onClick?.();
        }}
        className={baseClassName}
      >
        <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
        <span>{item.label}</span>
      </button>
    );
  }

  return (
    <NavLink
      to={item.href || "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          baseClassName,
          isActive && "border-[#00C896]/30 bg-[#00C896]/12 text-white",
        )
      }
    >
      <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
      <span>{item.label}</span>
    </NavLink>
  );
}

function MobileQuickAccessItem({ item }: { item: SidebarMenuItem }) {
  const baseClassName =
    "inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/78 transition-all duration-200 hover:border-[#00C896]/35 hover:text-white";

  if (item.onClick) {
    return (
      <button type="button" onClick={item.onClick} className={baseClassName}>
        <span className="flex h-4 w-4 items-center justify-center">{item.icon}</span>
        <span className="whitespace-nowrap">{item.label}</span>
      </button>
    );
  }

  return (
    <NavLink
      to={item.href || "/"}
      className={({ isActive }) =>
        cn(baseClassName, isActive && "border-[#00C896]/30 bg-[#00C896]/12 text-white")
      }
    >
      <span className="flex h-4 w-4 items-center justify-center">{item.icon}</span>
      <span className="whitespace-nowrap">{item.label}</span>
    </NavLink>
  );
}

export function RoleSidebarShell({
  badge,
  title,
  description,
  showBackLink = true,
  hideHeaderIntro = false,
  menuItems,
  userName,
  userSubtitle,
  userImageUrl,
  actions,
  children,
}: RoleSidebarShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasHeaderMeta = !hideHeaderIntro && Boolean(badge || title || description || showBackLink);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = mobileOpen ? "hidden" : previousOverflow;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0B0B] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[#F8C8DC]/14 blur-3xl" />
        <div className="absolute right-[-6rem] top-1/4 h-80 w-80 rounded-full bg-[#00C896]/10 blur-3xl" />
        <div className="absolute bottom-[-4rem] left-1/3 h-72 w-72 rounded-full bg-[#F8C8DC]/8 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:items-start">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-full max-w-[320px] flex-shrink-0 lg:flex">
          <div className="flex h-full w-full flex-col rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <ShellLogo />

            <nav className="mt-6 flex-1 space-y-2 overflow-y-auto pr-1">
              {menuItems.map((item) => (
                <DesktopSidebarItem key={item.label} item={item} />
              ))}
            </nav>

            <UserCard
              userImageUrl={userImageUrl}
              userName={userName}
              userSubtitle={userSubtitle}
            />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="lg:hidden">
            <div className="flex items-center justify-between rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-4 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-white/76">
                BeautyFlow
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/74 transition-colors duration-200 hover:border-[#00C896]/35 hover:text-[#00C896]"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {menuItems.map((item) => (
                <MobileQuickAccessItem key={`quick-${item.label}`} item={item} />
              ))}
            </nav>
          </div>

          <AnimatePresence>
            {mobileOpen ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 lg:hidden"
              >
                <button
                  type="button"
                  aria-label="Fechar menu"
                  onClick={() => setMobileOpen(false)}
                  className="absolute inset-0 bg-black/70"
                />
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="relative flex h-full w-[88vw] max-w-sm flex-col border-r border-white/10 bg-[#0F0F0F] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <ShellLogo />
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/74 transition-colors duration-200 hover:border-[#00C896]/35 hover:text-[#00C896]"
                      aria-label="Fechar menu"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <nav className="mt-6 flex-1 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                      <MobileSidebarItem
                        key={item.label}
                        item={item}
                        onNavigate={() => setMobileOpen(false)}
                      />
                    ))}
                  </nav>

                  <UserCard
                    userImageUrl={userImageUrl}
                    userName={userName}
                    userSubtitle={userSubtitle}
                  />
                </motion.aside>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <header className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-7">
            <div
              className={cn(
                "flex flex-col gap-6 lg:flex-row lg:items-end",
                hasHeaderMeta ? "lg:justify-between" : "lg:justify-end",
              )}
            >
              {hasHeaderMeta ? (
                <div className="max-w-3xl">
                  {(badge || showBackLink) ? (
                    <div className="flex flex-wrap items-center gap-3">
                      {badge ? (
                        <span className="inline-flex items-center rounded-full border border-[#F8C8DC]/25 bg-[#F8C8DC]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#F8C8DC]">
                          {badge}
                        </span>
                      ) : null}
                      {showBackLink ? (
                        <Link
                          to="/"
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/64 transition-colors duration-200 hover:border-[#00C896]/35 hover:text-[#00C896]"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Voltar ao site
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                  {title ? (
                    <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                      {title}
                    </h1>
                  ) : null}
                  {description ? (
                    <p className="mt-4 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
                      {description}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
            </div>
          </header>

          <main className="mt-6 min-w-0 pb-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
