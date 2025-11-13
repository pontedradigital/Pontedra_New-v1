import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home as HomeIcon,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
  Menu as MenuIcon,
  X as XIcon,
  Briefcase,
  Calendar,
  BookOpen,
  Users,
  ClipboardList,
  BarChart,
  Package, // Novo ícone para Pacotes
  DollarSign, // Novo ícone para Financeiro
  FileText, // Novo ícone para Orçamentos
  CreditCard, // Novo ícone para Custos
  Bot, // Novo ícone para IA Atendimento
  HardHat, // Novo ícone para Serviços (representando trabalho/construção)
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  roles: ('prospect' | 'client' | 'master')[];
}

const navItems: NavItem[] = [
  { label: "Início", icon: HomeIcon, href: "/dashboard/home", roles: ['prospect', 'client', 'master'] },
  { label: "Meu Perfil", icon: UserIcon, href: "/dashboard/profile", roles: ['prospect', 'client', 'master'] },
  { label: "Meus Projetos", icon: Briefcase, href: "/dashboard/projects", roles: ['client', 'master'] },
  { label: "Meus Agendamentos", icon: Calendar, href: "/dashboard/appointments", roles: ['client', 'master'] },
  { label: "Recursos", icon: BookOpen, href: "/dashboard/resources", roles: ['prospect', 'client', 'master'] },
  // Novas páginas para o Master
  { label: "Serviços", icon: HardHat, href: "/dashboard/services", roles: ['master'] },
  { label: "Pacotes", icon: Package, href: "/dashboard/packages", roles: ['master'] },
  { label: "Orçamentos", icon: FileText, href: "/dashboard/budgets", roles: ['master'] },
  { label: "Custos", icon: CreditCard, href: "/dashboard/costs", roles: ['master'] },
  { label: "Financeiro", icon: DollarSign, href: "/dashboard/financial", roles: ['master'] },
  { label: "IA Atendimento (Vedra)", icon: Bot, href: "/dashboard/vedra-ai", roles: ['master'] },
  { label: "Gerenciar Usuários", icon: Users, href: "/dashboard/manage-users", roles: ['master'] },
  { label: "Relatórios", icon: BarChart, href: "/dashboard/reports", roles: ['master'] },
  { label: "Configurações", icon: SettingsIcon, href: "/dashboard/settings", roles: ['master'] },
];

export default function DashboardSidebar() {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredNavItems = navItems.filter(item => 
    profile && item.roles.includes(profile.role)
  );

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  const getDashboardHomeLink = () => {
    if (!profile) return "/login"; // Fallback
    if (profile.role === "master") return "/dashboard/master";
    if (profile.role === "client") return "/dashboard/client";
    return "/dashboard/prospect";
  };

  const renderNavLinks = (onLinkClick?: () => void) => (
    <nav className="space-y-2">
      {filteredNavItems.map((item) => {
        // Ajusta o link 'Início' para a rota específica do papel
        const itemHref = item.label === "Início" ? getDashboardHomeLink() : item.href;
        const isActive = location.pathname.startsWith(itemHref);
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            to={itemHref}
            onClick={onLinkClick}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
      <Button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 bg-destructive hover:bg-destructive/90 text-destructive-foreground mt-4"
      >
        <LogOutIcon className="w-5 h-5" />
        <span className="font-medium">Sair</span>
      </Button>
    </nav>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild className="lg:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon" className="bg-sidebar-background border-sidebar-border text-sidebar-foreground">
            <MenuIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-sidebar-background border-r border-sidebar-border p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <img src="/pontedra-logo.webp" alt="Pontedra Logo" className="h-12 w-auto" />
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
              <XIcon className="h-6 w-6 text-sidebar-foreground" />
            </Button>
          </div>
          {profile && (
            <div className="mb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-sidebar-accent flex items-center justify-center mx-auto mb-3">
                <UserIcon className="w-8 h-8 text-sidebar-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-sidebar-foreground">{profile.nome} {profile.sobrenome}</h3>
              <p className="text-sm text-sidebar-muted-foreground capitalize">{profile.role}</p>
            </div>
          )}
          {/* Adicionado flex-grow e overflow-y-auto para o scroll no mobile */}
          <div className="flex-grow overflow-y-auto custom-scrollbar">
            {renderNavLinks(() => setIsMobileMenuOpen(false))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -200 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="hidden lg:flex flex-col w-64 bg-sidebar-background border-r border-sidebar-border h-screen p-6 sticky top-0 left-0 overflow-y-auto custom-scrollbar"
      >
        <div className="mb-10 text-center">
          <img src="/pontedra-logo.webp" alt="Pontedra Logo" className="h-16 w-auto mx-auto" />
        </div>
        {profile && (
          <div className="mb-10 text-center">
            <div className="w-20 h-20 rounded-full bg-sidebar-accent flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-10 h-10 text-sidebar-accent-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-sidebar-foreground">{profile.nome} {profile.sobrenome}</h3>
            <p className="text-sm text-sidebar-muted-foreground capitalize">{profile.role}</p>
          </div>
        )}
        {renderNavLinks()}
      </motion.aside>
    </>
  );
}