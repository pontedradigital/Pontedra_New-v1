import React, { ReactNode } from "react";
import { Header } from "@/components/navigation/Header";
import { Sidebar } from "@/components/navigation/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface MasterDashboardLayoutProps {
  children: ReactNode;
}

const MasterDashboardLayout = ({ children }: MasterDashboardLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {!isMobile && (
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <span className="flex items-center gap-2 font-semibold">
                <Bot className="h-6 w-6" />
                <span className="text-lg">Dyad SaaS Master</span>
              </span>
            </div>
            <div className="flex-1">
              <Sidebar userRole="master" />
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col">
        <Header isMobile={isMobile} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MasterDashboardLayout;