import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
  description: string;
  chartData: number[]; // Simple array for a placeholder chart
  chartColor: string;
}

export default function StatCard({ title, value, change, changeType, description, chartData, chartColor }: StatCardProps) {
  const ChangeIcon = changeType === 'up' ? TrendingUp : TrendingDown;
  const changeColor = changeType === 'up' ? 'text-green-500' : 'text-red-500';

  return (
    <Card className="bg-card border-border shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <div className="text-3xl font-bold text-foreground">{value}</div>
          <div className={`flex items-center text-sm font-semibold ${changeColor}`}>
            <ChangeIcon className="w-4 h-4 mr-1" />
            {change}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {/* Simple SVG chart placeholder */}
        <div className="mt-4 h-16 w-full">
          <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full">
            <polyline
              fill="none"
              stroke={chartColor}
              strokeWidth="2"
              points={chartData.map((d, i) => `${(i / (chartData.length - 1)) * 100},${50 - d}`).join(' ')}
            />
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}