import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, Briefcase, CheckCircle, PlayCircle } from 'lucide-react';
import LineChart from './LineChart';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClientContract {
  id: string;
  contract_type: 'monthly' | 'one-time';
  start_date: string;
  end_date: string | null;
  created_at: string;
}

interface ProjectsMonthlyChartProps {
  selectedDate: Date;
}

export default function ProjectsMonthlyChart({ selectedDate }: ProjectsMonthlyChartProps) {
  const twelveMonthsAgo = subMonths(selectedDate, 11);
  const startOfTwelveMonthsAgo = startOfMonth(twelveMonthsAgo);
  const endOfSelectedMonth = endOfMonth(selectedDate);

  // Fetch all contracts within the last 12 months relative to selectedDate
  const { data: historicalContracts, isLoading: isLoadingHistoricalContracts } = useQuery<ClientContract[], Error>({
    queryKey: ['projectsMonthlyChart', startOfTwelveMonthsAgo.toISOString(), endOfSelectedMonth.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_contracts')
        .select('id, contract_type, start_date, end_date, created_at')
        .gte('created_at', startOfTwelveMonthsAgo.toISOString())
        .lte('created_at', endOfSelectedMonth.toISOString());
      if (error) throw error;
      return data;
    },
  });

  const isLoading = isLoadingHistoricalContracts;

  const chartData = useMemo(() => {
    const dataMap = new Map<string, { total: number; newProjects: number; active: number; completed: number }>();
    
    // Initialize map for last 12 months
    for (let i = 0; i < 12; i++) {
      const monthDate = subMonths(selectedDate, 11 - i);
      const monthYearKey = format(monthDate, 'MMM', { locale: ptBR });
      dataMap.set(monthYearKey, { total: 0, newProjects: 0, active: 0, completed: 0 });
    }

    historicalContracts?.forEach(contract => {
      const createdMonthYearKey = format(new Date(contract.created_at), 'MMM', { locale: ptBR });
      
      // Count new projects for the month they were created
      if (dataMap.has(createdMonthYearKey)) {
        dataMap.get(createdMonthYearKey)!.newProjects++;
      }

      // For total, active, and completed, we need to consider all contracts up to each month
      // This requires iterating through each month in the 12-month range
      for (let i = 0; i < 12; i++) {
        const monthDate = subMonths(selectedDate, 11 - i);
        const monthYearKey = format(monthDate, 'MMM', { locale: ptBR });
        const currentMonthData = dataMap.get(monthYearKey)!;

        // Only count contracts that started before or in this month
        if (isPast(parseISO(contract.start_date)) || format(parseISO(contract.start_date), 'MMM') === monthYearKey) {
          currentMonthData.total++;

          if (contract.contract_type === 'monthly') {
            currentMonthData.active++;
          } else { // 'one-time'
            if (contract.end_date && isPast(parseISO(contract.end_date))) {
              currentMonthData.completed++;
            } else {
              currentMonthData.active++;
            }
          }
        }
      }
    });

    const labels = Array.from(dataMap.keys());
    const totalData = Array.from(dataMap.values()).map(d => d.total);
    const newProjectsData = Array.from(dataMap.values()).map(d => d.newProjects);
    const activeData = Array.from(dataMap.values()).map(d => d.active);
    const completedData = Array.from(dataMap.values()).map(d => d.completed);

    return { labels, totalData, newProjectsData, activeData, completedData };
  }, [historicalContracts, selectedDate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <LineChart
        title="Total de Projetos por Mês"
        data={chartData.labels.map((label, index) => ({ label, value: chartData.totalData[index] }))}
        lineColor="#57e389"
        unit="projetos"
        isLoading={isLoading}
      />
      <LineChart
        title="Novos Projetos por Mês"
        data={chartData.labels.map((label, index) => ({ label, value: chartData.newProjectsData[index] }))}
        lineColor="#00b4ff"
        unit="projetos"
        isLoading={isLoading}
      />
      <LineChart
        title="Projetos Ativos por Mês"
        data={chartData.labels.map((label, index) => ({ label, value: chartData.activeData[index] }))}
        lineColor="#ffc107" // Yellow for active
        unit="projetos"
        isLoading={isLoading}
      />
      <LineChart
        title="Projetos Concluídos por Mês"
        data={chartData.labels.map((label, index) => ({ label, value: chartData.completedData[index] }))}
        lineColor="#dc3545" // Red for completed
        unit="projetos"
        isLoading={isLoading}
      />
    </div>
  );
}