import React from "react";
import ClientDashboardLayout from "@/components/layouts/ClientDashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays, Briefcase, MessageSquare, Bot } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MOCK_CLIENT_APPOINTMENTS, MOCK_CLIENT_SERVICES } from "@/data/mockData";
import { Link } from "react-router-dom";

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
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard Cliente</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Agendamento</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <>
                <div className="text-2xl font-bold">{upcomingAppointments[0].date} - {upcomingAppointments[0].time}</div>
                <p className="text-xs text-muted-foreground">{upcomingAppointments[0].serviceName}</p>
                <Link to="/dashboard/cliente/agenda" className="text-blue-500 hover:underline text-xs mt-2 block">Ver todos</Link>
              </>
            ) : (
              <div className="text-md font-medium">Nenhum agendamento futuro.</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços Disponíveis</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableServicesCount}</div>
            <p className="text-xs text-muted-foreground">Explore e agende novos serviços</p>
            <Link to="/dashboard/cliente/agenda" className="text-blue-500 hover:underline text-xs mt-2 block">Ver serviços</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat com IA Pontedra</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Olá, {user?.email?.split('@')[0]}!</div>
            <p className="text-xs text-muted-foreground">Converse com nossa assistente virtual.</p>
            <Link to="/dashboard/cliente/chat" className="text-blue-500 hover:underline text-xs mt-2 block">Iniciar Chat</Link>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Bem-vindo, {user?.email?.split('@')[0]}!
          </h3>
          <p className="text-sm text-muted-foreground">
            Aqui você pode gerenciar seus serviços e conversar com a assistente Pontedra.
          </p>
        </div>
      </div>
    </ClientDashboardLayout>
  );
};

export default ClientDashboardPage;