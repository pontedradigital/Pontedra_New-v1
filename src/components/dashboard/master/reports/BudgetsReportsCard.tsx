import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, FileText, CheckCircle, XCircle, Hourglass, DollarSign } from 'lucide-react';
import ReportCard from './ReportCard';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface BudgetCount {
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  count: number;
}

interface BudgetsReportsCardProps {
  selectedDate: Date;
}

export default function BudgetsReportsCard({ selectedDate }: BudgetsReportsCardProps) {
  const currentMonthStart = startOfMonth(selectedDate);
  const currentMonthEnd = endOfMonth(selectedDate);
  const previousMonthStart = startOfMonth(subMonths(selectedDate, 1));
  const previousMonthEnd = endOfMonth(subMonths(selectedDate, 1));

  // Fetch budget counts by status for current month
  const { data: currentMonthBudgets, isLoading: isLoadingCurrentMonthBudgets } = useQuery<BudgetCount[], Error>({
    queryKey: ['budgetsReports', 'currentMonth', currentMonthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('status, count')
        .gte('created_at', currentMonthStart.toISOString())
        .lte('created_at', currentMonthEnd.toISOString());
      if (error) throw error;
      return data;
    },
  });

  // Fetch budget counts by status for previous month
  const { data: previousMonthBudgets, isLoading: isLoadingPreviousMonthBudgets } = useQuery<BudgetCount[], Error>({
    queryKey: ['budgetsReports', 'previousMonth', previousMonthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('status, count')
        .gte('created_at', previousMonthStart.toISOString())
        .lte('created_at', previousMonthEnd.toISOString());
      if (error) throw error;
      return data;
    },
  });

  const isLoading = isLoadingCurrentMonthBudgets || isLoadingPreviousMonthBudgets;

  const currentMonthData = useMemo(() => {
    const total = currentMonthBudgets?.reduce((sum, b) => sum + b.count, 0) || 0;
    const pending = currentMonthBudgets?.find(b => b.status === 'pending')?.count || 0;
    const approved = currentMonthBudgets?.find(b => b.status === 'approved')?.count || 0;
    const rejected = currentMonthBudgets?.find(b => b.status === 'rejected')?.count || 0;
    const converted = currentMonthBudgets?.find(b => b.status === 'converted')?.count || 0;
    return { total, pending, approved, rejected, converted };
  }, [currentMonthBudgets]);

  const previousMonthData = useMemo(() => {
    const total = previousMonthBudgets?.reduce((sum, b) => sum + b.count, 0) || 0;
    const pending = previousMonthBudgets?.find(b => b.status === 'pending')?.count || 0;
    const approved = previousMonthBudgets?.find(b => b.status === 'approved')?.count || 0;
    const rejected = previousMonthBudgets?.find(b => b.status === 'rejected')?.count || 0;
    const converted = previousMonthBudgets?.find(b => b.status === 'converted')?.count || 0;
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