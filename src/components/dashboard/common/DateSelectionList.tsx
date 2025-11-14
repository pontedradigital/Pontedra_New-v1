import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, isWeekend, isSameDay, isBefore, startOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, CalendarDays, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MasterAvailability {
  day_of_week: number; // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  start_time: string; // e.g., "10:00:00"
  end_time:   string;   // e.g., "16:00:00"
}

interface MasterException {
  exception_date: string; // YYYY-MM-DD
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
}

interface Appointment {
  id: string;
  start_time: string; // Apenas o start_time é necessário para verificar a data
}

interface DateSelectionListProps {
  masterId: string;
  onDateSelect: (date: Date) => void;
  selectedDate: Date | undefined;
  isMasterBooking?: boolean;
  allAppointments: Appointment[]; // NOVA PROPRIEDADE: Todos os agendamentos
}

const DateSelectionList: React.FC<DateSelectionListProps> = ({ masterId, onDateSelect, selectedDate, isMasterBooking = false, allAppointments }) => {
  const [dates, setDates] = useState<Date[]>([]);

  // Fetch master's recurring availability
  const { data: availability, isLoading: isLoadingAvailability } = useQuery<MasterAvailability[], Error>({
    queryKey: ['masterAvailability', masterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_availability')
        .select('*')
        .eq('master_id', masterId);
      if (error) throw error;
      return data;
    },
    enabled: !!masterId,
  });

  // Fetch master's exceptions
  const { data: exceptions, isLoading: isLoadingExceptions } = useQuery<MasterException[], Error>({
    queryKey: ['masterExceptions', masterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_exceptions')
        .select('*')
        .eq('master_id', masterId)
        .gte('exception_date', format(new Date(), 'yyyy-MM-dd')); // Only future exceptions
      if (error) throw error;
      return data;
    },
    enabled: !!masterId,
  });

  // Generate next 30 days (or more if master booking)
  useEffect(() => {
    const today = startOfDay(new Date());
    const generatedDates: Date[] = [];
    const daysToGenerate = isMasterBooking ? 90 : 30; // Master pode ver mais dias
    for (let i = 0; i < daysToGenerate; i++) {
      generatedDates.push(addDays(today, i));
    }
    setDates(generatedDates);
  }, [isMasterBooking]);

  // Memoize dates with appointments for quick lookup
  const datesWithAppointments = useMemo(() => {
    const datesSet = new Set<string>();
    allAppointments.forEach(app => {
      datesSet.add(format(parseISO(app.start_time), 'yyyy-MM-dd'));
    });
    return datesSet;
  }, [allAppointments]);

  // Determine available dates based on availability and exceptions
  const availableDates = useMemo(() => {
    if (!availability || !exceptions) return [];

    const bookableDates: Date[] = [];
    const today = startOfDay(new Date());

    dates.forEach(date => {
      // Se for master booking, fins de semana são permitidos. Caso contrário, pula fins de semana.
      if (!isMasterBooking && isWeekend(date)) return;

      // 2. Check for specific exceptions for this date
      const dateString = format(date, 'yyyy-MM-dd');
      const exception = exceptions.find(e => e.exception_date === dateString);

      if (exception) {
        if (exception.is_available) {
          // Se há uma exceção tornando-o disponível, adiciona
          bookableDates.push(date);
        }
        return; // Exceção sobrescreve a disponibilidade geral
      }

      // 3. Check general recurring availability
      const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday...
      const hasGeneralAvailability = availability.some(
        a => a.day_of_week === dayOfWeek && a.start_time === "10:00:00" && a.end_time === "16:00:00"
      );

      if (hasGeneralAvailability) {
        bookableDates.push(date);
      }
    });

    return bookableDates;
  }, [dates, availability, exceptions, isMasterBooking]);

  if (isLoadingAvailability || isLoadingExceptions) {
    return (
      <Card className="bg-card border-border shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" /> Selecione uma Data
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" /> Carregando datas disponíveis...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" /> Selecione uma Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-60 w-full rounded-md border border-border p-4 bg-background">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {dates.map(date => {
              const isAvailableForMaster = availableDates.some(d => isSameDay(d, date));
              const isPastDate = isBefore(date, startOfDay(new Date()));
              const isSelected = selectedDate && isSameDay(selectedDate, date);
              const hasAppointment = datesWithAppointments.has(format(date, 'yyyy-MM-dd')); // Check for appointments

              // A data é desabilitada se:
              // 1. Não é master booking E não está disponível (considerando fins de semana e exceções)
              // 2. Não é master booking E é uma data passada
              const isDisabled = (!isAvailableForMaster && !isMasterBooking) || (isPastDate && !isMasterBooking);

              return (
                <motion.button
                  key={format(date, 'yyyy-MM-dd')}
                  whileHover={{ scale: !isDisabled ? 1.05 : 1 }}
                  whileTap={{ scale: !isDisabled ? 0.95 : 1 }}
                  onClick={() => !isDisabled && onDateSelect(date)}
                  disabled={isDisabled}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-200
                    ${isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : hasAppointment // Apply different style if there's an appointment
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300 hover:bg-blue-500/30'
                        : !isDisabled
                          ? 'bg-muted/20 border-border text-foreground hover:bg-muted/40'
                          : 'bg-muted/10 border-border/50 text-muted-foreground cursor-not-allowed opacity-60'
                    }`}
                >
                  <span className="text-sm font-medium mb-1">
                    {format(date, 'EEE', { locale: ptBR }).toUpperCase()}
                  </span>
                  <span className="text-2xl font-bold">
                    {format(date, 'dd')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {format(date, 'MMM', { locale: ptBR })}
                  </span>
                  <div className="mt-2">
                    {isDisabled && !isMasterBooking ? ( // Mostra X apenas se desabilitado para cliente
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DateSelectionList;