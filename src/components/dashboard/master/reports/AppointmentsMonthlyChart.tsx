import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, CalendarCheck, CalendarX, CalendarClock } from 'lucide-react';
import LineChart from './LineChart';
import BarChart from './BarChart'; // Importar BarChart
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  start_time: string;
}

interface AppointmentsMonthlyChartProps {
  selectedDate: Date;
  chartType: 'line' | 'bar'; // Nova prop
}

export default function AppointmentsMonthlyChart({ selectedDate, chartType }: AppointmentsMonthlyChartProps) {
  const twelveMonthsAgo = subMonths(selectedDate, 11);
  const startOfTwelveMonthsAgo = startOfMonth(twelveMonthsAgo);
  const endOfSelectedMonth = endOfMonth(selectedDate);

  // Fetch all appointments within the last 12 months relative to selectedDate
  const { data: historicalAppointments, isLoading: isLoadingHistoricalAppointments } = useQuery<Appointment[], Error>({
    queryKey: ['appointmentsMonthlyChart', startOfTwelveMonthsAgo.toISOString(), endOfSelectedMonth.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, status, start_time')
        .gte('start_time', startOfTwelveMonthsAgo.toISOString())
        .lte('start_time', endOfSelectedMonth.toISOString());
      if (error) throw error;
      return data;
    },
  });

  const isLoading = isLoadingHistoricalAppointments;

  const chartData = useMemo(() => {
    const dataMap = new Map<string, { total: number; confirmed: number; cancelled: number; completed: number; pending: number }>();
    
    // Initialize map for last 12 months
    for (let i = 0; i < 12; i++) {
      const monthDate = subMonths(selectedDate, 11 - i);
      const monthYearKey = format(monthDate, 'MMM', { locale: ptBR });
      dataMap.set(monthYearKey, { total: 0, confirmed: 0, cancelled: 0, completed: 0, pending: 0 });
    }

    historicalAppointments?.forEach(app => {
      const monthYearKey = format(new Date(app.start_time), 'MMM', { locale: ptBR });
      if (dataMap.has(monthYearKey)) {
        const current = dataMap.get(monthYearKey)!;
        current.total++;
        if (app.status === 'confirmed') current.confirmed++;
        if (app.status === 'cancelled') current.cancelled++;
        if (app.status === 'completed') current.completed++;
        if (app.status === 'pending') current.pending++;
      }
    });

    const labels = Array.from(dataMap.keys());
    const totalData = Array.from(dataMap.values()).map(d => d.total);
    const confirmedData = Array.from(dataMap.values()).map(d => d.confirmed);
    const cancelledData = Array.from(dataMap.values()).map(d => d.cancelled);
    const completedData = Array.from(dataMap.values()).map(d => d.completed);
    const pendingData = Array.from(dataMap.values()).map(d => d.pending);

    return { labels, totalData, confirmedData, cancelledData, completedData, pendingData };
  }, [historicalAppointments, selectedDate]);

  const ChartComponent = chartType === 'line' ? LineChart : BarChart;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartComponent
        title="Total de Agendamentos por Mês"
        data={chartData.labels.map((label, index) => ({ label, value: chartData.totalData[index] }))}
        lineColor="#57e389"
        barColor="#57e389"
        unit="agendamentos"
        isLoading={isLoading}
      />
      <ChartComponent
        title="Agendamentos Confirmados por Mês"
        data={chartData.labels.map((label, index) => ({ label, value: chartData.confirmedData[index] }))}
        lineColor="#00b4ff"
        barColor="#00b4ff"
        unit="agendamentos"
        isLoading={isLoading}
      />
      <ChartComponent
        title="Agendamentos Pendentes por Mês"
        data={chartData.labels.map((label, index) => ({ label, value: chartData.pendingData[index] }))}
        lineColor="#ffc107" // Yellow for pending
        barColor="#ffc107"
        unit="agendamentos"
        isLoading={isLoading}
      />
      <ChartComponent
        title="Agendamentos Concluídos por Mês"
        data={chartData.labels.map((label, index) => ({ label, value: chartData.completedData[index] }))}
        lineColor="#6f42c1" // Purple for completed
        barColor="#6f42c1"
        unit="agendamentos"
        isLoading={isLoading}
      />
      <ChartComponent
        title="Agendamentos Cancelados por Mês"
        data={chartData.labels.map((label, index) => ({ label, value: chartData.cancelledData[index] }))}
        lineColor="#dc3545" // Red for cancelled
        barColor="#dc3545"
        unit="agendamentos"
        isLoading={isLoading}
      />
    </div>
  );
}