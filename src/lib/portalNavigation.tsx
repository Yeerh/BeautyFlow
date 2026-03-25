import {
  BookUser,
  CalendarDays,
  CircleDollarSign,
  LayoutPanelTop,
  LogOut,
  MapPin,
  Scissors,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";

export type SidebarMenuItem = {
  label: string;
  href?: string;
  icon: ReactNode;
  onClick?: () => void;
};

export const clientRoutes = {
  bookings: "/cliente-agendamento",
  history: "/cliente-historico",
  profile: "/cliente-perfil",
} as const;

export const adminRoutes = {
  panel: "/admin/painel",
  profile: "/admin/perfil",
  services: "/admin/servicos",
  revenue: "/admin/faturamento",
  dashboard: "/admin/dashboard",
  registration: "/admin/registro",
} as const;

export function buildClientMenu(handleLogout: () => void): SidebarMenuItem[] {
  return [
    {
      label: "Agendamentos",
      href: clientRoutes.bookings,
      icon: <CalendarDays className="h-5 w-5" />,
    },
    {
      label: "Minhas reservas",
      href: clientRoutes.history,
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      label: "Perfil",
      href: clientRoutes.profile,
      icon: <UserRound className="h-5 w-5" />,
    },
    {
      label: "Logout",
      icon: <LogOut className="h-5 w-5" />,
      onClick: handleLogout,
    },
  ];
}

export function buildAdminMenu(
  isSuperAdmin: boolean,
  handleLogout: () => void,
): SidebarMenuItem[] {
  if (isSuperAdmin) {
    return [
      {
        label: "Registro",
        href: adminRoutes.registration,
        icon: <BookUser className="h-5 w-5" />,
      },
      {
        label: "Serviços",
        href: adminRoutes.services,
        icon: <Scissors className="h-5 w-5" />,
      },
      {
        label: "Dashboard",
        href: adminRoutes.dashboard,
        icon: <LayoutPanelTop className="h-5 w-5" />,
      },
      {
        label: "Faturamento",
        href: adminRoutes.revenue,
        icon: <CircleDollarSign className="h-5 w-5" />,
      },
      {
        label: "Logout",
        icon: <LogOut className="h-5 w-5" />,
        onClick: handleLogout,
      },
    ];
  }

  return [
    {
      label: "Painel",
      href: adminRoutes.panel,
      icon: <LayoutPanelTop className="h-5 w-5" />,
    },
    {
      label: "Serviços",
      href: adminRoutes.services,
      icon: <Scissors className="h-5 w-5" />,
    },
    {
      label: "Perfil",
      href: adminRoutes.profile,
      icon: <UserRound className="h-5 w-5" />,
    },
    {
      label: "Faturamento do dia",
      href: adminRoutes.revenue,
      icon: <CircleDollarSign className="h-5 w-5" />,
    },
    {
      label: "Logout",
      icon: <LogOut className="h-5 w-5" />,
      onClick: handleLogout,
    },
  ];
}
