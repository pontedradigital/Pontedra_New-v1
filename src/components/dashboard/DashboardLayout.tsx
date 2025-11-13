import React, { ReactNode } from "react";
import DashboardSidebar from "./DashboardSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 px-8 py-8 lg:ml-64 lg:px-4 lg:py-6 pt-20 lg:pt-6"> {/* Ajustado o padding: lg:px-4 */}
        {children}
      </main>
    </div>
  );
}