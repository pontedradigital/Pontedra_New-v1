import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DistributionItem {
  label: string;
  percentage: number;
  color: string; // Tailwind color class, e.g., 'red', 'blue', 'orange'
}

const distributionData: DistributionItem[] = [
  { label: 'Texas', percentage: 70, color: 'red' },
  { label: 'Utah', percentage: 15, color: 'blue' },
  { label: 'Georgia', percentage: 15, color: 'orange' },
];

export default function DistributionChart() {
  const totalPercentage = distributionData.reduce((sum, item) => sum + item.percentage, 0);
  let currentAngle = 0;

  return (
    <Card className="bg-card border-border shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40 mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {distributionData.map((item, index) => {
                const startAngle = currentAngle;
                const endAngle = currentAngle + (item.percentage / totalPercentage) * 360;
                currentAngle = endAngle;

                const largeArcFlag = item.percentage / totalPercentage > 0.5 ? 1 : 0;

                const startX = 50 + 50 * Math.cos(startAngle * Math.PI / 180);
                const startY = 50 + 50 * Math.sin(startAngle * Math.PI / 180);
                const endX = 50 + 50 * Math.cos(endAngle * Math.PI / 180);
                const endY = 50 + 50 * Math.sin(endAngle * Math.PI / 180);

                const d = [
                  `M 50,50`,
                  `L ${startX},${startY}`,
                  `A 50,50 0 ${largeArcFlag} 1 ${endX},${endY}`,
                  `Z`
                ].join(' ');

                return (
                  <path key={index} d={d} fill={`var(--${item.color}-500)`} />
                );
              })}
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-foreground">
              {distributionData[0].percentage}%
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {distributionData.map((item, index) => (
              <div key={index} className="flex items-center text-sm text-muted-foreground">
                <span className={`w-3 h-3 rounded-full mr-2 bg-${item.color}-500`}></span>
                {item.label}
              </div>
            ))}
          </div>
          <a href="#" className="mt-6 text-primary hover:underline text-sm">View More</a>
        </div>
      </CardContent>
    </Card>
  );
}