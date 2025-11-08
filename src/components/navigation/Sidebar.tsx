import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Settings, Users, Briefcase, CalendarDays, Bot, MessageSquare, LayoutDashboard, User } from "lucide-react"; // Importar User
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole: "master" | "client" | undefined;
}

export const Sidebar = ({ userRole }: SidebarProps) => {
  const location = useLocation();

  const masterNavItems = [
    { name: "Dashboard", href: "/dashboard/master", icon: LayoutDashboard },
    { name: "Clientes", href: "/dashboard/master/users", icon: Users },
    { name: "Serviços", href: "/dashboard/master/services", icon: Briefcase },
    { name: "Agendamentos", href: "/dashboard/master/appointments", icon: CalendarDays },
    { name: "Comunicação", href: "/dashboard/master/communication", icon: MessageSquare },
    { name: "IA Insights", href: "/dashboard/master/ai-insights", icon: Bot },
    { name: "Configurações", href: "/dashboard/master/settings", icon: Settings },
  ];

  const clientNavItems = [
    { name: "Início", href: "/dashboard/cliente", icon: LayoutDashboard },
    { name: "Agendamentos", href: "/dashboard/cliente/agenda", icon: CalendarDays },
    { name: "Chat IA", href: "/dashboard/cliente/chat", icon: Bot },
    { name: "Perfil", href: "/dashboard/cliente/perfil", icon: User },
    { name: "Configurações", href: "/dashboard/cliente/settings", icon: Settings }, // Mantendo configurações para o cliente
  ];

  const navItems = userRole === "master" ? masterNavItems : clientNavItems;

  return (
    <nav className="flex flex-col gap-2 px-2 py-4 text-lg font-medium lg:px-4">
      <Link
        to="/"
        className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
      >
        <Bot className="h-4 w-4 transition-all group-hover:scale-110" />
        <span className="sr-only">Dyad SaaS</span>
      </Link>
      {navItems.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            location.pathname.startsWith(item.href) && "bg-muted text-primary"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.name}
        </Link>
      ))}
    </nav>
  );
};