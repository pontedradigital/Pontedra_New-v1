import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Settings, Users, Briefcase, CalendarDays, Bot, MessageSquare, LayoutDashboard, User, BarChart, Newspaper, MessageCircle, Camera, DollarSign, Headset, Star, Wallet, BellRing, History } from "lucide-react"; // Adicionado History
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMockData } from "@/context/MockContext"; // Importar useMockData

interface SidebarProps {
  userRole: "master" | "client" | undefined;
}

export const Sidebar = ({ userRole }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadNotificationCount } = useMockData(); // Obter o contador de notificações não lidas

  const masterNavItems = [
    { name: "Dashboard", href: "/dashboard/master", icon: LayoutDashboard },
    { name: "Clientes", href: "/dashboard/master/users", icon: Users },
    { name: "Serviços", href: "/dashboard/master/services", icon: Briefcase },
    { name: "Agendamentos", href: "/dashboard/master/appointments", icon: CalendarDays },
    {
      name: "Canais de Comunicação",
      icon: MessageSquare,
      subItems: [
        { name: "WhatsApp Business", href: "/dashboard/master/comunicacao/whatsapp", icon: MessageCircle },
        { name: "Instagram Direct", href: "/dashboard/master/comunicacao/instagram", icon: Camera },
        { name: "Facebook Messenger", href: "/dashboard/master/comunicacao/messenger", icon: MessageSquare },
      ],
    },
    { name: "IA Insights", href: "/dashboard/master/ai-insights", icon: Bot },
    { name: "Relatórios e Sugestões", href: "/dashboard/master/analises", icon: BarChart },
    { name: "Financeiro", href: "/dashboard/master/financeiro", icon: DollarSign },
    { name: "Blog", href: "/dashboard/master/blog", icon: Newspaper },
    { name: "Configurações", href: "/dashboard/master/settings", icon: Settings },
  ];

  const clientNavItems = [
    { name: "Início", href: "/dashboard/cliente", icon: LayoutDashboard },
    { name: "Minha Experiência", href: "/dashboard/cliente/minha-experiencia", icon: Star },
    { name: "Agendamentos", href: "/dashboard/cliente/agenda", icon: CalendarDays },
    { name: "Histórico de Agendamentos", href: "/dashboard/cliente/historico-agendamentos", icon: History },
    { name: "Atendimento Inteligente (Assistente Pontedra)", href: "/dashboard/cliente/atendimento-inteligente", icon: Headset },
    { name: "Carteira Digital", href: "/dashboard/cliente/carteira-digital", icon: Wallet },
    { name: "Notificações e Suporte", href: "/dashboard/cliente/notificacoes-suporte", icon: BellRing, badge: unreadNotificationCount },
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
            item.subItems ? (
              <div key={item.name} className="mb-2">
                <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground cursor-default">
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </span>
                <div className="ml-6 border-l border-sidebar-border pl-3">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.name}
                      to={subItem.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-sidebar-accent",
                        location.pathname.startsWith(subItem.href) && "bg-sidebar-accent text-primary"
                      )}
                    >
                      <subItem.icon className="h-4 w-4" />
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
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
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          ))}
        </nav>
      </div>
    </div>
  );
};