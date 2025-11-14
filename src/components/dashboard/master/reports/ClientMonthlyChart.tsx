import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, Users } from 'lucide-react';
import LineChart from './LineChart';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Profile {
  id: string;
  role: 'prospect' | 'client' | 'master';
  created_at: string;
}

interface ClientMonthlyChartProps {
  selectedDate: Date;
}

export default function ClientMonthlyChart({ selectedDate }: ClientMonthlyChartProps) {
  const twelveMonthsAgo = subMonths(selectedDate, 11);
  const startOfTwelveMonthsAgo = startOfMonth(twelveMonthsAgo);
  const endOfSelectedMonth = endOfMonth(selectedDate);

  // Fetch all profiles created within the last 12 months relative to selectedDate
  const { data: historicalProfiles, isLoading: isLoadingHistoricalProfiles } = useQuery<Profile[], Error>({
    queryKey: ['clientMonthlyChart', startOfTwelveMonthsAgo.toISOString(), endOfSelectedMonth.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, created_at')
        .in('role', ['client', 'prospect'])
        .gte('created_at', startOfTwelveMonthsAgo.toISOString())
        .lte('created_at', endOfSelectedMonth.toISOString());
      if (error) throw error;
      return data;
    },
  });

  const isLoading = isLoadingHistoricalProfiles;

  const chartData = useMemo(() => {
    const dataMap = new Map<string, { clients: number; prospects: number }>();
    
    // Initialize map for last 12 months
    for (let i = 0; i < 12; i++) {
      const monthDate = subMonths(selectedDate, 11 - i);
      const monthYearKey = format(monthDate, 'MMM', { locale: ptBR });
      dataMap.set(monthYearKey, { clients: 0, prospects: 0 });
    }

    historicalProfiles?.forEach(profile => {
      const monthYearKey = format(new Date(profile.created_at), 'MMM', { locale: ptBR });
      if (dataMap.has(monthYearKey)) {
        const current = dataMap.get(monthYearKey)!;
        if (profile.role === 'client') {
          current.clients++;
        } else if (profile.role === 'prospect') {
          current.prospects++;
        }
      }
    });

    const labels = Array.from(dataMap.keys());
    const clientsData = Array.from(dataMap.values()).map(d => d.clients);
    const prospectsData = Array.from(dataMap.values()).map(d => d.prospects);

    return { labels, clientsData, prospectsData };
  }, [historicalProfiles, selectedDate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <LineChart
        title="Novos Clientes por Mês"
        data={chartData.labels.map((label, index) => ({ label, value: chartData.clientsData[index] }))}
        lineColor="#57e389"
        unit="clientes"
        isLoading={isLoading}
      />
      <LineChart
        title="Novos Prospects por Mês"
        data={chartData.labels.map((label, index) => ({ label, value: chartData.prospectsData[index] }))}
        lineColor="#00b4ff"
        unit="prospects"
        isLoading={isLoading}
      />
    </div>
  );
}