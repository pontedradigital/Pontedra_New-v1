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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Clock, CalendarDays, CheckCircle, XCircle } from 'lucide-react';
import { format, parseISO, setHours, setMinutes, isBefore, isSameHour, isSameMinute, addMinutes, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

interface TimeSlotSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | undefined;
  masterId: string;
  onAppointmentConfirm: (startTime: Date, endTime: Date) => void;
}

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
}

const TimeSlotSelectionDialog: React.FC<TimeSlotSelectionDialogProps> = ({
  isOpen,
  onClose,
  selectedDate,
  masterId,
  onAppointmentConfirm,
}) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<Date | null>(null);

  // Fetch existing appointments for the selected date and master
  const { data: existingAppointments, isLoading: isLoadingAppointments } = useQuery<Appointment[], Error>({
    queryKey: ['existingAppointments', selectedDate?.toISOString(), masterId],
    queryFn: async () => {
      if (!selectedDate || !masterId) return [];
      const startOfDayISO = startOfDay(selectedDate).toISOString();
      const endOfDayISO = setHours(setMinutes(startOfDay(selectedDate), 59), 23).toISOString(); // End of day

      const { data, error } = await supabase
        .from('appointments')
        .select('id, start_time, end_time')
        .eq('master_id', masterId)
        .gte('start_time', startOfDayISO)
        .lte('start_time', endOfDayISO); // Filter appointments for the selected day
      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!selectedDate && !!masterId,
  });

  // Generate available time slots (10:00 to 16:00, 60-minute intervals)
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const slots: Date[] = [];
    let currentTime = setHours(setMinutes(selectedDate, 0), 10); // Start at 10:00

    while (isBefore(currentTime, setHours(setMinutes(selectedDate, 0), 16))) { // End before 16:00
      slots.push(currentTime);
      currentTime = addMinutes(currentTime, 60); // 60-minute intervals
    }
    return slots;
  }, [selectedDate]);

  // Determine which slots are booked
  const bookedSlots = useMemo(() => {
    if (!existingAppointments) return new Set<string>();
    const booked = new Set<string>();
    existingAppointments.forEach(app => {
      const appStartTime = parseISO(app.start_time);
      booked.add(format(appStartTime, 'HH:mm'));
    });
    return booked;
  }, [existingAppointments]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedTimeSlot(null); // Reset selected slot when dialog closes
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedTimeSlot) {
      const startTime = selectedTimeSlot;
      const endTime = addMinutes(selectedTimeSlot, 60); // Assuming 60-minute appointments
      onAppointmentConfirm(startTime, endTime);
      onClose();
    }
  };

  if (!selectedDate) {
    return null; // Should not happen if dialog is opened correctly
  }

  const formattedDate = format(selectedDate, 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: ptBR });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Clock className="w-6 h-6" /> Selecionar Horário
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Escolha um horário disponível para o agendamento em <span className="font-semibold text-white">{formattedDate}</span>.
          </DialogDescription>
        </DialogHeader>

        {isLoadingAppointments ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" /> Carregando horários...
          </div>
        ) : (
          <ScrollArea className="h-60 w-full rounded-md border border-border p-4 bg-background">
            <div className="grid grid-cols-2 gap-3">
              {timeSlots.map(slot => {
                const slotTime = format(slot, 'HH:mm');
                const isBooked = bookedSlots.has(slotTime);
                const isSelected = selectedTimeSlot && isSameHour(selectedTimeSlot, slot) && isSameMinute(selectedTimeSlot, slot);
                const isPastSlot = isBefore(slot, new Date());

                return (
                  <motion.button
                    key={slotTime}
                    whileHover={{ scale: !isBooked && !isPastSlot ? 1.05 : 1 }}
                    whileTap={{ scale: !isBooked && !isPastSlot ? 0.95 : 1 }}
                    onClick={() => !isBooked && !isPastSlot && setSelectedTimeSlot(slot)}
                    disabled={isBooked || isPastSlot}
                    className={`flex items-center justify-center p-3 rounded-lg border transition-all duration-200
                      ${isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : isBooked || isPastSlot
                          ? 'bg-muted/10 border-border/50 text-muted-foreground cursor-not-allowed opacity-60'
                          : 'bg-muted/20 border-border text-foreground hover:bg-muted/40'
                      }`}
                  >
                    <span className="font-medium">{slotTime}</span>
                    <div className="ml-2">
                      {isBooked || isPastSlot ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
            {timeSlots.length === 0 && (
              <p className="text-muted-foreground text-center py-4">Nenhum horário disponível para este dia.</p>
            )}
          </ScrollArea>
        )}

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="bg-background border-border text-foreground hover:bg-muted">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedTimeSlot || isLoadingAppointments} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isLoadingAppointments ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Confirmar Agendamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimeSlotSelectionDialog;