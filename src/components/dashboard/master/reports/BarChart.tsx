import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface BarChartProps {
  title: string;
  data: { label: string; value: number }[];
  barColor: string;
  unit?: string;
  isLoading: boolean;
}

const BarChart: React.FC<BarChartProps> = ({ title, data, barColor, unit = '', isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-card border-border shadow-lg rounded-xl col-span-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" /> Carregando gráfico...
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="bg-card border-border shadow-lg rounded-xl col-span-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center py-8">
          Nenhum dado disponível para o gráfico.
        </CardContent>
      </Card>
    );
  }

  const values = data.map(d => d.value);
  const labels = data.map(d => d.label);

  const maxValue = Math.max(...values, 0); // Ensure max value is at least 0 for scaling
  const scaleY = (value: number) => (value / maxValue) * 100;

  const barWidth = 80 / data.length; // Adjust width based on number of bars
  const barSpacing = 20 / data.length; // Adjust spacing

  return (
    <Card className="bg-card border-border shadow-lg rounded-xl col-span-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60 w-full relative">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            {/* Grid lines */}
            <line x1="0" y1="100" x2="100" y2="100" stroke="#334155" strokeWidth="0.5" /> {/* Bottom */}
            <line x1="0" y1="50" x2="100" y2="50" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" /> {/* Middle */}
            <line x1="0" y1="0" x2="100" y2="0" stroke="#334155" strokeWidth="0.5" /> {/* Top */}

            {/* Bars */}
            {data.map((d, index) => {
              const x = (index * (barWidth + barSpacing)) + (barSpacing / 2);
              const barHeight = scaleY(d.value);
              return (
                <rect
                  key={index}
                  x={x}
                  y={100 - barHeight}
                  width={barWidth}
                  height={barHeight}
                  fill={barColor}
                />
              );
            })}
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground mt-1 px-2">
            {labels.map((label, index) => (
              <span key={index} className="w-1/12 text-center">{label}</span>
            ))}
          </div>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Mês atual: <span className="font-semibold text-foreground">{data[data.length - 1]?.value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {unit}</span></p>
          <p>Mês anterior: <span className="font-semibold text-foreground">{data[data.length - 2]?.value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {unit}</span></p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarChart;