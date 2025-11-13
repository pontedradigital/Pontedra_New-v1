import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const salesData = [
  { month: 'Jan', value: 15000 },
  { month: 'Feb', value: 22000 },
  { month: 'Mar', value: 10000 },
  { month: 'Apr', value: 28000 },
  { month: 'May', value: 35000 },
  { month: 'Jun', value: 30000 },
];

const maxSale = Math.max(...salesData.map(d => d.value));

export default function SaleReportChart() {
  return (
    <Card className="bg-card border-border shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Sale Report</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia id beatae sint dolorum quae at minima atque quaerat.
        </p>
        <div className="h-48 w-full relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground pr-2">
            <span>${maxSale / 1000}k</span>
            <span>${maxSale / 2 / 1000}k</span>
            <span>$0</span>
          </div>
          {/* Chart area */}
          <div className="absolute left-8 right-0 bottom-0 h-full flex items-end justify-around">
            {salesData.map((data, index) => (
              <div key={index} className="flex flex-col items-center h-full justify-end w-1/6 px-1">
                <div
                  className="w-full bg-primary rounded-t-sm transition-all duration-500 ease-out"
                  style={{ height: `${(data.value / maxSale) * 100}%` }}
                ></div>
                <span className="text-xs text-muted-foreground mt-2">{data.month}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}