import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

type PortalShellProps = {
  badge: string;
  title: string;
  description: string;
  actions?: ReactNode;
  navigation?: ReactNode;
  children: ReactNode;
};

export function PortalShell({
  badge,
  title,
  description,
  actions,
  navigation,
  children,
}: PortalShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0B0B0B] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[#F8C8DC]/14 blur-3xl" />
        <div className="absolute right-[-6rem] top-1/4 h-80 w-80 rounded-full bg-[#F5E6E8]/10 blur-3xl" />
        <div className="absolute bottom-[-4rem] left-1/3 h-72 w-72 rounded-full bg-[#F8C8DC]/8 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0B0B]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
          <Link
            to="/"
            className="text-sm font-semibold uppercase tracking-[0.28em] text-white/78 transition-colors duration-300 hover:text-[#F8C8DC]"
          >
            BeautyFlow
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F8C8DC]/35 hover:text-[#F8C8DC]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </Link>
        </div>

        {navigation ? (
          <div className="mx-auto max-w-7xl px-6 pb-4 lg:px-8">{navigation}</div>
        ) : null}
      </header>

      <main className="px-6 pb-16 pt-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-[#F8C8DC]/25 bg-[#F8C8DC]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#F8C8DC]">
                {badge}
              </span>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                {description}
              </p>
            </div>

            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>

          <div className="mt-10">{children}</div>
        </div>
      </main>
    </div>
  );
}
