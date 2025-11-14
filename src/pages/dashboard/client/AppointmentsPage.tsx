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
} from 'lucide-react';
import {
  format,
  parseISO,
  addMinutes,
  isPast,
  isSameDay,
  startOfDay,
  endOfDay,
  eachHourOfInterval,
  eachDayOfInterval,
  isWithinInterval,
  isSameHour,
  isSameMinute,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  isBefore,
  isAfter,
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
  end_time: string;   // HH:mm:ss
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

  // Generate available slots for the selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate || !masterAvailability || !masterExceptions || !appointments || !user) return [];

    const slots: Date[] = [];
    const today = new Date();
    const currentMasterId = profile?.role === 'master' ? user.id : (masterAvailability?.[0]?.master_id || null); // Assuming first master or current master

    if (!currentMasterId) return []; // Cannot generate slots without a master

    const dayOfWeek = selectedDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');

    // 1. Check for full day exceptions (blocked or fully available)
    const dayException = masterExceptions.find(
      (ex) => ex.master_id === currentMasterId && ex.exception_date === formattedSelectedDate
    );

    if (dayException && !dayException.is_available) {
      return []; // Entire day is blocked by an exception
    }

    // 2. Get recurring availability for the day
    const recurringSlots = masterAvailability.filter(
      (avail) => avail.master_id === currentMasterId && avail.day_of_week === dayOfWeek
    );

    // 3. Generate potential slots based on recurring availability or exception override
    let potentialIntervals: { start: Date; end: Date }[] = [];

    if (dayException && dayException.is_available && dayException.start_time && dayException.end_time) {
      // Exception overrides with specific times
      const start = parseISO(`${formattedSelectedDate}T${dayException.start_time}`);
      const end = parseISO(`${formattedSelectedDate}T${dayException.end_time}`);
      potentialIntervals.push({ start, end });
    } else if (dayException && dayException.is_available && !dayException.start_time && !dayException.end_time) {
      // Exception overrides as fully available (e.g., 00:00 to 23:59)
      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);
      potentialIntervals.push({ start, end });
    } else {
      // Use recurring availability
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
          break; // Slot would extend past the end of the availability interval
        }

        // Filter out past slots (only for client booking)
        if (profile?.role === 'client' && isPast(slotEnd)) {
          currentTime = slotEnd;
          continue;
        }

        // Check against existing appointments
        const isBooked = appointments.some((app) => {
          const appStart = parseISO(app.start_time);
          const appEnd = parseISO(app.end_time);
          // An appointment is booked if its interval overlaps with the current slot
          // And it's not cancelled
          return (
            app.master_id === currentMasterId &&
            app.status !== 'cancelled' &&
            (isWithinInterval(currentTime, { start: appStart, end: addMinutes(appEnd, -1) }) || // Slot start is within app
            isWithinInterval(slotEnd, { start: addMinutes(appStart, 1), end: appEnd }) ||     // Slot end is within app
            (isBefore(appStart, currentTime) && isAfter(appEnd, slotEnd)))                   // App fully contains slot
          );
        });

        if (!isBooked) {
          slots.push(currentTime);
        }
        currentTime = slotEnd;
      }
    });

    return slots.sort((a, b) => a.getTime() - b.getTime());
  }, [selectedDate, masterAvailability, masterExceptions, appointments, user, profile?.role]);

  // Mutation to create a new appointment
  const createAppointmentMutation = useMutation<void, Error, { masterId: string; startTime: Date; endTime: Date; notes: string }>({
    mutationFn: async ({ masterId, startTime, endTime, notes }) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");
      const { error } = await supabase.from('appointments').insert({
        client_id: user.id,
        master_id: masterId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        notes: notes,
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id, profile?.role] });
      toast.success('Agendamento solicitado com sucesso! Aguarde a confirmação.');
      setIsBookingDialogOpen(false);
      setSelectedSlot(null);
      setClientNotes('');
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

    createAppointmentMutation.mutate({ masterId, startTime, endTime, notes: clientNotes });
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

  const getStatusBadgeVariant = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'confirmed': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'cancelled': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'completed': return 'bg-blue-500 hover:bg-blue-600 text-white';
      default: return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  const isLoading = authLoading || isLoadingAvailability || isLoadingExceptions || isLoadingAppointments;

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
        <div className="flex items-center gap-4 mb-8">
          <CalendarIcon className="w-10 h-10 text-[#57e389]" />
          <h1 className="text-4xl font-bold text-foreground">
            {isMaster ? 'Gerenciar Agendamentos' : 'Meus Agendamentos'}
          </h1>
        </div>
        <p className="text-lg text-[#9ba8b5]">
          Olá, <span className="font-semibold text-white">{profile?.first_name}</span>!
          {isMaster
            ? ' Visualize e gerencie todos os agendamentos da plataforma.'
            : ' Agende suas reuniões e acompanhe seus compromissos com a Pontedra.'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna do Calendário e Slots Disponíveis (para clientes) */}
          {!isMaster && (
            <div className="bg-card border border-border rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-blue-500" /> Agendar Reunião
              </h2>
              <p className="text-muted-foreground mb-6">
                Selecione uma data e um horário disponível para sua reunião.
              </p>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    locale={ptBR}
                    className="rounded-md border bg-background"
                    disabled={(date) => isBefore(date, subDays(new Date(), 1))} // Disable past dates
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Horários Disponíveis em {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : '...'}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot, index) => (
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
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

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
      </motion.div>
    </DashboardLayout>
  );
}