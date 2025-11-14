import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

interface MonthlyDataPoint {
  monthYear: string; // e.g., "Jan 2023"
  revenue: number;
  fixedCosts: number;
  variableCosts: number;
  totalCosts: number;
  profit: number;
}

interface MonthlyFinancialChartsProps {
  data: MonthlyDataPoint[];
  isLoading: boolean;
}

const LineChart: React.FC<{ data: number[]; labels: string[]; color: string; title: string }> = ({ data, labels, color, title }) => {
  if (data.length === 0) return <p className="text-muted-foreground text-center py-4">Sem dados para o gráfico.</p>;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue === 0 ? 1 : maxValue - minValue;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="h-48 w-full relative">
      <h4 className="text-sm font-semibold text-foreground mb-2">{title}</h4>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        <line x1="0" y1="100" x2="100" y2="100" stroke="#334155" strokeWidth="0.5" /> {/* Bottom */}
        <line x1="0" y1="50" x2="100" y2="50" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" /> {/* Middle */}
        <line x1="0" y1="0" x2="100" y2="0" stroke="#334155" strokeWidth="0.5" /> {/* Top */}

        {/* Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground mt-1">
        {labels.map((label, index) => (
          <span key={index} className="w-1/12 text-center">{label.split(' ')[0]}</span>
        ))}
      </div>
    </div>
  );
};

const MonthlyFinancialCharts: React.FC<MonthlyFinancialChartsProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-card border-border shadow-lg rounded-xl col-span-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Evolução Financeira Mensal</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" /> Carregando gráficos...
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="bg-card border-border shadow-lg rounded-xl col-span-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Evolução Financeira Mensal</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center py-8">
          Nenhum dado financeiro disponível para os últimos 12 meses.
        </CardContent>
      </Card>
    );
  }

  const labels = data.map(d => d.monthYear);
  const revenues = data.map(d => d.revenue);
  const totalCosts = data.map(d => d.totalCosts);
  const profits = data.map(d => d.profit);

  // Calculate percentage change for latest month vs previous month for profit
  const latestProfit = profits[profits.length - 1];
  const previousProfit = profits[profits.length - 2];
  let profitChange = 0;
  let profitChangeType: 'up' | 'down' | 'neutral' = 'neutral';

  if (profits.length >= 2) {
    if (previousProfit !== 0) {
      profitChange = ((latestProfit - previousProfit) / previousProfit) * 100;
    } else if (latestProfit > 0) {
      profitChange = 100; // Infinite growth from zero
    } else if (latestProfit < 0) {
      profitChange = -100; // Infinite decrease from zero
    }
    profitChangeType = profitChange > 0 ? 'up' : profitChange < 0 ? 'down' : 'neutral';
  }

  const ChangeIcon = profitChangeType === 'up' ? TrendingUp : TrendingDown;
  const changeColor = profitChangeType === 'up' ? 'text-green-500' : profitChangeType === 'down' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card className="bg-card border-border shadow-lg rounded-xl col-span-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" /> Evolução Financeira Mensal
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Acompanhe a evolução de receita, custos e lucro nos últimos 12 meses.
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="space-y-4">
          <LineChart data={revenues} labels={labels} color="#57e389" title="Receita Total (R$)" />
        </div>

        {/* Total Costs Chart */}
        <div className="space-y-4">
          <LineChart data={totalCosts} labels={labels} color="#00b4ff" title="Custos Totais (R$)" />
        </div>

        {/* Profit Chart */}
        <div className="lg:col-span-2 space-y-4">
          <LineChart data={profits} labels={labels} color="#e35b57" title="Lucro Líquido (R$)" />
          {profits.length >= 2 && (
            <div className="flex items-center justify-end text-sm font-semibold">
              <span className="text-muted-foreground mr-2">Mudança no Lucro (último mês):</span>
              <span className={`flex items-center ${changeColor}`}>
                {profitChangeType !== 'neutral' && <ChangeIcon className="w-4 h-4 mr-1" />}
                {profitChange.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyFinancialCharts;