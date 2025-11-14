import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportCardProps {
  title: string;
  value: string | number;
  previousMonthValue: string | number;
  unit?: string; // e.g., "clientes", "projetos", "%"
  icon?: React.ElementType;
  isLoading?: boolean;
}

export default function ReportCard({ title, value, previousMonthValue, unit = '', icon: Icon, isLoading }: ReportCardProps) {
  const currentValueNum = typeof value === 'string' ? parseFloat(value.replace(/[^0-9,-]+/g, "").replace(",", ".")) : value;
  const previousValueNum = typeof previousMonthValue === 'string' ? parseFloat(previousMonthValue.replace(/[^0-9,-]+/g, "").replace(",", ".")) : previousMonthValue;

  let changePercentage = 0;
  let changeType: 'up' | 'down' | 'neutral' = 'neutral';

  if (!isLoading && typeof currentValueNum === 'number' && typeof previousValueNum === 'number') {
    if (previousValueNum !== 0) {
      changePercentage = ((currentValueNum - previousValueNum) / previousValueNum) * 100;
    } else if (currentValueNum > 0) {
      changePercentage = 100; // Infinite growth from zero
    } else if (currentValueNum < 0) {
      changePercentage = -100; // Infinite decrease from zero
    }
    changeType = changePercentage > 0 ? 'up' : changePercentage < 0 ? 'down' : 'neutral';
  }

  const ChangeIcon = changeType === 'up' ? TrendingUp : changeType === 'down' ? TrendingDown : Minus;
  const changeColor = changeType === 'up' ? 'text-green-500' : changeType === 'down' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card className="bg-card border-border shadow-lg rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-10 flex items-center">
            <div className="w-24 h-6 bg-muted/50 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="text-2xl font-bold text-foreground">
            {typeof value === 'number' ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value} {unit}
          </div>
        )}
        {isLoading ? (
          <div className="h-5 w-20 bg-muted/30 rounded mt-1 animate-pulse"></div>
        ) : (
          <p className={cn("text-xs mt-1 flex items-center gap-1", changeColor)}>
            <ChangeIcon className="h-3 w-3" />
            {changeType === 'neutral' ? 'Sem alteração' : `${changePercentage.toFixed(2)}% vs. mês anterior`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}