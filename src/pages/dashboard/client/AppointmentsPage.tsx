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
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
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
  setHours,
  setMinutes,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DateSelectionList from '@/components/dashboard/common/DateSelectionList';
import TimeSlotSelectionDialog from '@/components/dashboard/client/TimeSlotSelectionDialog';
import AddAppointmentDialog from '@/components/dashboard/master/AddAppointmentDialog';
import AppointmentDetailsPopup from '@/components/dashboard/common/AppointmentDetailsPopup'; // Importar o novo componente
import { toast } from 'sonner';
// import { Calendar } from '@/components/ui/calendar'; // Removido o componente Calendar

// Interfaces para as tabelas
interface Appointment {
  id: string;
  client_id: string;
  master_id: string;
  start_time: string; // TIMESTAMP WITH TIME ZONE
  end_time:   string;   // TIMESTAMP WITH TIME ZONE
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'; // Manter o tipo para compatibilidade com DB
  notes: string | null;
  created_at: string;
  client_name: string | null; // NOVO: Adicionado client_name
  client_email: string | null; // NOVO: Adicionado client_email
  master_email?: string; // Adicionado para o email do master
  master_name?: string; // Adicionado para o nome do master
  client_phone?: string; // Adicionado para o telefone do cliente
}

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  telefone: string | null;
  email: string;
  role: 'prospect' | 'client' | 'master';
}

