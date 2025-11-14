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
import { toast } from 'sonner';
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
  profiles?: { // Perfil do cliente
    first_name: string | null;
    last_name: string | null;
    telefone: string | null;
  };
  master_profiles?: { // Perfil do master
    first_name: string | null;
    last_name: string | null;
    telefone: string | null;
  };
  client_email?: string; // Adicionado para o email do cliente
  master_email?: string; // Adicionado para o email do master
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

  const isMaster = profile?.role === 'master';

  // Placeholder para a função de ver detalhes (será implementada em uma etapa futura, se necessário)
  const handleViewDetails = useCallback((appointment: Appointment) => {
    console.log("Ver detalhes do agendamento:", appointment);
    // Implementar lógica para abrir um pop-up de detalhes aqui
  }, []);

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

  // Fetch Appointments (filtered by client_id for clients, all for master)
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[], Error>({
    queryKey: ['appointments', user?.id, profile?.role],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('appointments')
        .select(`
          *,
          profiles!appointments_client_id_fkey (
            first_name,
            last_name,
            telefone
          ),
          master_profiles:profiles!appointments_master_id_fkey (
            first_name,
            last_name,
            telefone
          )
        `)
        .order('start_time', { ascending: true });

      if (profile?.role === 'client') {
        query = query.eq('client_id', user.id);
      } else if (profile?.role === 'master') {
        // Master sees all appointments, no specific filter by master_id here
        // If a master wants to see only their own appointments, an additional filter would be needed.
        // For now, assuming master sees all.
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch client and master emails
      if (data) {
        const allUserIds = Array.from(new Set([...data.map(app => app.client_id), ...data.map(app => app.master_id)]));
        const { data: emailsMap, error: emailError } = await supabase.functions.invoke('get-user-emails', {
          body: { userIds: allUserIds },
        });

        if (emailError) {
          console.error("Error fetching emails:", emailError);
          return data.map(app => ({
            ...app,
            client_email: 'Erro ao carregar e-mail',
            master_email: 'Erro ao carregar e-mail',
          }));
        }

        return data.map(app => ({
          ...app,
          client_email: (emailsMap as Record<string, string>)?.[app.client_id] || 'N/A',
          master_email: (emailsMap as Record<string, string>)?.[app.master_id] || 'N/A',
        }));
      }

      return data as Appointment[];
    },
    enabled: !!user?.id && !authLoading,
  });

  // Mutation to create a new appointment (used by both client and master dialog)
  const upsertAppointmentMutation = useMutation<void, Error, {
    id?: string; // Optional for update
    master_id: string;
    start_time: Date;
    end_time: Date;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    notes: string;
    existingClientId?: string;
    newClientDetails?: { name: string; email: string; phone?: string };
  }>({
    mutationFn: async (appointmentData) => {
      let clientIdToUse = appointmentData.existingClientId;

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
          master_id: appointmentData.master_id,
          start_time: appointmentData.start_time.toISOString(),
          end_time: appointmentData.end_time.toISOString(),
          status: appointmentData.status,
          notes: appointmentData.notes,
        }).eq('id', appointmentData.id);
        if (error) throw error;
      } else {
        // Insert new appointment
        const { error } = await supabase.from('appointments').insert({
          client_id: clientIdToUse, // Use o ID do cliente (existente ou recém-criado)
          master_id: appointmentData.master_id,
          start_time: appointmentData.start_time.toISOString(),
          end_time: appointmentData.end_time.toISOString(),
          status: appointmentData.status,
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
    setIsTimeSlotDialogOpen(true);
  };

  const handleAppointmentConfirm = (startTime: Date, endTime: Date) => {
    if (!user?.id || !masterIdForBooking) {
      toast.error("Erro: Usuário ou Master não identificados para agendamento.");
      return;
    }
    upsertAppointmentMutation.mutate({
      existingClientId: user.id, // Cliente logado
      master_id: masterIdForBooking,
      start_time: startTime,
      end_time: endTime,
      status: 'pending',
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

  if (authLoading || isLoadingAppointments || (isMaster ? false : isLoadingSingleMasterProfile)) {
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

        {/* Componente de seleção de data */}
        {isMaster ? (
          <Card className="bg-card border-border shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" /> Selecione uma Data
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                locale={ptBR}
                className="rounded-md border bg-background"
              />
            </CardContent>
          </Card>
        ) : (
          masterIdForBooking && (
            <DateSelectionList
              masterId={masterIdForBooking}
              onDateSelect={handleDateSelectedFromList}
              selectedDate={selectedDate}
            />
          )
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
                      <TableHead className="text-muted-foreground">CLIENTE</TableHead>
                      {isMaster && <TableHead className="text-muted-foreground">MASTER</TableHead>}
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
                          <TableCell className="text-muted-foreground py-3">
                            {app.profiles?.first_name} {app.profiles?.last_name}
                            {isMaster && app.client_email && <p className="text-xs text-muted-foreground">{app.client_email}</p>}
                          </TableCell>
                          {isMaster && (
                            <TableCell className="text-muted-foreground py-3">
                              {app.master_profiles?.first_name} {app.master_profiles?.last_name}
                              {app.master_email && <p className="text-xs text-muted-foreground">{app.master_email}</p>}
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
                            {isMaster && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => handleOpenAddAppointmentDialog(app)} className="text-primary hover:text-primary/80">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => deleteAppointmentMutation.mutate(app.id)} className="text-destructive hover:text-destructive/80">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={isMaster ? 5 : 4} className="text-center text-muted-foreground py-4">
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
                      <TableHead className="text-muted-foreground">CLIENTE</TableHead>
                      {isMaster && <TableHead className="text-muted-foreground">MASTER</TableHead>}
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
                          <TableCell className="text-muted-foreground py-3">
                            {app.profiles?.first_name} {app.profiles?.last_name}
                            {isMaster && app.client_email && <p className="text-xs text-muted-foreground">{app.client_email}</p>}
                          </TableCell>
                          {isMaster && (
                            <TableCell className="text-muted-foreground py-3">
                              {app.master_profiles?.first_name} {app.master_profiles?.last_name}
                              {app.master_email && <p className="text-xs text-muted-foreground">{app.master_email}</p>}
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
                            {isMaster && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => handleOpenAddAppointmentDialog(app)} className="text-primary hover:text-primary/80">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => deleteAppointmentMutation.mutate(app.id)} className="text-destructive hover:text-destructive/80">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={isMaster ? 5 : 4} className="text-center text-muted-foreground py-4">
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
                      <TableHead className="text-muted-foreground">CLIENTE</TableHead>
                      {isMaster && <TableHead className="text-muted-foreground">MASTER</TableHead>}
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
                          <TableCell className="text-muted-foreground py-3">
                            {app.profiles?.first_name} {app.profiles?.last_name}
                            {isMaster && app.client_email && <p className="text-xs text-muted-foreground">{app.client_email}</p>}
                          </TableCell>
                          {isMaster && (
                            <TableCell className="text-muted-foreground py-3">
                              {app.master_profiles?.first_name} {app.master_profiles?.last_name}
                              {app.master_email && <p className="text-xs text-muted-foreground">{app.master_email}</p>}
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
                            {isMaster && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => handleOpenAddAppointmentDialog(app)} className="text-primary hover:text-primary/80">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => deleteAppointmentMutation.mutate(app.id)} className="text-destructive hover:text-destructive/80">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={isMaster ? 5 : 4} className="text-center text-muted-foreground py-4">
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
    </DashboardLayout>
  );
}