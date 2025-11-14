import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, FileText, CheckCircle, XCircle, Hourglass, DollarSign } from 'lucide-react';
import ReportCard from './ReportCard';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface Budget {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  created_at: string;
}

interface BudgetsReportsCardProps {
  selectedDate: Date;
}

export default function BudgetsReportsCard({ selectedDate }: BudgetsReportsCardProps) {
  const currentMonthStart = startOfMonth(selectedDate);
  const currentMonthEnd = endOfMonth(selectedDate);
  const previousMonthStart = startOfMonth(subMonths(selectedDate, 1));
  const previousMonthEnd = endOfMonth(subMonths(selectedDate, 1));

  // Fetch all budgets for current month
  const { data: currentMonthBudgets, isLoading: isLoadingCurrentMonthBudgets } = useQuery<Budget[], Error>({
    queryKey: ['budgetsReports', 'currentMonth', currentMonthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('id, status, created_at')
        .gte('created_at', currentMonthStart.toISOString())
        .lte('created_at', currentMonthEnd.toISOString());
      if (error) throw error;
      return data;
    },
  });

  // Fetch all budgets for previous month
  const { data: previousMonthBudgets, isLoading: isLoadingPreviousMonthBudgets } = useQuery<Budget[], Error>({
    queryKey: ['budgetsReports', 'previousMonth', previousMonthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('id, status, created_at')
        .gte('created_at', previousMonthStart.toISOString())
        .lte('created_at', previousMonthEnd.toISOString());
      if (error) throw error;
      return data;
    },
  });

  const isLoading = isLoadingCurrentMonthBudgets || isLoadingPreviousMonthBudgets;

  const currentMonthData = useMemo(() => {
    const total = currentMonthBudgets?.length || 0;
    const pending = currentMonthBudgets?.filter(b => b.status === 'pending').length || 0;
    const approved = currentMonthBudgets?.filter(b => b.status === 'approved').length || 0;
    const rejected = currentMonthBudgets?.filter(b => b.status === 'rejected').length || 0;
    const converted = currentMonthBudgets?.filter(b => b.status === 'converted').length || 0;
    return { total, pending, approved, rejected, converted };
  }, [currentMonthBudgets]);

  const previousMonthData = useMemo(() => {
    const total = previousMonthBudgets?.length || 0;
    const pending = previousMonthBudgets?.filter(b => b.status === 'pending').length || 0;
    const approved = previousMonthBudgets?.filter(b => b.status === 'approved').length || 0;
    const rejected = previousMonthBudgets?.filter(b => b.status === 'rejected').length || 0;
    const converted = previousMonthBudgets?.filter(b => b.status === 'converted').length || 0;
    return { total, pending, approved, rejected, converted };
  }, [previousMonthBudgets]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ReportCard
        title="Total de Orçamentos"
        value={currentMonthData.total}
        previousMonthValue={previousMonthData.total}
        unit="orçamentos"
        icon={FileText}
        isLoading={isLoading}
      />
      <ReportCard
        title="Orçamentos Pendentes"
        value={currentMonthData.pending}
        previousMonthValue={previousMonthData.pending}
        unit="orçamentos"
        icon={Hourglass}
        isLoading={isLoading}
      />
      <ReportCard
        title="Orçamentos Aprovados"
        value={currentMonthData.approved}
        previousMonthValue={previousMonthData.approved}
        unit="orçamentos"
        icon={CheckCircle}
        isLoading={isLoading}
      />
      <ReportCard
        title="Orçamentos Convertidos"
        value={currentMonthData.converted}
        previousMonthValue={previousMonthData.converted}
        unit="orçamentos"
        icon={DollarSign}
        isLoading={isLoading}
      />
      <ReportCard
        title="Orçamentos Rejeitados"
        value={currentMonthData.rejected}
        previousMonthValue={previousMonthData.rejected}
        unit="orçamentos"
        icon={XCircle}
        isLoading={isLoading}
      />
    </div>
  );
}