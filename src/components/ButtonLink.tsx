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
    "bg-[#00C896] text-[#0B0B0B] shadow-[0_16px_40px_rgba(0,200,150,0.28)] hover:-translate-y-0.5 hover:bg-[#19d9a7]",
  secondary:
    "border border-white/15 bg-white/[0.04] text-white hover:-translate-y-0.5 hover:border-[#00C896]/45 hover:bg-white/[0.08]",
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
