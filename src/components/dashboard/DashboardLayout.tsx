import React, { ReactNode } from "react";
import DashboardSidebar from "./DashboardSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 p-8 lg:ml-64 pt-20 lg:pt-8"> {/* Adicionado pt-20 para compensar o botão do menu mobile */}
        {children}
      </main>
    </div>
  );
}