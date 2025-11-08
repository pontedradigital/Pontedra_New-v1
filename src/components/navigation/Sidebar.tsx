import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Settings, Users, Briefcase, CalendarDays, Bot, MessageSquare, LayoutDashboard, User, BarChart, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  userRole: "master" | "client" | undefined;
}

export const Sidebar = ({ userRole }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();

  const masterNavItems = [
    { name: "Dashboard", href: "/dashboard/master", icon: LayoutDashboard },
    { name: "Clientes", href: "/dashboard/master/users", icon: Users },
    { name: "Serviços", href: "/dashboard/master/services", icon: Briefcase },
    { name: "Agendamentos", href: "/dashboard/master/appointments", icon: CalendarDays },
    { name: "Canais de Atendimento", href: "/dashboard/master/canais-atendimento", icon: MessageSquare },
    { name: "IA Insights", href: "/dashboard/master/ai-insights", icon: Bot },
    { name: "Relatórios e Sugestões", href: "/dashboard/master/analises", icon: BarChart },
    { name: "Blog", href: "/dashboard/master/blog", icon: Newspaper },
    { name: "Configurações", href: "/dashboard/master/settings", icon: Settings },
  ];

  const clientNavItems = [
    { name: "Início", href: "/dashboard/cliente", icon: LayoutDashboard },
    { name: "Agendamentos", href: "/dashboard/cliente/agenda", icon: CalendarDays },
    { name: "Chat IA", href: "/dashboard/cliente/chat", icon: Bot },
    { name: "Perfil", href: "/dashboard/cliente/perfil", icon: User },
    { name: "Configurações", href: "/dashboard/cliente/settings", icon: Settings },
  ];

  const navItems = userRole === "master" ? masterNavItems : clientNavItems;

  return (
    <div className="flex h-full max-h-screen flex-col gap-2 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
          <img src="/pontedra-logo.webp" alt="Pontedra Logo" className="h-6 w-auto" />
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-4">
              <Avatar className="h-9 w-9 border border-primary">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback className="bg-primary text-primary-foreground">{user.email.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">{user.email.split('@')[0]}</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
              </div>
            </div>
          )}
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-sidebar-accent",
                location.pathname.startsWith(item.href) && "bg-sidebar-accent text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};