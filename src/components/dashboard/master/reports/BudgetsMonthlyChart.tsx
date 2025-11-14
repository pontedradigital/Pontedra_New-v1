import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, FileText, CheckCircle, XCircle, Hourglass, DollarSign } from 'lucide-react';
import LineChart from './LineChart';
import BarChart from './BarChart'; // Importar BarChart
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Budget {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  created_at: string;
}

interface BudgetsMonthlyChartProps {
  selectedDate: Date;
  chartType: 'line' | 'bar'; // Nova prop
}

export default function BudgetsMonthlyChart({ selectedDate, chartType }: BudgetsMonthlyChartProps) {
  const twelveMonthsAgo = subMonths(selectedDate, 11);
  const startOfTwelveMonthsAgo = startOfMonth(twelveMonthsAgo);
  const endOfSelectedMonth = endOfMonth(selectedDate);

  // Fetch all budgets created within the last 12 months relative to selectedDate
  const { data: historicalBudgets, isLoading: isLoadingHistoricalBudgets } = useQuery<Budget[], Error>({
    queryKey: ['budgetsMonthlyChart', startOfTwelveMonthsAgo.toISOString(), endOfSelectedMonth.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('id, status, created_at')
        .gte('created_at', startOfTwelveMonthsAgo.toISOString())
        .lte('created_at', endOfSelectedMonth.toISOString());
      if (error) throw error;
      return data;
    },
  });

  const isLoading = isLoadingHistoricalBudgets;

  const chartData = useMemo(() => {
    const dataMap = new Map<string, { total: number; pending: number; approved: number; rejected: number; converted: number }>();
    
    // Initialize map for last 12 months
    for (let i = 0; i < 12; i++) {
      const monthDate = subMonths(selectedDate, 11 - i);
      const monthYearKey = format(monthDate, 'MMM', { locale: ptBR });
      dataMap.set(monthYearKey, { total: 0, pending: 0, approved: 0, rejected: 0, converted: 0 });
    }

    historicalBudgets?.forEach(budget => {
      const monthYearKey = format(new Date(budget.created_at), 'MMM', { locale: ptBR });
      if (dataMap.has(monthYearKey)) {
        const current = dataMap.get(monthYearKey)!;
        current.total++;
        if (budget.status === 'pending') current.pending++;
        if (budget.status === 'approved') current.approved++;
        if (budget.status === 'rejected') current.rejected++;
        if (budget.status === 'converted') current.converted++;
      }
    });

    const labels = Array.from(dataMap.keys());
    const totalData = Array.from(dataMap.values()).map(d => d.total);
    const pendingData = Array.from(dataMap.values()).map(d => d.pending);
    const approvedData = Array.from(dataMap.values()).map(d => d.approved);
    const rejectedData = Array.from(dataMap.values()).map(d => d.rejected);
    const convertedData = Array.from(dataMap.values()).map(d => d.converted);

    return { labels, totalData, pendingData, approvedData, rejectedData, convertedData };
  }, [historicalBudgets, selectedDate]);

  const ChartComponent = chartType === 'line' ? LineChart : BarChart;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartComponent
        title="Total de Orçamentos por Mês"
        data={chartData.labels.map((label, index) => ({ label, value: chartData.totalData[index] }))}
        lineColor="#57e389"
        barColor="#57e389"
        unit="orçamentos"
        isLoading={isLoading}
      />
      <ChartComponent
        title="Orçamentos Pendentes por Mês"
        data={chartData.labels.map((label, index) => ({ label, value: chartData.pendingData[index] }))}
        lineColor="#ffc107" // Yellow for pending
        barColor="#ffc107"
        unit="orçamentos"
        isLoading={isLoading}
      />
      <ChartComponent
        title="Orçamentos Aprovados por Mês"
        data={chartData.labels.map((label, index) => ({ label, value: chartData.approvedData[index] }))}
        lineColor="#00b4ff"
        barColor="#00b4ff"
        unit="orçamentos"
        isLoading={isLoading}
      />
      <ChartComponent
        title="Orçamentos Convertidos por Mês"
        data={chartData.labels.map((label, index) => ({ label, value: chartData.convertedData[index] }))}
        lineColor="#6f42c1" // Purple for converted
        barColor="#6f42c1"
        unit="orçamentos"
        isLoading={isLoading}
      />
      <ChartComponent
        title="Orçamentos Rejeitados por Mês"
        data={chartData.labels.map((label, index) => ({ label, value: chartData.rejectedData[index] }))}
        lineColor="#dc3545" // Red for rejected
        barColor="#dc3545"
        unit="orçamentos"
        isLoading={isLoading}
      />
    </div>
  );
}