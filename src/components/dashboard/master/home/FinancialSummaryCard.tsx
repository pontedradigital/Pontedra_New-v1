import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign, TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface BudgetAmount {
  total_amount: number;
}

interface CostAmount {
  value_brl: number;
}

interface VariableCostAmount {
  value: number;
}

export default function FinancialSummaryCard() {
  const currentMonth = new Date();
  const currentMonthStart = startOfMonth(currentMonth);
  const currentMonthEnd = endOfMonth(currentMonth);

  // Fetch revenue (converted budgets) for current month
  const { data: currentMonthRevenue, isLoading: isLoadingCurrentMonthRevenue } = useQuery<BudgetAmount[], Error>({
    queryKey: ['financialSummary', 'currentMonthRevenue', currentMonthStart.toISOString()],
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

  // Fetch fixed costs (active)
  const { data: fixedCosts, isLoading: isLoadingFixedCosts } = useQuery<CostAmount[], Error>({
    queryKey: ['financialSummary', 'fixedCosts'],
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
  const { data: variableCosts, isLoading: isLoadingVariableCosts } = useQuery<VariableCostAmount[], Error>({
    queryKey: ['financialSummary', 'currentMonthVariableCosts', currentMonthStart.toISOString()],
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

  const isLoading = isLoadingCurrentMonthRevenue || isLoadingFixedCosts || isLoadingVariableCosts;

  const financialData = useMemo(() => {
    const revenue = currentMonthRevenue?.reduce((sum, b) => sum + b.total_amount, 0) || 0;
    const fixedCostsTotal = fixedCosts?.reduce((sum, c) => sum + c.value_brl, 0) || 0;
    const variableCostsTotal = variableCosts?.reduce((sum, vc) => sum + vc.value, 0) || 0;
    const totalCosts = fixedCostsTotal + variableCostsTotal;
    const profit = revenue - totalCosts;
    return { revenue, fixedCosts: fixedCostsTotal, variableCosts: variableCostsTotal, totalCosts, profit };
  }, [currentMonthRevenue, fixedCosts, variableCosts]);

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-500';
    if (profit < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border shadow-lg rounded-xl col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" /> Resumo Financeiro ({format(currentMonth, 'MMMM/yyyy', { locale: ptBR })})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" /> Carregando dados financeiros...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-lg rounded-xl col-span-full lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" /> Resumo Financeiro ({format(currentMonth, 'MMMM/yyyy', { locale: ptBR })})
        </CardTitle>
        <Link to="/dashboard/financial/overview">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            Ver Detalhes <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-green-500" /> Receita
          </div>
          <span className="font-bold text-green-500">R$ {financialData.revenue.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="w-4 h-4 text-blue-500" /> Custos Fixos
          </div>
          <span className="font-bold text-blue-500">R$ {financialData.fixedCosts.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <PiggyBank className="w-4 h-4 text-yellow-500" /> Custos Variáveis
          </div>
          <span className="font-bold text-yellow-500">R$ {financialData.variableCosts.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <DollarSign className="w-5 h-5" /> Lucro Líquido
          </div>
          <span className={`text-xl font-bold ${getProfitColor(financialData.profit)}`}>
            R$ {financialData.profit.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}