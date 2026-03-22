import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  external?: boolean;
  className?: string;
};

const variants = {
  primary:
    "bg-[#F8C8DC] text-[#0B0B0B] shadow-[0_16px_40px_rgba(248,200,220,0.35)] hover:-translate-y-0.5 hover:bg-[#ffd8e8]",
  secondary:
    "border border-white/15 bg-white/5 text-white hover:-translate-y-0.5 hover:border-[#F8C8DC]/50 hover:bg-white/10",
} as const;

export function ButtonLink({
  href,
  children,
  variant = "primary",
  icon,
  external = false,
  className = "",
}: ButtonLinkProps) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ${variants[variant]} ${className}`.trim()}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      <span>{children}</span>
      {icon ?? <ArrowUpRight className="h-4 w-4" />}
    </a>
  );
}
