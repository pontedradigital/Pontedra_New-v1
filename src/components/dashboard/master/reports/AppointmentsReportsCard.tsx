import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, CalendarCheck, CalendarX, CalendarClock, CalendarPlus, Calendar } from 'lucide-react';
import ReportCard from './ReportCard';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface Appointment {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  start_time: string;
}

interface AppointmentsReportsCardProps {
  selectedDate: Date;
}

export default function AppointmentsReportsCard({ selectedDate }: AppointmentsReportsCardProps) {
  const currentMonthStart = startOfMonth(selectedDate);
  const currentMonthEnd = endOfMonth(selectedDate);
  const previousMonthStart = startOfMonth(subMonths(selectedDate, 1));
  const previousMonthEnd = endOfMonth(subMonths(selectedDate, 1));

  // Fetch all appointments for current month
  const { data: currentMonthAppointments, isLoading: isLoadingCurrentMonthAppointments } = useQuery<Appointment[], Error>({
    queryKey: ['appointmentsReports', 'currentMonth', currentMonthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, status, start_time')
        .gte('start_time', currentMonthStart.toISOString())
        .lte('start_time', currentMonthEnd.toISOString());
      if (error) throw error;
      return data;
    },
  });

  // Fetch all appointments for previous month
  const { data: previousMonthAppointments, isLoading: isLoadingPreviousMonthAppointments } = useQuery<Appointment[], Error>({
    queryKey: ['appointmentsReports', 'previousMonth', previousMonthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, status, start_time')
        .gte('start_time', previousMonthStart.toISOString())
        .lte('start_time', previousMonthEnd.toISOString());
      if (error) throw error;
      return data;
    },
  });

  const isLoading = isLoadingCurrentMonthAppointments || isLoadingPreviousMonthAppointments;

  const currentMonthData = useMemo(() => {
    const total = currentMonthAppointments?.length || 0;
    const confirmed = currentMonthAppointments?.filter(app => app.status === 'confirmed').length || 0;
    const pending = currentMonthAppointments?.filter(app => app.status === 'pending').length || 0;
    const cancelled = currentMonthAppointments?.filter(app => app.status === 'cancelled').length || 0;
    const completed = currentMonthAppointments?.filter(app => app.status === 'completed').length || 0;
    return { total, confirmed, pending, cancelled, completed };
  }, [currentMonthAppointments]);

  const previousMonthData = useMemo(() => {
    const total = previousMonthAppointments?.length || 0;
    const confirmed = previousMonthAppointments?.filter(app => app.status === 'confirmed').length || 0;
    const pending = previousMonthAppointments?.filter(app => app.status === 'pending').length || 0;
    const cancelled = previousMonthAppointments?.filter(app => app.status === 'cancelled').length || 0;
    const completed = previousMonthAppointments?.filter(app => app.status === 'completed').length || 0;
    return { total, confirmed, pending, cancelled, completed };
  }, [previousMonthAppointments]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ReportCard
        title="Total de Agendamentos"
        value={currentMonthData.total}
        previousMonthValue={previousMonthData.total}
        unit="agendamentos"
        icon={Calendar}
        isLoading={isLoading}
      />
      <ReportCard
        title="Agendamentos Confirmados"
        value={currentMonthData.confirmed}
        previousMonthValue={previousMonthData.confirmed}
        unit="agendamentos"
        icon={CalendarCheck}
        isLoading={isLoading}
      />
      <ReportCard
        title="Agendamentos Pendentes"
        value={currentMonthData.pending}
        previousMonthValue={previousMonthData.pending}
        unit="agendamentos"
        icon={CalendarClock}
        isLoading={isLoading}
      />
      <ReportCard
        title="Agendamentos Concluídos"
        value={currentMonthData.completed}
        previousMonthValue={previousMonthData.completed}
        unit="agendamentos"
        icon={CalendarPlus}
        isLoading={isLoading}
      />
      <ReportCard
        title="Agendamentos Cancelados"
        value={currentMonthData.cancelled}
        previousMonthValue={previousMonthData.cancelled}
        unit="agendamentos"
        icon={CalendarX}
        isLoading={isLoading}
      />
    </div>
  );
}