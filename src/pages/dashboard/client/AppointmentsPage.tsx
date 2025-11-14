import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  CheckCircle,
  XCircle,
  PlusCircle,
  Edit,
  Trash2,
  ChevronDown,
  FileText,
} from 'lucide-react';
import {
  format,
  parseISO,
  addMinutes,
  isPast,
  isSameDay,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isWithinInterval,
  isBefore,
  isAfter,
  subDays,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar'; // Shadcn Calendar
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Interfaces para as tabelas
interface MasterAvailability {
  id: string;
  master_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // HH:mm:ss
  end_time:   // HH:mm:ss
}

interface MasterException {
  id: string;
  master_id: string;
  exception_date: string; // YYYY-MM-DD
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

interface Appointment {
  id: string;
  client_id: string;
  master_id: string;
  start_time: string; // TIMESTAMP WITH TIME ZONE
  end_time:   // TIMESTAMP WITH TIME ZONE
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

interface ClientProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  telefone: string | null;
  email: string;
}

const APPOINTMENT_DURATION_MINUTES = 30; // Duração fixa de cada slot de agendamento

export default function AppointmentsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [clientNotes, setClientNotes] = useState<string>('');

  // Dialogs para agendamento (cliente)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  // Dialogs para detalhes/gerenciamento (Master e Cliente)
  const [isAppointmentDetailsOpen, setIsAppointmentDetailsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Dialogs para ações do Master
  const [isStatusChangeOpen, setIsStatusChangeOpen] = useState(false);
  const [appointmentToChangeStatus, setAppointmentToChangeStatus] = useState<Appointment | null>(null);
  const [newStatus, setNewStatus] = useState<Appointment['status'] | ''>('');

  // NOVO: Estados para o diálogo de criação de agendamento pelo Master
  const [isCreateAppointmentDialogOpen, setIsCreateAppointmentDialogOpen] = useState(false);
  const [newAppointmentFormData, setNewAppointmentFormData] = useState<{
    clientId: string | undefined;
    selectedDate: Date | undefined;
    selectedSlot: Date | null;
    notes: string;
    status: Appointment['status'];
  }>({
    clientId: undefined,
    selectedDate: new Date(),
    selectedSlot: null,
    notes: '',
    status: 'pending', // Default status for new appointments
  });

  // Fetch Master's Availability (assuming a single master for now, or fetching all masters' availability)
  const { data: masterAvailability, isLoading: isLoadingAvailability } = useQuery<MasterAvailability[], Error>({
    queryKey: ['masterAvailability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_availability')
        .select('*')
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !authLoading,
  });

  // Fetch Master's Exceptions
  const { data: masterExceptions, isLoading: isLoadingExceptions } = useQuery<MasterException[], Error>({
    queryKey: ['masterExceptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_exceptions')
        .select('*')
        .order('exception_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !authLoading,
  });

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

  // NOVO: Fetch all client profiles for Master to select from
  const { data: clientProfilesData, isLoading: isLoadingClientProfilesData } = useQuery<Omit<ClientProfile, 'email'>[], Error>({
    queryKey: ['clientProfilesData'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          client_id,
          first_name,
          last_name,
          telefone
        `)
        .neq('role', 'master'); // Excluir masters da lista de clientes para agendamento

      if (profilesError) throw profilesError;
      return profiles;
    },
    enabled: profile?.role === 'master' && !authLoading,
  });

  // NOVO: Fetch emails for client profiles via Edge Function
  const { data: clientEmailsMap, isLoading: isLoadingClientEmails } = useQuery<Record<string, string>, Error>({
    queryKey: ['clientProfileEmails', clientProfilesData?.map(p => p.id)],
    queryFn: async ({ queryKey }) => {
      const userIds = queryKey[1] as string[];
      if (!userIds || userIds.length === 0) return {};

      const { data, error } = await supabase.functions.invoke('get-user-emails', {
        body: { userIds },
      });

      if (error) throw error;
      return data as Record<string, string>;
    },
    enabled: !!clientProfilesData && clientProfilesData.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // NOVO: Combine client profiles with emails
  const clientProfiles = useMemo(() => {
    if (!clientProfilesData) return [];
    return clientProfilesData.map(profile => ({
      ...profile,
      email: clientEmailsMap?.[profile.id] || 'N/A',
    }));
  }, [clientProfilesData, clientEmailsMap]);

  // Helper function to get available slots for a specific date
  const getAvailableSlotsForDate = useCallback((dateToUse: Date): Date[] => {
    if (!dateToUse || !masterAvailability || !masterExceptions || !appointments || !user) return [];

    const slots: Date[] = [];
    const currentMasterId = profile?.role === 'master' ? user.id : (masterAvailability?.[0]?.master_id || null);

    if (!currentMasterId) return [];

    const dayOfWeek = dateToUse.getDay();
    const formattedSelectedDate = format(dateToUse, 'yyyy-MM-dd');

    const dayException = masterExceptions.find(
      (ex) => ex.master_id === currentMasterId && ex.exception_date === formattedSelectedDate
    );

    if (dayException && !dayException.is_available) {
      return [];
    }

    const recurringSlots = masterAvailability.filter(
      (avail) => avail.master_id === currentMasterId && avail.day_of_week === dayOfWeek
    );

    let potentialIntervals: { start: Date; end: Date }[] = [];

    if (dayException && dayException.is_available && dayException.start_time && dayException.end_time) {
      const start = parseISO(`${formattedSelectedDate}T${dayException.start_time}`);
      const end = parseISO(`${formattedSelectedDate}T${dayException.end_time}`);
      potentialIntervals.push({ start, end });
    } else if (dayException && dayException.is_available && !dayException.start_time && !dayException.end_time) {
      const start = startOfDay(dateToUse);
      const end = endOfDay(dateToUse);
      potentialIntervals.push({ start, end });
    } else {
      recurringSlots.forEach((avail) => {
        const start = parseISO(`${formattedSelectedDate}T${avail.start_time}`);
        const end = parseISO(`${formattedSelectedDate}T${avail.end_time}`);
        potentialIntervals.push({ start, end });
      });
    }

    potentialIntervals.forEach((interval) => {
      let currentTime = interval.start;
      while (isBefore(currentTime, interval.end)) {
        const slotEnd = addMinutes(currentTime, APPOINTMENT_DURATION_MINUTES);
        if (isAfter(slotEnd, interval.end)) {
          break;
        }

        if ((profile?.role === 'client' || isCreateAppointmentDialogOpen) && isPast(slotEnd)) {
          currentTime = slotEnd;
          continue;
        }

        const isBooked = appointments.some((app) => {
          const appStart = parseISO(app.start_time);
          const appEnd = parseISO(app.end_time);
          return (
            app.master_id === currentMasterId &&
            app.status !== 'cancelled' &&
            (isWithinInterval(currentTime, { start: appStart, end: addMinutes(appEnd, -1) }) ||
            isWithinInterval(slotEnd, { start: addMinutes(appStart, 1), end: appEnd }) ||
            (isBefore(appStart, currentTime) && isAfter(appEnd, slotEnd)))
          );
        });

        if (!isBooked) {
          slots.push(currentTime);
        }
        currentTime = slotEnd;
      }
    });

    return slots.sort((a, b) => a.getTime() - b.getTime());
  }, [masterAvailability, masterExceptions, appointments, user, profile?.role, isCreateAppointmentDialogOpen]);

  // Generate available slots for the currently selected date (main calendar)
  const currentSelectedDateSlots = useMemo(() => {
    return getAvailableSlotsForDate(selectedDate || new Date());
  }, [selectedDate, getAvailableSlotsForDate]);

  // Generate available slots for the date selected in the Master's create appointment dialog
  const masterCreateDialogSlots = useMemo(() => {
    return getAvailableSlotsForDate(newAppointmentFormData.selectedDate || new Date());
  }, [newAppointmentFormData.selectedDate, getAvailableSlotsForDate]);

  // Determine which slots array to use based on which dialog is open
  const slotsToDisplay = isCreateAppointmentDialogOpen ? masterCreateDialogSlots : currentSelectedDateSlots;

  // NOVO: Memo para calcular quais datas têm slots disponíveis no mês atual do calendário
  const datesWithAvailableSlots = useMemo(() => {
    const dates = new Set<string>();
    // Ensure selectedDate is always a Date object for calculations
    const dateForCalculation = selectedDate instanceof Date ? selectedDate : new Date(); 

    const start = startOfMonth(dateForCalculation);
    const end = endOfMonth(dateForCalculation);
    const daysInMonth = eachDayOfInterval({ start, end });

    daysInMonth.forEach(day => {
      // Only check future dates or today
      if (isBefore(day, startOfDay(subDays(new Date(), 1)))) {
        return;
      }
      const slots = getAvailableSlotsForDate(day);
      if (slots.length > 0) {
        dates.add(format(day, 'yyyy-MM-dd'));
      }
    });
    return dates;
  }, [selectedDate, getAvailableSlotsForDate]);

  // NOVO: Filtrar agendamentos para a "Agenda do Dia"
  const dailyAppointments = useMemo(() => {
    if (!appointments || !selectedDate) return [];
    return appointments.filter(app =>
      isSameDay(parseISO(app.start_time), selectedDate)
    ).sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());
  }, [appointments, selectedDate]);

  // Mutation to create a new appointment (modified to accept clientId and status)
  const createAppointmentMutation = useMutation<void, Error, { clientId: string; masterId: string; startTime: Date; endTime: Date; notes: string; status: Appointment['status'] }>({
    mutationFn: async ({ clientId, masterId, startTime, endTime, notes, status }) => {
      const { error } = await supabase.from('appointments').insert({
        client_id: clientId,
        master_id: masterId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        notes: notes,
        status: status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id, profile?.role] });
      toast.success('Agendamento solicitado com sucesso! Aguarde a confirmação.');
      setIsBookingDialogOpen(false); // For client booking
      setIsCreateAppointmentDialogOpen(false); // For master creation
      setSelectedSlot(null);
      setClientNotes('');
      setNewAppointmentFormData({ // Reset master form data
        clientId: undefined,
        selectedDate: new Date(),
        selectedSlot: null,
        notes: '',
        status: 'pending',
      });
    },
    onError: (err) => {
      toast.error(`Erro ao solicitar agendamento: ${err.message}`);
    },
  });

  // Mutation to update appointment status (used by client to cancel, by master to confirm/cancel/complete)
  const updateAppointmentStatusMutation = useMutation<void, Error, { appointmentId: string; status: Appointment['status'] }>({
    mutationFn: async ({ appointmentId, status }) => {
      const { error } = await supabase.from('appointments').update({ status }).eq('id', appointmentId);
      if (error) throw error;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id, profile?.role] });
      toast.success(`Agendamento ${variables.status === 'cancelled' ? 'cancelado' : 'atualizado'} com sucesso!`);
      setIsAppointmentDetailsOpen(false);
      setIsStatusChangeOpen(false);
      setSelectedAppointment(null);
      setAppointmentToChangeStatus(null);
      setNewStatus('');
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar status do agendamento: ${err.message}`);
    },
  });

  // Handlers
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleBookSlot = (slot: Date) => {
    setSelectedSlot(slot);
    setIsBookingDialogOpen(true);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !user) return;

    const masterId = masterAvailability?.[0]?.master_id; // Assuming first master for now
    if (!masterId) {
      toast.error("Nenhum Master disponível para agendamento.");
      return;
    }

    const startTime = selectedSlot;
    const endTime = addMinutes(selectedSlot, APPOINTMENT_DURATION_MINUTES);

    createAppointmentMutation.mutate({ clientId: user.id, masterId, startTime, endTime, notes: clientNotes, status: 'pending' });
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentDetailsOpen(true);
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    if (profile?.role === 'client' && appointment.status !== 'pending') {
      toast.error("Você só pode cancelar agendamentos pendentes.");
      return;
    }
    setAppointmentToChangeStatus(appointment);
    setNewStatus('cancelled');
    setIsStatusChangeOpen(true);
  };

  const handleMasterStatusChange = (appointment: Appointment) => {
    setAppointmentToChangeStatus(appointment);
    setNewStatus(appointment.status); // Pre-fill with current status
    setIsStatusChangeOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (!appointmentToChangeStatus || !newStatus) return;
    updateAppointmentStatusMutation.mutate({ appointmentId: appointmentToChangeStatus.id, status: newStatus });
  };

  // NOVO: Handlers para o diálogo de criação de agendamento pelo Master
  const handleOpenCreateAppointmentDialog = () => {
    setNewAppointmentFormData({
      clientId: undefined,
      selectedDate: new Date(),
      selectedSlot: null,
      notes: '',
      status: 'pending',
    });
    setIsCreateAppointmentDialogOpen(true);
  };

  const handleNewAppointmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAppointmentFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewAppointmentSelectChange = (name: string, value: string | Date | null) => {
    if (name === 'selectedDate' && value instanceof Date) {
      setNewAppointmentFormData(prev => ({ ...prev, selectedDate: value, selectedSlot: null })); // Reset slot on date change
    } else if (name === 'selectedSlot' && value instanceof Date) {
      setNewAppointmentFormData(prev => ({ ...prev, selectedSlot: value }));
    } else {
      setNewAppointmentFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointmentFormData.clientId || !newAppointmentFormData.selectedSlot || !user) {
      toast.error("Por favor, selecione um cliente e um horário.");
      return;
    }

    const masterId = user.id; // Master logado é o master do agendamento
    const startTime = newAppointmentFormData.selectedSlot;
    const endTime = addMinutes(startTime, APPOINTMENT_DURATION_MINUTES);

    createAppointmentMutation.mutate({
      clientId: newAppointmentFormData.clientId,
      masterId,
      startTime,
      endTime,
      notes: newAppointmentFormData.notes,
      status: newAppointmentFormData.status,
    });
  };

  const getStatusBadgeVariant = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'confirmed': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'cancelled': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'completed': return 'bg-blue-500 hover:bg-blue-600 text-white';
      default: return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  const isLoading = authLoading || isLoadingAvailability || isLoadingExceptions || isLoadingAppointments || isLoadingClientProfilesData || isLoadingClientEmails;

  if (isLoading) {
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

  const isMaster = profile?.role === 'master';

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-foreground">
            {isMaster ? 'Gerenciar Agendamentos' : 'Meus Agendamentos'}
          </h1>
          {isMaster && (
            <Button onClick={handleOpenCreateAppointmentDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md">
              <PlusCircle className="mr-2 h-4 w-4" /> Criar Agendamento
            </Button>
          )}
        </div>
        <p className="text-lg text-[#9ba8b5]">
          Olá, <span className="font-semibold text-white">{profile?.first_name}</span>!
          {isMaster
            ? ' Visualize e gerencie todos os agendamentos da plataforma.'
            : ' Agende suas reuniões e acompanhe seus compromissos com a Pontedra.'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna do Calendário e Slots Disponíveis (para clientes e Master ao criar) */}
          <div className="bg-card border border-border rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-blue-500" /> {isMaster ? 'Selecionar Data para Agendamento' : 'Agendar Reunião'}
            </h2>
            <p className="text-muted-foreground mb-6">
              Selecione uma data e um horário disponível para sua reunião.
            </p>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="react-calendar-container"> {/* Adicionado o contêiner para o calendário */}
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    locale={ptBR}
                    className="rounded-md border bg-background"
                    disabled={(date) => isBefore(date, startOfDay(new Date()))} // Desabilita datas passadas
                    modifiers={{
                      available: (date) => datesWithAvailableSlots.has(format(date, 'yyyy-MM-dd')),
                    }}
                    modifiersStyles={{
                      available: {
                        backgroundColor: 'hsl(var(--primary) / 0.2)',
                        color: 'hsl(var(--primary))',
                        fontWeight: 'bold',
                      },
                    }}
                  />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Horários Disponíveis em {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : '...'}
                </h3>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {slotsToDisplay.length > 0 ? (
                    slotsToDisplay.map((slot, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleBookSlot(slot)}
                        className="bg-background border-border text-foreground hover:bg-muted"
                        disabled={createAppointmentMutation.isPending}
                      >
                        {format(slot, 'HH:mm', { locale: ptBR })}
                      </Button>
                    ))
                  ) : (
                    <p className="col-span-2 text-muted-foreground text-sm">
                      Nenhum horário disponível para a data selecionada.
                      {selectedDate && isBefore(selectedDate, startOfDay(new Date())) && " (Data no passado)"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna de Meus Agendamentos (para clientes) / Todos os Agendamentos (para Master) */}
          <div className="bg-card border border-border rounded-xl shadow-lg p-6 col-span-full lg:col-span-1">
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-500" />
              {isMaster ? 'Todos os Agendamentos' : 'Próximos Agendamentos'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isMaster
                ? 'Visualize e gerencie todos os agendamentos da equipe.'
                : 'Seus próximos compromissos com a Pontedra.'}
            </p>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="text-muted-foreground">DATA</TableHead>
                    <TableHead className="text-muted-foreground">HORÁRIO</TableHead>
                    {isMaster && <TableHead className="text-muted-foreground">CLIENTE</TableHead>}
                    <TableHead className="text-muted-foreground">STATUS</TableHead>
                    <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments && appointments.length > 0 ? (
                    appointments.map((app) => (
                      <TableRow key={app.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10">
                        <TableCell className="font-medium text-foreground py-4">
                          {format(parseISO(app.start_time), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-foreground py-4">
                          {format(parseISO(app.start_time), 'HH:mm', { locale: ptBR })} - {format(parseISO(app.end_time), 'HH:mm', { locale: ptBR })}
                        </TableCell>
                        {isMaster && (
                          <TableCell className="text-muted-foreground py-4">
                            {app.profiles?.first_name} {app.profiles?.last_name}
                            {app.client_email && <p className="text-xs">{app.client_email}</p>}
                          </TableCell>
                        )}
                        <TableCell className="py-4">
                          <Badge className={getStatusBadgeVariant(app.status)}>
                            {app.status === 'pending' ? 'Pendente' :
                             app.status === 'confirmed' ? 'Confirmado' :
                             app.status === 'cancelled' ? 'Cancelado' :
                             app.status === 'completed' ? 'Concluído' : 'Desconhecido'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(app)} className="text-blue-500 hover:text-blue-600">
                            <Info className="h-4 w-4" />
                          </Button>
                          {!isMaster && app.status === 'pending' && (
                            <Button variant="ghost" size="sm" onClick={() => handleCancelAppointment(app)} className="text-destructive hover:text-destructive/80">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {isMaster && (
                            <Button variant="ghost" size="sm" onClick={() => handleMasterStatusChange(app)} className="text-primary hover:text-primary/80">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isMaster ? 5 : 4} className="text-center text-muted-foreground py-8">
                        Nenhum agendamento encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* NOVO: Tabela de Agenda do Dia */}
        <div className="bg-card border border-border rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-green-500" /> Agenda do Dia: {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione uma data'}
          </h2>
          <p className="text-muted-foreground mb-6">
            Todos os agendamentos para a data selecionada.
          </p>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead className="text-muted-foreground">HORÁRIO</TableHead>
                  {isMaster && <TableHead className="text-muted-foreground">CLIENTE</TableHead>}
                  <TableHead className="text-muted-foreground">NOTAS</TableHead>
                  <TableHead className="text-muted-foreground">STATUS</TableHead>
                  <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyAppointments.length > 0 ? (
                  dailyAppointments.map((app) => (
                    <TableRow key={app.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10">
                      <TableCell className="font-medium text-foreground py-4">
                        {format(parseISO(app.start_time), 'HH:mm', { locale: ptBR })} - {format(parseISO(app.end_time), 'HH:mm', { locale: ptBR })}
                      </TableCell>
                      {isMaster && (
                        <TableCell className="text-muted-foreground py-4">
                          {app.profiles?.first_name} {app.profiles?.last_name}
                          {app.client_email && <p className="text-xs">{app.client_email}</p>}
                        </TableCell>
                      )}
                      <TableCell className="text-muted-foreground py-4 max-w-[200px] truncate">
                        {app.notes || 'N/A'}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={getStatusBadgeVariant(app.status)}>
                          {app.status === 'pending' ? 'Pendente' :
                           app.status === 'confirmed' ? 'Confirmado' :
                           app.status === 'cancelled' ? 'Cancelado' :
                           app.status === 'completed' ? 'Concluído' : 'Desconhecido'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(app)} className="text-blue-500 hover:text-blue-600">
                          <Info className="h-4 w-4" />
                        </Button>
                        {!isMaster && app.status === 'pending' && (
                          <Button variant="ghost" size="sm" onClick={() => handleCancelAppointment(app)} className="text-destructive hover:text-destructive/80">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {isMaster && (
                          <Button variant="ghost" size="sm" onClick={() => handleMasterStatusChange(app)} className="text-primary hover:text-primary/80">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isMaster ? 5 : 4} className="text-center text-muted-foreground py-8">
                      Nenhum agendamento para esta data.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Dialog de Agendamento (Cliente) */}
        <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
          <DialogContent className="sm:max-w-md bg-card border-border text-foreground rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">Confirmar Agendamento</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Você está agendando uma reunião para:
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleConfirmBooking} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-foreground">Data e Hora</Label>
                <Input
                  value={selectedSlot ? format(selectedSlot, 'dd/MM/yyyy HH:mm', { locale: ptBR }) : ''}
                  readOnly
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-notes" className="text-foreground">Notas (Opcional)</Label>
                <Textarea
                  id="client-notes"
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Adicione detalhes ou perguntas para a reunião..."
                  rows={3}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)} className="bg-background border-border text-foreground hover:bg-muted">
                  Cancelar
                </Button>
                <Button type="submit" disabled={createAppointmentMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {createAppointmentMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Confirmar Agendamento
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Detalhes do Agendamento (Cliente e Master) */}
        <Dialog open={isAppointmentDetailsOpen} onOpenChange={setIsAppointmentDetailsOpen}>
          <DialogContent className="sm:max-w-md bg-card border-border text-foreground rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">Detalhes do Agendamento</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Informações completas sobre o agendamento.
              </DialogDescription>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4 py-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Data</p>
                  <p className="font-semibold text-foreground">{format(parseISO(selectedAppointment.start_time), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Horário</p>
                  <p className="font-semibold text-foreground">
                    {format(parseISO(selectedAppointment.start_time), 'HH:mm', { locale: ptBR })} - {format(parseISO(selectedAppointment.end_time), 'HH:mm', { locale: ptBR })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><Info className="w-4 h-4" /> Status</p>
                  <Badge className={getStatusBadgeVariant(selectedAppointment.status)}>
                    {selectedAppointment.status === 'pending' ? 'Pendente' :
                     selectedAppointment.status === 'confirmed' ? 'Confirmado' :
                     selectedAppointment.status === 'cancelled' ? 'Cancelado' :
                     selectedAppointment.status === 'completed' ? 'Concluído' : 'Desconhecido'}
                  </Badge>
                </div>
                {isMaster && selectedAppointment.profiles && (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Cliente</p>
                      <p className="font-semibold text-foreground">{selectedAppointment.profiles.first_name} {selectedAppointment.profiles.last_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4" /> E-mail do Cliente</p>
                      <p className="font-semibold text-foreground">{selectedAppointment.client_email || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4" /> Telefone do Cliente</p>
                      <p className="font-semibold text-foreground">{selectedAppointment.profiles.telefone || 'N/A'}</p>
                    </div>
                  </>
                )}
                {selectedAppointment.notes && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><FileText className="w-4 h-4" /> Notas</p>
                    <p className="text-foreground">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsAppointmentDetailsOpen(false)} className="bg-background border-border text-foreground hover:bg-muted">
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Mudança de Status (Master) / Confirmação de Cancelamento (Cliente) */}
        <Dialog open={isStatusChangeOpen} onOpenChange={setIsStatusChangeOpen}>
          <DialogContent className="sm:max-w-md bg-card border-border text-foreground rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                {isMaster ? 'Alterar Status do Agendamento' : 'Confirmar Cancelamento'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {isMaster
                  ? `Altere o status do agendamento de ${appointmentToChangeStatus?.profiles?.first_name || 'cliente'} em ${appointmentToChangeStatus ? format(parseISO(appointmentToChangeStatus.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : ''}.`
                  : `Tem certeza que deseja cancelar seu agendamento em ${appointmentToChangeStatus ? format(parseISO(appointmentToChangeStatus.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : ''}?`}
              </DialogDescription>
            </DialogHeader>
            {appointmentToChangeStatus && (
              <div className="space-y-4 py-4">
                {isMaster && (
                  <div className="space-y-2">
                    <Label htmlFor="new-status" className="text-foreground">Novo Status</Label>
                    <Select
                      name="new-status"
                      value={newStatus}
                      onValueChange={(value: Appointment['status']) => setNewStatus(value)}
                    >
                      <SelectTrigger className="w-full bg-background border-border text-foreground">
                        <SelectValue placeholder="Selecione o novo status" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {!isMaster && (
                  <p className="text-sm text-muted-foreground">
                    Esta ação não pode ser desfeita.
                  </p>
                )}
              </div>
            )}
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsStatusChangeOpen(false)} className="bg-background border-border text-foreground hover:bg-muted">
                Cancelar
              </Button>
              <Button onClick={handleConfirmStatusChange} disabled={updateAppointmentStatusMutation.isPending} className={isMaster ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'}>
                {updateAppointmentStatusMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isMaster ? 'Salvar Status' : 'Confirmar Cancelamento'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* NOVO: Dialog de Criação de Agendamento (Master) */}
        {isMaster && (
          <Dialog open={isCreateAppointmentDialogOpen} onOpenChange={setIsCreateAppointmentDialogOpen}>
            <DialogContent className="sm:max-w-md bg-card border-border text-foreground rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary">Criar Novo Agendamento</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Preencha os detalhes para agendar uma reunião para um cliente.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAppointmentSubmit} className="space-y-4 py-4">
                {/* Seleção de Cliente */}
                <div className="space-y-2">
                  <Label htmlFor="client-select" className="text-foreground">Cliente *</Label>
                  <Select
                    name="clientId"
                    value={newAppointmentFormData.clientId}
                    onValueChange={(value) => handleNewAppointmentSelectChange('clientId', value)}
                    required
                  >
                    <SelectTrigger id="client-select" className="w-full bg-background border-border text-foreground">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      {clientProfiles.length > 0 ? (
                        clientProfiles.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              {client.first_name} {client.last_name} ({client.email})
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-clients" disabled>Nenhum cliente disponível</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Seleção de Data */}
                <div className="space-y-2">
                  <Label htmlFor="date-select" className="text-foreground">Data *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background border-border text-foreground",
                          !newAppointmentFormData.selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newAppointmentFormData.selectedDate ? format(newAppointmentFormData.selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover border-border text-popover-foreground">
                      <Calendar
                        mode="single"
                        selected={newAppointmentFormData.selectedDate}
                        onSelect={(date) => handleNewAppointmentSelectChange('selectedDate', date)}
                        initialFocus
                        locale={ptBR}
                        disabled={(date) => isBefore(date, startOfDay(new Date()))} // Desabilita datas passadas
                        modifiers={{
                          available: (date) => datesWithAvailableSlots.has(format(date, 'yyyy-MM-dd')),
                        }}
                        modifiersStyles={{
                          available: {
                            backgroundColor: 'hsl(var(--primary) / 0.2)',
                            color: 'hsl(var(--primary))',
                            fontWeight: 'bold',
                          },
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Seleção de Horário */}
                <div className="space-y-2">
                  <Label htmlFor="slot-select" className="text-foreground">Horário *</Label>
                  <Select
                    name="selectedSlot"
                    value={newAppointmentFormData.selectedSlot ? newAppointmentFormData.selectedSlot.toISOString() : ''}
                    onValueChange={(value) => handleNewAppointmentSelectChange('selectedSlot', parseISO(value))}
                    required
                    disabled={!newAppointmentFormData.selectedDate}
                  >
                    <SelectTrigger id="slot-select" className="w-full bg-background border-border text-foreground">
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      {masterCreateDialogSlots.length > 0 ? (
                        masterCreateDialogSlots.map((slot, index) => (
                          <SelectItem key={index} value={slot.toISOString()}>
                            {format(slot, 'HH:mm', { locale: ptBR })}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-slots" disabled>Nenhum horário disponível</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notas */}
                <div className="space-y-2">
                  <Label htmlFor="master-notes" className="text-foreground">Notas (Opcional)</Label>
                  <Textarea
                    id="master-notes"
                    name="notes"
                    value={newAppointmentFormData.notes}
                    onChange={handleNewAppointmentFormChange}
                    placeholder="Adicione detalhes ou observações..."
                    rows={3}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                {/* Status Inicial */}
                <div className="space-y-2">
                  <Label htmlFor="status-select" className="text-foreground">Status Inicial *</Label>
                  <Select
                    name="status"
                    value={newAppointmentFormData.status}
                    onValueChange={(value: Appointment['status']) => handleNewAppointmentSelectChange('status', value)}
                    required
                  >
                    <SelectTrigger id="status-select" className="w-full bg-background border-border text-foreground">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => setIsCreateAppointmentDialogOpen(false)} className="bg-background border-border text-foreground hover:bg-muted">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createAppointmentMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {createAppointmentMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    Criar Agendamento
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>
    </DashboardLayout>
  );
}