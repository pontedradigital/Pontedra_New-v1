import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, DollarSign, TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import ReportCard from './ReportCard';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface BudgetAmount {
  total_amount: number;
}

interface CostAmount {
  value_brl: number;
}

interface VariableCostAmount {
  value: number;
}

interface FinancialReportsCardProps {
  selectedDate: Date;
}

export default function FinancialReportsCard({ selectedDate }: FinancialReportsCardProps) {
  const currentMonthStart = startOfMonth(selectedDate);
  const currentMonthEnd = endOfMonth(selectedDate);
  const previousMonthStart = startOfMonth(subMonths(selectedDate, 1));
  const previousMonthEnd = endOfMonth(subMonths(selectedDate, 1));

  // Fetch revenue (converted budgets) for current month
  const { data: currentMonthRevenue, isLoading: isLoadingCurrentMonthRevenue } = useQuery<BudgetAmount[], Error>({
    queryKey: ['financialReports', 'currentMonthRevenue', currentMonthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('total_amount')
        .eq('status', 'converted')
        .gte('created_at', currentMonthStart.toISOString())
        .lte('created_at', currentMonthEnd.toISOString());
      if (error) throw error;
      return data;
    },
  });

  // Fetch revenue (converted budgets) for previous month
  const { data: previousMonthRevenue, isLoading: isLoadingPreviousMonthRevenue } = useQuery<BudgetAmount[], Error>({
    queryKey: ['financialReports', 'previousMonthRevenue', previousMonthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('total_amount')
        .eq('status', 'converted')
        .gte('created_at', previousMonthStart.toISOString())
        .lte('created_at', previousMonthEnd.toISOString());
      if (error) throw error;
      return data;
    },
  });

  // Fetch fixed costs (active) - these are generally constant, but we'll query for the month for consistency
  const { data: currentMonthFixedCosts, isLoading: isLoadingCurrentMonthFixedCosts } = useQuery<CostAmount[], Error>({
    queryKey: ['financialReports', 'currentMonthFixedCosts'], // Fixed costs are not date-dependent in their definition
    queryFn: async () => {
      const { data, error } = await supabase
        .from('costs')
        .select('value_brl')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const { data: previousMonthFixedCosts, isLoading: isLoadingPreviousMonthFixedCosts } = useQuery<CostAmount[], Error>({
    queryKey: ['financialReports', 'previousMonthFixedCosts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('costs')
        .select('value_brl')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  // Fetch variable costs (active, for current month)
  const { data: currentMonthVariableCosts, isLoading: isLoadingCurrentMonthVariableCosts } = useQuery<VariableCostAmount[], Error>({
    queryKey: ['financialReports', 'currentMonthVariableCosts', currentMonthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('variable_costs')
        .select('value')
        .eq('is_active', true)
        .gte('date', currentMonthStart.toISOString())
        .lte('date', currentMonthEnd.toISOString());
      if (error) throw error;
      return data;
    },
  });

  // Fetch variable costs (active, for previous month)
  const { data: previousMonthVariableCosts, isLoading: isLoadingPreviousMonthVariableCosts } = useQuery<VariableCostAmount[], Error>({
    queryKey: ['financialReports', 'previousMonthVariableCosts', previousMonthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('variable_costs')
        .select('value')
        .eq('is_active', true)
        .gte('date', previousMonthStart.toISOString())
        .lte('date', previousMonthEnd.toISOString());
      if (error) throw error;
      return data;
    },
  });

  const isLoading = isLoadingCurrentMonthRevenue || isLoadingPreviousMonthRevenue ||
                    isLoadingCurrentMonthFixedCosts || isLoadingPreviousMonthFixedCosts ||
                    isLoadingCurrentMonthVariableCosts || isLoadingPreviousMonthVariableCosts;

  const currentMonthData = useMemo(() => {
    const revenue = currentMonthRevenue?.reduce((sum, b) => sum + b.total_amount, 0) || 0;
    const fixedCosts = currentMonthFixedCosts?.reduce((sum, c) => sum + c.value_brl, 0) || 0;
    const variableCosts = currentMonthVariableCosts?.reduce((sum, vc) => sum + vc.value, 0) || 0;
    const totalCosts = fixedCosts + variableCosts;
    const profit = revenue - totalCosts;
    return { revenue, fixedCosts, variableCosts, totalCosts, profit };
  }, [currentMonthRevenue, currentMonthFixedCosts, currentMonthVariableCosts]);

  const previousMonthData = useMemo(() => {
    const revenue = previousMonthRevenue?.reduce((sum, b) => sum + b.total_amount, 0) || 0;
    const fixedCosts = previousMonthFixedCosts?.reduce((sum, c) => sum + c.value_brl, 0) || 0;
    const variableCosts = previousMonthVariableCosts?.reduce((sum, vc) => sum + vc.value, 0) || 0;
    const totalCosts = fixedCosts + variableCosts;
    const profit = revenue - totalCosts;
    return { revenue, fixedCosts, variableCosts, totalCosts, profit };
  }, [previousMonthRevenue, previousMonthFixedCosts, previousMonthVariableCosts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ReportCard
        title="Receita Total"
        value={currentMonthData.revenue}
        previousMonthValue={previousMonthData.revenue}
        unit="R$"
        icon={DollarSign}
        isLoading={isLoading}
      />
      <ReportCard
        title="Custos Fixos"
        value={currentMonthData.fixedCosts}
        previousMonthValue={previousMonthData.fixedCosts}
        unit="R$"
        icon={Wallet}
        isLoading={isLoading}
      />
      <ReportCard
        title="Custos Variáveis"
        value={currentMonthData.variableCosts}
        previousMonthValue={previousMonthData.variableCosts}
        unit="R$"
        icon={PiggyBank}
        isLoading={isLoading}
      />
      <ReportCard
        title="Custos Totais"
        value={currentMonthData.totalCosts}
        previousMonthValue={previousMonthData.totalCosts}
        unit="R$"
        icon={TrendingUp} // Can be adjusted to a more cost-related icon
        isLoading={isLoading}
      />
      <ReportCard
        title="Lucro Líquido"
        value={currentMonthData.profit}
        previousMonthValue={previousMonthData.profit}
        unit="R$"
        icon={TrendingUp}
        isLoading={isLoading}
      />
    </div>
  );
}