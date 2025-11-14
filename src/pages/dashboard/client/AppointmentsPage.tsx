import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  Info,
  PlusCircle,
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
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
  setHours,
  setMinutes,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DateSelectionList from '@/components/dashboard/common/DateSelectionList'; // NOVO: Importar DateSelectionList
import TimeSlotSelectionDialog from '@/components/dashboard/client/TimeSlotSelectionDialog'; // NOVO: Importar TimeSlotSelectionDialog
import { toast } from 'sonner';

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

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()); // Data de referência para todos os filtros e para o DateSelectionList
  const [isTimeSlotDialogOpen, setIsTimeSlotDialogOpen] = useState(false); // Estado para o diálogo de seleção de horário
  const [masterIdForBooking, setMasterIdForBooking] = useState<string | null>(null); // ID do master para quem o agendamento será feito

  // Placeholder para a função de ver detalhes (será implementada em uma etapa futura, se necessário)
  const handleViewDetails = useCallback((appointment: Appointment) => {
    console.log("Ver detalhes do agendamento:", appointment);
    // Implementar lógica para abrir um pop-up de detalhes aqui
  }, []);

  // Fetch the master's ID (assuming there's only one master for now, or picking the first one)
  const { data: masterProfile, isLoading: isLoadingMasterProfile } = useQuery<UserProfile | null, Error>({
    queryKey: ['masterProfile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, telefone')
        .eq('role', 'master')
        .single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found
      return data;
    },
    staleTime: Infinity, // Master profile doesn't change often
  });

  useEffect(() => {
    if (masterProfile) {
      setMasterIdForBooking(masterProfile.id);
    }
  }, [masterProfile]);

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

  // Mutation to create a new appointment
  const createAppointmentMutation = useMutation<void, Error, { startTime: Date; endTime: Date }>({
    mutationFn: async ({ startTime, endTime }) => {
      if (!user?.id || !masterIdForBooking) throw new Error("Usuário ou Master não identificados.");

      const { error } = await supabase.from('appointments').insert({
        client_id: user.id,
        master_id: masterIdForBooking,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'pending', // New appointments start as pending
        notes: `Agendamento com ${profile?.first_name || 'Cliente'}`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] }); // Invalidate appointments list
      toast.success('Agendamento criado com sucesso! Aguardando confirmação.');
      setIsTimeSlotDialogOpen(false);
      setSelectedDate(undefined); // Clear selected date after booking
    },
    onError: (err) => {
      toast.error(`Erro ao criar agendamento: ${err.message}`);
    },
  });

  const isMaster = profile?.role === 'master';

  // Filtra agendamentos para "Agendamentos do Dia"
  const todayAppointments = useMemo(() => {
    if (!appointments || !selectedDate) return [];
    return appointments.filter(app =>
      isSameDay(parseISO(app.start_time), selectedDate)
    ).sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());
  }, [appointments, selectedDate]);

  // Filtra agendamentos para "Agendamentos da Semana"
  const weekAppointments = useMemo(() => {
    if (!appointments || !selectedDate) return [];
    const start = startOfWeek(selectedDate, { locale: ptBR });
    const end = endOfWeek(selectedDate, { locale: ptBR });
    return appointments.filter(app =>
      isWithinInterval(parseISO(app.start_time), { start, end })
    ).sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());
  }, [appointments, selectedDate]);

  // Filtra agendamentos para "Agendamentos do Mês"
  const monthAppointments = useMemo(() => {
    if (!appointments || !selectedDate) return [];
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

  const handleDateSelectedFromList = (date: Date) => {
    setSelectedDate(date);
    setIsTimeSlotDialogOpen(true); // Open time slot dialog when a date is selected
  };

  const handleAppointmentConfirm = (startTime: Date, endTime: Date) => {
    createAppointmentMutation.mutate({ startTime, endTime });
  };

  if (authLoading || isLoadingAppointments || isLoadingMasterProfile) {
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

  if (!masterIdForBooking && !isMaster) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-destructive">
          Nenhum master encontrado para agendamentos. Por favor, contate o suporte.
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

        {/* NOVO: Componente de seleção de data em lista */}
        {!isMaster && masterIdForBooking && ( // Apenas clientes podem agendar
          <DateSelectionList
            masterId={masterIdForBooking}
            onDateSelect={handleDateSelectedFromList}
            selectedDate={selectedDate}
          />
        )}

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
                Total: <span className="font-bold text-primary">{todayAppointments.length}</span> agendamentos para {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'o dia selecionado'}.
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
                Total: <span className="font-bold text-primary">{weekAppointments.length}</span> agendamentos para a semana de {selectedDate ? format(startOfWeek(selectedDate, { locale: ptBR }), 'dd/MM', { locale: ptBR }) : 'o dia selecionado'}.
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
                Total: <span className="font-bold text-primary">{monthAppointments.length}</span> agendamentos para {selectedDate ? format(selectedDate, 'MMMM/yyyy', { locale: ptBR }) : 'o dia selecionado'}.
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

      {/* NOVO: Diálogo de Seleção de Horário */}
      {!isMaster && masterIdForBooking && (
        <TimeSlotSelectionDialog
          isOpen={isTimeSlotDialogOpen}
          onClose={() => setIsTimeSlotDialogOpen(false)}
          selectedDate={selectedDate}
          masterId={masterIdForBooking}
          onAppointmentConfirm={handleAppointmentConfirm}
        />
      )}
    </DashboardLayout>
  );
}