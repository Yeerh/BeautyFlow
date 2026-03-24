import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

type SidebarItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  onClick?: () => void;
};

type SidebarContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
};

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined);

function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider.");
  }

  return context;
}

function SidebarProvider({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) {
  const [openState, setOpenState] = React.useState(false);
  const open = openProp ?? openState;
  const setOpen = setOpenProp ?? setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
}

export function SidebarBody(props: React.ComponentProps<typeof motion.div>) {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
}

function DesktopSidebar({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) {
  const { open, setOpen, animate } = useSidebar();

  return (
    <motion.aside
      className={cn(
        "hidden h-full flex-shrink-0 md:flex md:flex-col",
        "w-[300px] overflow-hidden rounded-[2rem] border border-white/10",
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]",
        "shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl",
        className,
      )}
      animate={{
        width: animate ? (open ? "300px" : "88px") : "300px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.aside>
  );
}

function MobileSidebar({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { open, setOpen } = useSidebar();

  return (
    <>
      <div
        className={cn(
          "flex w-full items-center justify-between rounded-[1.5rem] border border-white/10",
          "bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]",
          "px-4 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl md:hidden",
          className,
        )}
        {...props}
      >
        <span className="text-sm font-semibold uppercase tracking-[0.28em] text-white/72">
          BeautyFlow
        </span>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/72 transition-colors duration-200 hover:border-[#00C896]/35 hover:text-[#00C896]"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={cn(
              "fixed inset-0 z-[100] flex h-full w-full flex-col justify-between",
              "bg-[#0B0B0B] p-5 text-white",
              className,
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/72 transition-colors duration-200 hover:border-[#00C896]/35 hover:text-[#00C896]"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function SidebarLabel({ children }: { children: React.ReactNode }) {
  const { open, animate } = useSidebar();

  return (
    <motion.span
      animate={{
        display: animate ? (open ? "inline-block" : "none") : "inline-block",
        opacity: animate ? (open ? 1 : 0) : 1,
      }}
      className="text-sm font-medium text-white/74 transition duration-150 group-hover/sidebar:translate-x-1 group-hover/sidebar:text-white"
    >
      {children}
    </motion.span>
  );
}

export function SidebarLink({
  link,
  className,
}: {
  link: SidebarItem;
  className?: string;
}) {
  const baseClassName = cn(
    "group/sidebar flex items-center gap-3 rounded-[1.2rem] border border-transparent px-3 py-3 transition-all duration-200",
    "text-white/74 hover:border-white/10 hover:bg-white/[0.06] hover:text-white",
    className,
  );

  if (link.onClick) {
    return (
      <button type="button" onClick={link.onClick} className={baseClassName}>
        <span className="flex h-5 w-5 items-center justify-center">{link.icon}</span>
        <SidebarLabel>{link.label}</SidebarLabel>
      </button>
    );
  }

  return (
    <NavLink
      to={link.href || "/"}
      className={({ isActive }) =>
        cn(
          baseClassName,
          isActive && "border-[#00C896]/25 bg-[#00C896]/12 text-white",
        )
      }
    >
      <span className="flex h-5 w-5 items-center justify-center">{link.icon}</span>
      <SidebarLabel>{link.label}</SidebarLabel>
    </NavLink>
  );
}
