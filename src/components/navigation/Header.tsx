import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon, UserIcon, BellIcon } from "lucide-react"; // Adicionado BellIcon
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Sidebar } from "./Sidebar";

interface HeaderProps {
  isMobile: boolean;
}

export const Header = ({ isMobile }: HeaderProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 shadow-lg">
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden bg-background text-foreground border-border hover:bg-muted">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs bg-card border-border">
            <Sidebar userRole={user?.role} />
          </SheetContent>
        </Sheet>
      )}
      <div className="relative ml-auto flex-1 md:grow-0">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">
          Bem-vindo, {user?.email?.split('@')[0]}
        </h1>
      </div>
      <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
        <BellIcon className="h-5 w-5" />
        <span className="sr-only">Notificações</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full bg-background text-primary-foreground border border-border hover:bg-muted">
            <UserIcon className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
          <DropdownMenuLabel className="text-primary">Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem className="hover:bg-muted cursor-pointer">Configurações</DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-muted cursor-pointer">Suporte</DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem onClick={logout} className="text-destructive hover:bg-destructive/20 cursor-pointer">Sair</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};