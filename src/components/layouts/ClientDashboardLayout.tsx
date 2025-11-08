import React, { ReactNode } from "react";
import { Header } from "@/components/navigation/Header";
import { Sidebar } from "@/components/navigation/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface ClientDashboardLayoutProps {
  children: ReactNode;
}

const ClientDashboardLayout = ({ children }: ClientDashboardLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-background text-foreground">
      {!isMobile && (
        <div className="hidden md:block">
          <Sidebar userRole="client" />
        </div>
      )}
      <div className="flex flex-col">
        <Header isMobile={isMobile} />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default ClientDashboardLayout;