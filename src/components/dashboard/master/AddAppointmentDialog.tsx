import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CalendarDays, Clock, User, Mail, Phone, CheckCircle, XCircle, PlusCircle } from 'lucide-react';
import {
  format,
  parseISO,
  setHours,
  setMinutes,
  isBefore,
  isSameHour,
  isSameMinute,
  addMinutes,
  startOfDay,
  isWeekend,
  getDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card'; // Adicionado importação do Card e CardContent

interface AddAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: {
    client_id: string;
    master_id: string;
    start_time: Date;
    end_time: Date;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    notes: string;
  }) => Promise<void>;
  isSaving: boolean;
}

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  telefone: string | null;
  email: string;
  role: 'prospect' | 'client' | 'master';
}

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
}

interface MasterAvailability {
  day_of_week: number; // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  start_time: string; // e.g., "10:00:00"
  end_time: string;   // e.g., "16:00:00"
}

interface MasterException {
  exception_date: string; // YYYY-MM-DD
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
}

const AddAppointmentDialog: React.FC<AddAppointmentDialogProps> = ({ isOpen, onClose, onSave, isSaving }) => {
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [selectedMasterId, setSelectedMasterId] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<Date | null>(null);
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'cancelled' | 'completed'>('pending');
  const [notes, setNotes] = useState('');

  // Fetch all clients (prospects and clients)
  const { data: clientProfiles, isLoading: isLoadingClientProfiles } = useQuery<UserProfile[], Error>({
    queryKey: ['allClientProfiles'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, telefone, role')
        .in('role', ['prospect', 'client']);
      if (profilesError) throw profilesError;

      const clientIds = profiles.map(p => p.id);
      const { data: emailsMap, error: emailError } = await supabase.functions.invoke('get-user-emails', {
        body: { userIds: clientIds },
      });
      if (emailError) throw emailError;

      return profiles.map(p => ({
        ...p,
        email: (emailsMap as Record<string, string>)?.[p.id] || 'N/A',
      }));
    },
    enabled: isOpen,
  });

  // Fetch all masters
  const { data: masterProfiles, isLoading: isLoadingMasterProfiles } = useQuery<UserProfile[], Error>({
    queryKey: ['allMasterProfiles'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, telefone, role')
        .eq('role', 'master');
      if (profilesError) throw profilesError;

      const masterIds = profiles.map(p => p.id);
      const { data: emailsMap, error: emailError } = await supabase.functions.invoke('get-user-emails', {
        body: { userIds: masterIds },
      });
      if (emailError) throw emailError;

      return profiles.map(p => ({
        ...p,
        email: (emailsMap as Record<string, string>)?.[p.id] || 'N/A',
      }));
    },
    enabled: isOpen,
  });

  // Fetch master's recurring availability for the selected master
  const { data: masterAvailability, isLoading: isLoadingMasterAvailability } = useQuery<MasterAvailability[], Error>({
    queryKey: ['masterAvailabilityForDialog', selectedMasterId],
    queryFn: async () => {
      if (!selectedMasterId) return [];
      const { data, error } = await supabase
        .from('master_availability')
        .select('*')
        .eq('master_id', selectedMasterId);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedMasterId && isOpen,
  });

  // Fetch master's exceptions for the selected master and date
  const { data: masterExceptions, isLoading: isLoadingMasterExceptions } = useQuery<MasterException[], Error>({
    queryKey: ['masterExceptionsForDialog', selectedMasterId, selectedDate?.toISOString()],
    queryFn: async () => {
      if (!selectedMasterId || !selectedDate) return [];
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('master_exceptions')
        .select('*')
        .eq('master_id', selectedMasterId)
        .eq('exception_date', dateString);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedMasterId && !!selectedDate && isOpen,
  });

  // Fetch existing appointments for the selected master and date
  const { data: existingAppointments, isLoading: isLoadingExistingAppointments } = useQuery<Appointment[], Error>({
    queryKey: ['existingAppointmentsForDialog', selectedMasterId, selectedDate?.toISOString()],
    queryFn: async () => {
      if (!selectedMasterId || !selectedDate) return [];
      const startOfDayISO = startOfDay(selectedDate).toISOString();
      const endOfDayISO = setHours(setMinutes(startOfDay(selectedDate), 59), 23).toISOString();

      const { data, error } = await supabase
        .from('appointments')
        .select('id, start_time, end_time')
        .eq('master_id', selectedMasterId)
        .gte('start_time', startOfDayISO)
        .lte('start_time', endOfDayISO);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedMasterId && !!selectedDate && isOpen,
  });

  // Determine available time slots based on master's availability, exceptions, and existing appointments
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !selectedMasterId || isLoadingMasterAvailability || isLoadingMasterExceptions || isLoadingExistingAppointments) {
      return [];
    }

    const slots: Date[] = [];
    const dayOfWeek = getDay(selectedDate); // 0 for Sunday, 1 for Monday...
    const today = startOfDay(new Date());
    const isPastDate = isBefore(selectedDate, today);

    // Check for exceptions first
    const exception = masterExceptions?.find(e => format(parseISO(e.exception_date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'));

    let startHour = 10;
    let endHour = 16; // Default working hours

    if (exception) {
      if (!exception.is_available) {
        return []; // Master is explicitly unavailable
      }
      // If available via exception, use exception's specific times if provided
      if (exception.start_time && exception.end_time) {
        startHour = parseInt(exception.start_time.split(':')[0]);
        endHour = parseInt(exception.end_time.split(':')[0]);
      }
    } else {
      // Check recurring availability if no exception
      const recurringAvailability = masterAvailability?.find(a => a.day_of_week === dayOfWeek);
      if (!recurringAvailability || isWeekend(selectedDate)) {
        return []; // No recurring availability or it's a weekend
      }
      startHour = parseInt(recurringAvailability.start_time.split(':')[0]);
      endHour = parseInt(recurringAvailability.end_time.split(':')[0]);
    }

    let currentTime = setHours(setMinutes(selectedDate, 0), startHour);

    while (isBefore(currentTime, setHours(setMinutes(selectedDate, 0), endHour))) {
      slots.push(currentTime);
      currentTime = addMinutes(currentTime, 60); // 60-minute intervals
    }

    // Filter out already booked slots
    const booked = new Set<string>();
    existingAppointments?.forEach(app => {
      const appStartTime = parseISO(app.start_time);
      booked.add(format(appStartTime, 'HH:mm'));
    });

    return slots.filter(slot => {
      const slotTime = format(slot, 'HH:mm');
      const isBooked = booked.has(slotTime);
      const isPastSlot = isBefore(slot, new Date());
      return !isBooked && !isPastSlot;
    });
  }, [selectedDate, selectedMasterId, masterAvailability, masterExceptions, existingAppointments, isLoadingMasterAvailability, isLoadingMasterExceptions, isLoadingExistingAppointments]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedClientId(undefined);
      setSelectedMasterId(undefined);
      setSelectedDate(undefined);
      setSelectedTimeSlot(null);
      setStatus('pending');
      setNotes('');
    } else {
      // Set default master if only one exists
      if (masterProfiles && masterProfiles.length === 1) {
        setSelectedMasterId(masterProfiles[0].id);
      }
    }
  }, [isOpen, masterProfiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedMasterId || !selectedDate || !selectedTimeSlot) {
      toast.error('Por favor, preencha todos os campos obrigatórios (Cliente, Master, Data e Horário).');
      return;
    }

    const startTime = selectedTimeSlot;
    const endTime = addMinutes(selectedTimeSlot, 60); // Assuming 60-minute appointments

    // Check for overlapping appointments (double-check before saving)
    const isOverlapping = existingAppointments?.some(app => {
      const existingStart = parseISO(app.start_time);
      const existingEnd = parseISO(app.end_time);
      return (
        (isBefore(startTime, existingEnd) && isBefore(existingStart, endTime)) ||
        (isSameHour(startTime, existingStart) && isSameMinute(startTime, existingStart))
      );
    });

    if (isOverlapping) {
      toast.error('Já existe um agendamento para este Master neste dia e horário.');
      return;
    }

    await onSave({
      client_id: selectedClientId,
      master_id: selectedMasterId,
      start_time: startTime,
      end_time: endTime,
      status,
      notes,
    });
  };

  const isLoadingData = isLoadingClientProfiles || isLoadingMasterProfiles || isLoadingMasterAvailability || isLoadingMasterExceptions || isLoadingExistingAppointments;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <PlusCircle className="w-6 h-6" /> Adicionar Agendamento
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Preencha os detalhes para criar um novo agendamento.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="client-select">Cliente *</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId} disabled={isLoadingData}>
              <SelectTrigger id="client-select" className="w-full bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione o Cliente" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                {isLoadingClientProfiles ? (
                  <SelectItem value="loading" disabled>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Carregando clientes...
                  </SelectItem>
                ) : (
                  clientProfiles?.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {client.first_name} {client.last_name} ({client.email})
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Master */}
          <div className="space-y-2">
            <Label htmlFor="master-select">Master *</Label>
            <Select value={selectedMasterId} onValueChange={setSelectedMasterId} disabled={isLoadingData}>
              <SelectTrigger id="master-select" className="w-full bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione o Master" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                {isLoadingMasterProfiles ? (
                  <SelectItem value="loading" disabled>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Carregando masters...
                  </SelectItem>
                ) : (
                  masterProfiles?.map(master => (
                    <SelectItem key={master.id} value={master.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {master.first_name} {master.last_name} ({master.email})
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Calendário */}
          <div className="space-y-2 md:col-span-2">
            <Label>Data *</Label>
            <Card className="bg-background border-border shadow-none">
              <CardContent className="p-0 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  locale={ptBR}
                  className="rounded-md border bg-background text-foreground"
                  disabled={(date) => isWeekend(date) || isBefore(date, startOfDay(new Date()))}
                />
              </CardContent>
            </Card>
          </div>

          {/* Horários Disponíveis */}
          <div className="space-y-2 md:col-span-2">
            <Label>Horário *</Label>
            <ScrollArea className="h-40 w-full rounded-md border border-border p-4 bg-background">
              {isLoadingData ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando horários...
                </div>
              ) : !selectedMasterId || !selectedDate ? (
                <p className="text-muted-foreground text-center py-4">Selecione um Master e uma Data para ver os horários.</p>
              ) : availableTimeSlots.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhum horário disponível para este dia.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {availableTimeSlots.map(slot => {
                    const slotTime = format(slot, 'HH:mm');
                    const isSelected = selectedTimeSlot && isSameHour(selectedTimeSlot, slot) && isSameMinute(selectedTimeSlot, slot);

                    return (
                      <motion.button
                        key={slotTime}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTimeSlot(slot)}
                        type="button"
                        className={`flex items-center justify-center p-3 rounded-lg border transition-all duration-200
                          ${isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-md'
                            : 'bg-muted/20 border-border text-foreground hover:bg-muted/40'
                          }`}
                      >
                        <span className="font-medium">{slotTime}</span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status-select">Status *</Label>
            <Select value={status} onValueChange={(value: 'pending' | 'confirmed' | 'cancelled' | 'completed') => setStatus(value)} disabled={isSaving}>
              <SelectTrigger id="status-select" className="w-full bg-background border-border text-foreground">
                <SelectValue placeholder="Selecione o Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notas */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-background border-border text-foreground"
              rows={3}
              disabled={isSaving}
            />
          </div>

          <DialogFooter className="md:col-span-2 mt-6">
            <Button variant="outline" onClick={onClose} disabled={isSaving} className="bg-background border-border text-foreground hover:bg-muted">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving || !selectedClientId || !selectedMasterId || !selectedDate || !selectedTimeSlot} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Adicionar Agendamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAppointmentDialog;