import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  url: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
};

type NavBarProps = {
  items: readonly NavItem[];
  className?: string;
  action?: ReactNode;
};

export function NavBar({ items, className, action }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0]?.url ?? "");

  useEffect(() => {
    const syncFromHash = () => {
      const currentHash = window.location.hash || items[0]?.url || "";
      setActiveTab(currentHash);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);

    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [items]);

  return (
    <div
      className={cn(
        "fixed bottom-5 left-1/2 z-50 -translate-x-1/2 md:bottom-auto md:top-5",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0B0B0B]/72 px-2 py-2 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.url;

            return (
              <a
                key={item.name}
                href={item.url}
                onClick={() => setActiveTab(item.url)}
                className={cn(
                  "relative cursor-pointer rounded-full px-4 py-2.5 text-sm font-medium text-white/70 transition-colors duration-300 hover:text-[#00C896] md:px-5",
                  isActive && "text-[#00C896]",
                )}
              >
                <span className="hidden md:inline">{item.name}</span>
                <span className="md:hidden">
                  <Icon size={18} strokeWidth={2.2} />
                </span>
                {isActive ? (
                  <motion.div
                    layoutId="tubelight-navbar"
                    className="absolute inset-0 -z-10 rounded-full bg-[#00C896]/10"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 26,
                    }}
                  >
                    <div className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-[#00C896]">
                      <div className="absolute -left-2 -top-2 h-6 w-12 rounded-full bg-[#00C896]/25 blur-md" />
                      <div className="absolute -top-1 h-6 w-8 rounded-full bg-[#00C896]/20 blur-md" />
                      <div className="absolute left-2 top-0 h-4 w-4 rounded-full bg-[#00C896]/25 blur-sm" />
                    </div>
                  </motion.div>
                ) : null}
              </a>
            );
          })}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
