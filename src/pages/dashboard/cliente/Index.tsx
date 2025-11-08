import React from "react";
import ClientDashboardLayout from "@/components/layouts/ClientDashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays, Briefcase, MessageSquare, Bot } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MOCK_CLIENT_APPOINTMENTS, MOCK_CLIENT_SERVICES } from "@/data/mockData";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const ClientDashboardPage = () => {
  const { user } = useAuth();

  const upcomingAppointments = MOCK_CLIENT_APPOINTMENTS.filter(
    (app) => app.clientEmail === user?.email && (app.status === "pending" || app.status === "confirmed")
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const availableServicesCount = MOCK_CLIENT_SERVICES.filter(
    (service) => service.availability === "available"
  ).length;

  return (
    <ClientDashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Dashboard Cliente</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Próximo Agendamento</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <>
                  <div className="text-2xl font-bold text-foreground">{upcomingAppointments[0].date} - {upcomingAppointments[0].time}</div>
                  <p className="text-xs text-muted-foreground">{upcomingAppointments[0].serviceName}</p>
                  <Link to="/dashboard/cliente/agenda" className="text-primary hover:underline text-xs mt-2 block">Ver todos</Link>
                </>
              ) : (
                <div className="text-md font-medium text-muted-foreground">Nenhum agendamento futuro.</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Serviços Disponíveis</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{availableServicesCount}</div>
              <p className="text-xs text-muted-foreground">Explore e agende novos serviços</p>
              <Link to="/dashboard/cliente/agenda" className="text-primary hover:underline text-xs mt-2 block">Ver serviços</Link>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Chat com Assistente Pontedra</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">Olá, {user?.email?.split('@')[0]}!</div>
              <p className="text-xs text-muted-foreground">Converse com nossa assistente virtual.</p>
              <Link to="/dashboard/cliente/atendimento-inteligente" className="text-primary hover:underline text-xs mt-2 block">Iniciar Chat</Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border shadow-sm bg-card mt-6"
      >
        <div className="flex flex-col items-center gap-1 text-center p-4">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            Bem-vindo, {user?.email?.split('@')[0]}!
          </h3>
          <p className="text-sm text-muted-foreground">
            Aqui você pode gerenciar seus serviços e conversar com a assistente Pontedra.
          </p>
        </div>
      </motion.div>
    </ClientDashboardLayout>
  );
};

export default ClientDashboardPage;