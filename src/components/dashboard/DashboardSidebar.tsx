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
  Package,
  DollarSign,
  FileText,
  CreditCard,
  Bot,
  HardHat,
  MessageCircle, // Para WhatsApp Business
  Instagram,     // Para Instagram Direct
  Facebook,      // Para Facebook Messenger
  ChevronDown,   // Para indicar sub-menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"; // Importar Collapsible
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  label: string;
  icon?: React.ElementType; // Ícone é opcional para sub-itens
  href?: string; // href é opcional para itens pai com sub-menus
  roles: ('prospect' | 'client' | 'master')[];
  children?: NavItem[]; // Para sub-menus
}

const navItems: NavItem[] = [
  { label: "Início", icon: HomeIcon, href: "/dashboard/home", roles: ['prospect', 'client', 'master'] },
  { label: "Configurações", icon: SettingsIcon, href: "/dashboard/settings", roles: ['prospect', 'client', 'master'] },
  { label: "Gerenciar Usuários", icon: Users, href: "/dashboard/manage-users", roles: ['master'] }, // Mantido 'Gerenciar Usuários' para abranger 'Clientes'
  { label: "Meus Agendamentos", icon: Calendar, href: "/dashboard/appointments", roles: ['client', 'master'] },
  { label: "Meus Projetos", icon: Briefcase, href: "/dashboard/projects", roles: ['client', 'master'] },
  { label: "Relatórios", icon: BarChart, href: "/dashboard/reports", roles: ['master'] },
  { label: "Serviços", icon: HardHat, href: "/dashboard/services", roles: ['master'] },
  { label: "Pacotes", icon: Package, href: "/dashboard/packages", roles: ['master'] },
  { label: "Orçamentos", icon: FileText, href: "/dashboard/budgets", roles: ['master'] },
  { label: "Custos", icon: CreditCard, href: "/dashboard/costs", roles: ['master'] },
  { label: "Financeiro", icon: DollarSign, href: "/dashboard/financial", roles: ['master'] },
  { label: "IA Atendimento (Vedra)", icon: Bot, href: "/dashboard/vedra-ai", roles: ['master'] },
  {
    label: "Redes Sociais",
    icon: MessageCircle, // Ícone para o item pai
    roles: ['master'], // Apenas master pode gerenciar redes sociais
    children: [
      { label: "WhatsApp Business", icon: MessageCircle, href: "#", roles: ['master'] }, // href temporário
      { label: "Instagram Direct", icon: Instagram, href: "#", roles: ['master'] }, // href temporário
      { label: "Facebook Messenger", icon: Facebook, href: "#", roles: ['master'] }, // href temporário
    ],
  },
  { label: "Blog", icon: BookOpen, href: "/blog", roles: ['master'] }, // Link para o blog público, acessível do dashboard
];

export default function DashboardSidebar() {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>({});

  const toggleCollapsible = (label: string) => {
    setOpenCollapsibles(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const filteredNavItems = navItems.filter(item =>
    profile && item.roles.includes(profile.role)
  );

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  const getDashboardHomeLink = () => {
    if (!profile) return "/login";
    if (profile.role === "master") return "/dashboard/master";
    if (profile.role === "client") return "/dashboard/client";
    return "/dashboard/prospect";
  };

  const renderNavLinks = (items: NavItem[], onLinkClick?: () => void, isSubMenu = false) => (
    <ul className={isSubMenu ? "ml-4 space-y-1" : "space-y-2"}>
      {items.map((item) => {
        const itemHref = item.label === "Início" ? getDashboardHomeLink() : item.href;
        const isActive = itemHref ? location.pathname.startsWith(itemHref) : false;
        const Icon = item.icon;

        if (item.children && item.children.length > 0) {
          return (
            <li key={item.label}>
              <Collapsible
                open={openCollapsibles[item.label]}
                onOpenChange={() => toggleCollapsible(item.label)}
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="w-5 h-5" />}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openCollapsibles[item.label] ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  {renderNavLinks(item.children, onLinkClick, true)}
                </CollapsibleContent>
              </Collapsible>
            </li>
          );
        }

        return (
          <li key={item.label}>
            <Link
              to={itemHref || "#"} // Fallback para '#' se href não estiver definido
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              {Icon && <Icon className="w-5 h-5" />}
              <span className="font-medium">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
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
              <h3 className="text-lg font-semibold text-sidebar-foreground">{profile.first_name} {profile.last_name}</h3>
              <p className="text-sm text-sidebar-muted-foreground capitalize">{profile.role}</p>
            </div>
          )}
          <div className="flex-grow overflow-y-auto custom-scrollbar">
            {renderNavLinks(filteredNavItems, () => setIsMobileMenuOpen(false))}
          </div>
          <Button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 bg-destructive hover:bg-destructive/90 text-destructive-foreground mt-4"
          >
            <LogOutIcon className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </Button>
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
            <h3 className="text-xl font-semibold text-sidebar-foreground">{profile.first_name} {profile.last_name}</h3>
            <p className="text-sm text-sidebar-muted-foreground capitalize">{profile.role}</p>
          </div>
        )}
        {renderNavLinks(filteredNavItems)}
        <Button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 bg-destructive hover:bg-destructive/90 text-destructive-foreground mt-4"
        >
          <LogOutIcon className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </Button>
      </motion.aside>
    </>
  );
}