export default function AppointmentsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isTimeSlotDialogOpen, setIsTimeSlotDialogOpen] = useState(false);
  const [masterIdForBooking, setMasterIdForBooking] = useState<string | null>(null);

  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [isDetailsPopupOpen, setIsDetailsPopupOpen] = useState(false); // Estado para o pop-up de detalhes
  const [selectedAppointmentForDetails, setSelectedAppointmentForDetails] = useState<Appointment | null>(null); // Agendamento para exibir no pop-up

  const isMaster = profile?.role === 'master';

  // Fetch the master's ID (assuming there's only one master for now, or picking the first one)
  // This query is now only for clients to find THE master to book with.
  const { data: singleMasterProfile, isLoading: isLoadingSingleMasterProfile } = useQuery<UserProfile | null, Error>({
    queryKey: ['singleMasterProfile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, telefone, role')
        .eq('role', 'master')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    staleTime: Infinity,
    enabled: !isMaster, // Only run this query if the logged-in user is NOT a master
  });

  useEffect(() => {
    if (isMaster && user?.id) {
      setMasterIdForBooking(user.id); // Master books for themselves or manages others for their own calendar
    } else if (!isMaster && singleMasterProfile) {
      setMasterIdForBooking(singleMasterProfile.id); // Client books with the single master
    }
  }, [isMaster, user?.id, singleMasterProfile]);

  // Fetch all client profiles (for master to see client names/phones)
  const { data: allClientProfiles, isLoading: isLoadingAllClientProfiles } = useQuery<UserProfile[], Error>({
    queryKey: ['allClientProfilesForAppointments'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, telefone, role');
      if (profilesError) throw profilesError;

      const userIds = profiles.map(p => p.id);
      const { data: emailsMap, error: emailError } = await supabase.functions.invoke('get-user-emails', {
        body: { userIds },
      });
      if (emailError) throw emailError;

      return profiles.map(p => ({
        ...p,
        email: (emailsMap as Record<string, string>)?.[p.id] || 'N/A',
      }));
    },
    enabled: isMaster, // Only fetch if master is logged in
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all master profiles (for client to see master names/phones)
  const { data: allMasterProfiles, isLoading: isLoadingAllMasterProfiles } = useQuery<UserProfile[], Error>({
    queryKey: ['allMasterProfilesForAppointments'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, telefone, role')
        .eq('role', 'master');
      if (profilesError) throw profilesError;

      const userIds = profiles.map(p => p.id);
      const { data: emailsMap, error: emailError } = await supabase.functions.invoke('get-user-emails', {
        body: { userIds },
      });
      if (emailError) throw emailError;

      return profiles.map(p => ({
        ...p,
        email: (emailsMap as Record<string, string>)?.[p.id] || 'N/A',
      }));
    },
    enabled: !isMaster, // Only fetch if client is logged in
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Appointments (filtered by client_id for clients, all for master)
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[], Error>({
    queryKey: ['appointments', user?.id, profile?.role],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('appointments')
        .select(`
          id,
          client_id,
          master_id,
          start_time,
          end_time,
          status,
          notes,
          created_at,
          client_name,
          client_email
        `)
        .order('start_time', { ascending: true });

      if (profile?.role === 'client') {
        query = query.eq('client_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enrich appointments with master/client names and phones
      if (data) {
        return data.map(app => {
          const masterProfile = allMasterProfiles?.find(p => p.id === app.master_id);
          const clientProfile = allClientProfiles?.find(p => p.id === app.client_id);

          return {
            ...app,
            master_name: masterProfile ? `${masterProfile.first_name || ''} ${masterProfile.last_name || ''}`.trim() : 'N/A',
            master_email: masterProfile?.email || 'N/A',
            client_name: app.client_name || (clientProfile ? `${clientProfile.first_name || ''} ${clientProfile.last_name || ''}`.trim() : 'N/A'),
            client_email: app.client_email || clientProfile?.email || 'N/A',
            client_phone: clientProfile?.telefone || 'N/A',
          };
        });
      }

      return data as Appointment[];
    },
    enabled: !!user?.id && !authLoading && (isMaster ? !isLoadingAllClientProfiles : !isLoadingAllMasterProfiles),
  });

  // Mutation to create a new appointment (used by both client and master dialog)
  const upsertAppointmentMutation = useMutation<void, Error, {
    id?: string; // Optional for update
    master_id: string;
    start_time: Date;
    end_time: Date;
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'; // Status é opcional aqui, será 'confirmed'
    notes: string;
    client_id: string; // ID do cliente (existente ou recém-criado)
    client_name: string; // Nome do cliente
    client_email: string; // E-mail do cliente
    newClientDetails?: { // Detalhes do novo cliente
      name: string;
      email: string;
      phone?: string;
    };
  }>({
    mutationFn: async (appointmentData) => {
      let clientIdToUse = appointmentData.client_id;

      // If new client details are provided, create a new user first
      if (appointmentData.newClientDetails) {
        const { name, email, phone } = appointmentData.newClientDetails;
        const tempPassword = Math.random().toString(36).slice(-12); // Generate a temporary password

        const userMetadata = {
          first_name: name,
          last_name: '', // Deixar vazio ou inferir se possível
          telefone: phone || null,
          role: 'prospect', // Novos clientes de agendamento são prospect por padrão
          status: 'ativo',
        };

        const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('create-unverified-user', {
          body: {
            email: email,
            password: tempPassword,
            user_metadata: userMetadata,
          },
        });

        if (edgeFunctionError) {
          const specificErrorMessage = (edgeFunctionError as any)?.context?.data?.error || edgeFunctionError.message;
          throw new Error(`Falha ao criar novo usuário para agendamento: ${specificErrorMessage}`);
        }
        if (!edgeFunctionData || !edgeFunctionData.userId) {
          throw new Error("Falha ao criar novo usuário: Edge Function não retornou ID do usuário.");
        }
        clientIdToUse = edgeFunctionData.userId;
        toast.info(`Novo usuário '${email}' criado com sucesso! O cliente precisará redefinir a senha através do link de confirmação de e-mail.`);
      }

      if (!clientIdToUse) {
        throw new Error("ID do cliente não fornecido ou não pôde ser criado.");
      }

      if (appointmentData.id) {
        // Update existing appointment
        const { error } = await supabase.from('appointments').update({
          client_id: clientIdToUse, // Use o ID do cliente (existente ou recém-criado)
          client_name: appointmentData.client_name, // NOVO: Salva o nome do cliente
          client_email: appointmentData.client_email, // NOVO: Salva o e-mail do cliente
          master_id: appointmentData.master_id,
          start_time: appointmentData.start_time.toISOString(),
          end_time: appointmentData.end_time.toISOString(),
          status: 'confirmed', // Sempre 'confirmed'
          notes: appointmentData.notes,
        }).eq('id', appointmentData.id);
        if (error) throw error;
      } else {
        // Insert new appointment
        const { error } = await supabase.from('appointments').insert({
          client_id: clientIdToUse, // Use o ID do cliente (existente ou recém-criado)
          client_name: appointmentData.client_name, // NOVO: Salva o nome do cliente
          client_email: appointmentData.client_email, // NOVO: Salva o e-mail do cliente
          master_id: appointmentData.master_id,
          start_time: appointmentData.start_time.toISOString(),
          end_time: appointmentData.end_time.toISOString(),
          status: 'confirmed', // Sempre 'confirmed'
          notes: appointmentData.notes,
        });
        if (error) throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['allClientProfiles'] }); // Invalida perfis para atualizar lista de clientes
      toast.success(variables.id ? 'Agendamento atualizado com sucesso!' : 'Agendamento criado com sucesso!');
      setIsTimeSlotDialogOpen(false);
      setIsAddAppointmentDialogOpen(false);
      setEditingAppointment(null); // Limpa o agendamento em edição
      setSelectedDate(undefined);
    },
    onError: (err) => {
      console.error("Erro ao salvar agendamento:", err);
      toast.error(`Erro ao salvar agendamento: ${err.message}`);
    },
  });

  // Mutation to delete an appointment
  const deleteAppointmentMutation = useMutation<void, Error, string>({
    mutationFn: async (appointmentId) => {
      const { error } = await supabase.from('appointments').delete().eq('id', appointmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento excluído com sucesso!');
    },
    onError: (err) => {
      toast.error(`Erro ao excluir agendamento: ${err.message}`);
    },
  });

  // Filtra agendamentos para "Agendamentos do Dia"
  const todayAppointments = useMemo(() => {
    if (!appointments || !selectedDate) {
      console.log("todayAppointments: No appointments or no selectedDate.");
      return [];
    }
    console.log("todayAppointments: Filtering for selectedDate:", selectedDate);
    const filtered = appointments.filter(app => {
      const appStartTime = parseISO(app.start_time);
      const isSame = isSameDay(appStartTime, selectedDate);
      console.log(`  App: ${app.start_time} (${appStartTime}), Selected: ${selectedDate}, isSameDay: ${isSame}`);
      return isSame;
    });
    console.log("todayAppointments: Filtered results:", filtered);
    return filtered.sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());
  }, [appointments, selectedDate]);

  // NOVO: Lista de agendamentos da semana (sempre da semana atual, de segunda a domingo)
  const weeklyAppointments = useMemo(() => {
    if (!appointments) return [];

    const now = new Date();
    const startOfCurrentWeek = startOfWeek(now, { locale: ptBR, weekStartsOn: 1 }); // weekStartsOn: 1 para segunda-feira
    const endOfCurrentWeek = endOfWeek(now, { locale: ptBR, weekStartsOn: 1 }); // weekStartsOn: 1 para segunda-feira

    return appointments
      .filter(app => {
        const appStartTime = parseISO(app.start_time);
        return isWithinInterval(appStartTime, { start: startOfCurrentWeek, end: endOfCurrentWeek });
      })
      .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());
  }, [appointments]);

  // NOVO: Lista de agendamentos do mês
  const monthlyAppointments = useMemo(() => {
    if (!appointments || !selectedDate) return [];

    const startOfCurrentMonth = startOfMonth(selectedDate);
    const endOfCurrentMonth = endOfMonth(selectedDate);

    return appointments
      .filter(app => {
        const appStartTime = parseISO(app.start_time);
        return isWithinInterval(appStartTime, { start: startOfCurrentMonth, end: endOfCurrentMonth });
      })
      .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());
  }, [appointments, selectedDate]);

  // NOVO: Lista dos últimos agendamentos (todos, ordenados por data de criação)
  const latestAppointments = useMemo(() => {
    if (!appointments) return [];
    return [...appointments]
      .sort((a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime())
      .slice(0, 5); // Apenas os 5 mais recentes
  }, [appointments]);

  const handleDateSelectedFromList = (date: Date) => {
    setSelectedDate(date);
    setIsTimeSlotDialogOpen(true);
  };

  const handleAppointmentConfirm = (startTime: Date, endTime: Date) => {
    if (!user?.id || !masterIdForBooking || !profile?.first_name || !user?.email) {
      toast.error("Erro: Usuário, Master, nome ou e-mail não identificados para agendamento.");
      return;
    }
    upsertAppointmentMutation.mutate({
      client_id: user.id, // Cliente logado
      client_name: `${profile.first_name} ${profile.last_name || ''}`.trim(), // Nome do cliente logado
      client_email: user.email, // E-mail do cliente logado
      master_id: masterIdForBooking,
      start_time: startTime,
      end_time: endTime,
      status: 'confirmed', // Sempre 'confirmed'
      notes: `Agendamento com ${profile?.first_name || 'Cliente'}`,
    });
  };

  const handleOpenAddAppointmentDialog = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
    } else {
      setEditingAppointment(null);
    }
    setIsAddAppointmentDialogOpen(true);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    deleteAppointmentMutation.mutate(appointmentId);
  };

  const handleRowClick = (appointment: Appointment) => {
    setSelectedAppointmentForDetails(appointment);
    setIsDetailsPopupOpen(true);
  };

  if (authLoading || isLoadingAppointments || (isMaster ? isLoadingAllClientProfiles : isLoadingSingleMasterProfile || isLoadingAllMasterProfiles)) {
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

  const now = new Date();
  const startOfCurrentWeek = startOfWeek(now, { locale: ptBR, weekStartsOn: 1 });
  const endOfCurrentWeek = endOfWeek(now, { locale: ptBR, weekStartsOn: 1 });

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
          {isMaster && (
            <Button onClick={() => handleOpenAddAppointmentDialog()} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Agendamento
            </Button>
          )}
        </div>
        <p className="text-lg text-[#9ba8b5]">
          Olá, <span className="font-semibold text-white">{profile?.first_name}</span>!
          {isMaster
            ? ' Visualize e gerencie todos os agendamentos da plataforma.'
            : ' Acompanhe seus compromissos com a Pontedra.'}
        </p>

        {/* Caixa de Últimos Agendamentos - MOVIDA PARA O TOPO */}
        <Card className="bg-card border-border shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" /> Últimos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Os 5 agendamentos mais recentes na plataforma.
            </p>
            <div className="overflow-x-auto max-h-60 custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="text-muted-foreground">CLIENTE</TableHead>
                    <TableHead className="text-muted-foreground">E-MAIL</TableHead>
                    <TableHead className="text-muted-foreground">DATA</TableHead>
                    <TableHead className="text-muted-foreground">HORÁRIO</TableHead>
                    <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestAppointments.length > 0 ? (
                    latestAppointments.map((app) => (
                      <TableRow key={app.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10 cursor-pointer" onClick={() => handleRowClick(app)}>
                        <TableCell className="font-medium text-foreground py-3">
                          {app.client_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-3">
                          {app.client_email}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-3">
                          {format(parseISO(app.start_time), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-3">
                          {format(parseISO(app.start_time), 'HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleCancelAppointment(app.id); }}
                            className="text-destructive hover:text-destructive/80"
                            disabled={deleteAppointmentMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                        Nenhum agendamento recente.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Componente de seleção de data */}
        {masterIdForBooking && (
          <DateSelectionList
            masterId={masterIdForBooking}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
            isMasterBooking={isMaster}
            allAppointments={appointments || []}
          />
        )}

        {/* Tabela de Agendamentos do Dia */}
        <Card className="bg-card border-border shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-500" /> Agendamentos para {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'o dia selecionado'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Total: <span className="font-bold text-primary">{todayAppointments.length}</span> agendamentos.
            </p>
            <div className="overflow-x-auto max-h-60 custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="text-muted-foreground">NOME</TableHead>
                    <TableHead className="text-muted-foreground">E-MAIL</TableHead>
                    <TableHead className="text-muted-foreground">HORÁRIO</TableHead>
                    <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayAppointments.length > 0 ? (
                    todayAppointments.map((app) => (
                      <TableRow key={app.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10 cursor-pointer" onClick={() => handleRowClick(app)}>
                        <TableCell className="font-medium text-foreground py-3">
                          {app.client_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-3">
                          {app.client_email}
                        </TableCell>
                        <TableCell className="font-medium text-foreground py-3">
                          {format(parseISO(app.start_time), 'HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleCancelAppointment(app.id); }}
                            className="text-destructive hover:text-destructive/80"
                            disabled={deleteAppointmentMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                        Nenhum agendamento.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* NOVO: Caixa de Agendamentos da Semana */}
        <Card className="bg-card border-border shadow-lg rounded-xl mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-green-500" /> Agendamentos da Semana ({format(startOfCurrentWeek, 'dd/MM', { locale: ptBR })} - {format(endOfCurrentWeek, 'dd/MM', { locale: ptBR })})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Total: <span className="font-bold text-primary">{weeklyAppointments.length}</span> agendamentos.
            </p>
            <div className="overflow-x-auto max-h-60 custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="text-muted-foreground">NOME</TableHead>
                    <TableHead className="text-muted-foreground">E-MAIL</TableHead>
                    <TableHead className="text-muted-foreground">DATA</TableHead>
                    <TableHead className="text-muted-foreground">HORÁRIO</TableHead>
                    <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyAppointments.length > 0 ? (
                    weeklyAppointments.map((app) => (
                      <TableRow key={app.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10 cursor-pointer" onClick={() => handleRowClick(app)}>
                        <TableCell className="font-medium text-foreground py-3">
                          {app.client_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-3">
                          {app.client_email}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-3">
                          {format(parseISO(app.start_time), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-3">
                          {format(parseISO(app.start_time), 'HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleCancelAppointment(app.id); }}
                            className="text-destructive hover:text-destructive/80"
                            disabled={deleteAppointmentMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                        Nenhum agendamento para esta semana.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* NOVO: Caixa de Agendamentos do Mês */}
        <Card className="bg-card border-border shadow-lg rounded-xl mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-orange-500" /> Agendamentos do Mês ({selectedDate ? format(selectedDate, 'MMMM/yyyy', { locale: ptBR }) : 'o mês selecionado'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Total: <span className="font-bold text-primary">{monthlyAppointments.length}</span> agendamentos.
            </p>
            <div className="overflow-x-auto max-h-60 custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="text-muted-foreground">NOME</TableHead>
                    <TableHead className="text-muted-foreground">E-MAIL</TableHead>
                    <TableHead className="text-muted-foreground">DATA</TableHead>
                    <TableHead className="text-muted-foreground">HORÁRIO</TableHead>
                    <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyAppointments.length > 0 ? (
                    monthlyAppointments.map((app) => (
                      <TableRow key={app.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10 cursor-pointer" onClick={() => handleRowClick(app)}>
                        <TableCell className="font-medium text-foreground py-3">
                          {app.client_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-3">
                          {app.client_email}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-3">
                          {format(parseISO(app.start_time), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-3">
                          {format(parseISO(app.start_time), 'HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleCancelAppointment(app.id); }}
                            className="text-destructive hover:text-destructive/80"
                            disabled={deleteAppointmentMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                        Nenhum agendamento para este mês.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Diálogo de Seleção de Horário (para clientes) */}
        {!isMaster && masterIdForBooking && (
          <TimeSlotSelectionDialog
            isOpen={isTimeSlotDialogOpen}
            onClose={() => setIsTimeSlotDialogOpen(false)}
            selectedDate={selectedDate}
            masterId={masterIdForBooking}
            onAppointmentConfirm={handleAppointmentConfirm}
          />
        )}

        {/* Diálogo de Adição/Edição de Agendamento (para Masters) */}
        {isMaster && (
          <AddAppointmentDialog
            isOpen={isAddAppointmentDialogOpen}
            onClose={() => setIsAddAppointmentDialogOpen(false)}
            onSave={async (data) => {
              await upsertAppointmentMutation.mutate(data);
            }}
            isSaving={upsertAppointmentMutation.isPending}
            initialData={editingAppointment}
          />
        )}

        {/* Pop-up de Detalhes do Agendamento */}
        <AppointmentDetailsPopup
          isOpen={isDetailsPopupOpen}
          onClose={() => setIsDetailsPopupOpen(false)}
          appointment={selectedAppointmentForDetails}
        />
      </motion.div>
    </DashboardLayout>
  );
}