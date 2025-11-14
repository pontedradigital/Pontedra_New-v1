import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  Info,
} from 'lucide-react';
import {
  format,
  parseISO,
  isSameDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar'; // Importar o componente Calendar

// Interfaces para as tabelas
interface Appointment {
  id: string;
  client_id: string;
  master_id: string;
  start_time: string; // TIMESTAMP WITH TIME ZONE
  end_time: string;   // TIMESTAMP WITH TIME ZONE
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  created_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    telefone: string | null;
  };
  client_email?: string; // Adicionado para o email do cliente
}

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  telefone: string | null;
  email: string;
}

export default function AppointmentsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [calendarSelectedDay, setCalendarSelectedDay] = useState<Date | undefined>(new Date()); // Estado para o dia selecionado no calendário
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Data de referência para os filtros de semana e mês

  // Placeholder para a função de ver detalhes (será implementada em uma etapa futura, se necessário)
  const handleViewDetails = useCallback((appointment: Appointment) => {
    console.log("Ver detalhes do agendamento:", appointment);
    // Implementar lógica para abrir um pop-up de detalhes aqui
  }, []);

  // Fetch Appointments (filtered by client_id for clients, all for master)
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[], Error>({
    queryKey: ['appointments', user?.id, profile?.role],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('appointments')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            telefone
          )
        `)
        .order('start_time', { ascending: true });

      if (profile?.role === 'client') {
        query = query.eq('client_id', user.id);
      } else if (profile?.role === 'master') {
        // Master sees all appointments, but we might want to filter by master_id if there are multiple masters
        // For now, assuming the logged-in master is THE master.
        query = query.eq('master_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch client emails for master view
      if (profile?.role === 'master' && data) {
        const clientIds = Array.from(new Set(data.map(app => app.client_id)));
        const { data: emailsMap, error: emailError } = await supabase.functions.invoke('get-user-emails', {
          body: { userIds: clientIds },
        });

        if (emailError) {
          console.error("Error fetching client emails:", emailError);
          return data.map(app => ({ ...app, client_email: 'Erro ao carregar e-mail' }));
        }

        return data.map(app => ({
          ...app,
          client_email: (emailsMap as Record<string, string>)?.[app.client_id] || 'N/A',
        }));
      }

      return data as Appointment[];
    },
    enabled: !!user?.id && !authLoading,
  });

  const isMaster = profile?.role === 'master';

  // Filtra agendamentos para "Agendamentos do Dia" (agora usa calendarSelectedDay)
  const todayAppointments = useMemo(() => {
    if (!appointments || !calendarSelectedDay) return [];
    return appointments.filter(app =>
      isSameDay(parseISO(app.start_time), calendarSelectedDay)
    ).sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());
  }, [appointments, calendarSelectedDay]);

  // Filtra agendamentos para "Agendamentos da Semana"
  const weekAppointments = useMemo(() => {
    if (!appointments) return [];
    const start = startOfWeek(selectedDate, { locale: ptBR });
    const end = endOfWeek(selectedDate, { locale: ptBR });
    return appointments.filter(app =>
      isWithinInterval(parseISO(app.start_time), { start, end })
    ).sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());
  }, [appointments, selectedDate]);

  // Filtra agendamentos para "Agendamentos do Mês"
  const monthAppointments = useMemo(() => {
    if (!appointments) return [];
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return appointments.filter(app =>
      isWithinInterval(parseISO(app.start_time), { start, end })
    ).sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());
  }, [appointments, selectedDate]);

  const getStatusBadgeVariant = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'confirmed': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'cancelled': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'completed': return 'bg-blue-500 hover:bg-blue-600 text-white';
      default: return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  if (authLoading || isLoadingAppointments) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-[#9ba8b5]">
          <Loader2 className="w-8 h-8 animate-spin mr-3" /> Carregando agendamentos...
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-destructive">
          Você precisa estar logado para ver seus agendamentos.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <CalendarIcon className="w-10 h-10 text-[#57e389]" /> Agendamentos
          </h1>
        </div>
        <p className="text-lg text-[#9ba8b5]">
          Olá, <span className="font-semibold text-white">{profile?.first_name}</span>!
          {isMaster
            ? ' Visualize e gerencie todos os agendamentos da plataforma.'
            : ' Acompanhe seus compromissos com a Pontedra.'}
        </p>

        {/* Nova Caixa: Calendário */}
        <Card className="bg-card border-border shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" /> Selecione uma Data
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={calendarSelectedDay}
              onSelect={setCalendarSelectedDay}
              initialFocus
              locale={ptBR}
              className="rounded-md border bg-background text-foreground"
            />
          </CardContent>
        </Card>

        {/* Três caixas de resumo - em linhas */}
        <div className="flex flex-col gap-6">
          {/* Primeira Caixa: Agendamentos do Dia */}
          <Card className="bg-card border-border shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-500" /> Agendamentos do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Total: <span className="font-bold text-primary">{todayAppointments.length}</span> agendamentos para {calendarSelectedDay ? format(calendarSelectedDay, 'dd/MM/yyyy', { locale: ptBR }) : 'o dia selecionado'}.
              </p>
              <div className="overflow-x-auto max-h-60 custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="text-muted-foreground">HORÁRIO</TableHead>
                      {isMaster && <TableHead className="text-muted-foreground">CLIENTE</TableHead>}
                      <TableHead className="text-muted-foreground">STATUS</TableHead>
                      <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayAppointments.length > 0 ? (
                      todayAppointments.map((app) => (
                        <TableRow key={app.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10">
                          <TableCell className="font-medium text-foreground py-3">
                            {format(parseISO(app.start_time), 'HH:mm', { locale: ptBR })}
                          </TableCell>
                          {isMaster && (
                            <TableCell className="text-muted-foreground py-3">
                              {app.profiles?.first_name} {app.profiles?.last_name}
                            </TableCell>
                          )}
                          <TableCell className="py-3">
                            <Badge className={getStatusBadgeVariant(app.status)}>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(app)} className="text-blue-500 hover:text-blue-600">
                              <Info className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={isMaster ? 4 : 3} className="text-center text-muted-foreground py-4">
                          Nenhum agendamento.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Segunda Caixa: Agendamentos da Semana */}
          <Card className="bg-card border-border shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" /> Agendamentos da Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Total: <span className="font-bold text-primary">{weekAppointments.length}</span> agendamentos para a semana de {format(startOfWeek(selectedDate, { locale: ptBR }), 'dd/MM', { locale: ptBR })}.
              </p>
              <div className="overflow-x-auto max-h-60 custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="text-muted-foreground">DATA</TableHead>
                      {isMaster && <TableHead className="text-muted-foreground">CLIENTE</TableHead>}
                      <TableHead className="text-muted-foreground">STATUS</TableHead>
                      <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weekAppointments.length > 0 ? (
                      weekAppointments.map((app) => (
                        <TableRow key={app.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10">
                          <TableCell className="font-medium text-foreground py-3">
                            {format(parseISO(app.start_time), 'dd/MM HH:mm', { locale: ptBR })}
                          </TableCell>
                          {isMaster && (
                            <TableCell className="text-muted-foreground py-3">
                              {app.profiles?.first_name} {app.profiles?.last_name}
                            </TableCell>
                          )}
                          <TableCell className="py-3">
                            <Badge className={getStatusBadgeVariant(app.status)}>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(app)} className="text-blue-500 hover:text-blue-600">
                              <Info className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={isMaster ? 4 : 3} className="text-center text-muted-foreground py-4">
                          Nenhum agendamento.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Terceira Caixa: Agendamentos do Mês */}
          <Card className="bg-card border-border shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-green-500" /> Agendamentos do Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Total: <span className="font-bold text-primary">{monthAppointments.length}</span> agendamentos para {format(selectedDate, 'MMMM/yyyy', { locale: ptBR })}.
              </p>
              <div className="overflow-x-auto max-h-60 custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="text-muted-foreground">DATA</TableHead>
                      {isMaster && <TableHead className="text-muted-foreground">CLIENTE</TableHead>}
                      <TableHead className="text-muted-foreground">STATUS</TableHead>
                      <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthAppointments.length > 0 ? (
                      monthAppointments.map((app) => (
                        <TableRow key={app.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10">
                          <TableCell className="font-medium text-foreground py-3">
                            {format(parseISO(app.start_time), 'dd/MM HH:mm', { locale: ptBR })}
                          </TableCell>
                          {isMaster && (
                            <TableCell className="text-muted-foreground py-3">
                              {app.profiles?.first_name} {app.profiles?.last_name}
                            </TableCell>
                          )}
                          <TableCell className="py-3">
                            <Badge className={getStatusBadgeVariant(app.status)}>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(app)} className="text-blue-500 hover:text-blue-600">
                              <Info className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={isMaster ? 4 : 3} className="text-center text-muted-foreground py-4">
                          Nenhum agendamento.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}