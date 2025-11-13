import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDot } from 'lucide-react';

interface UpdateItem {
  id: string;
  type: 'User confirmation' | 'Continuous evaluation' | 'Promotion';
  text: string;
  time: string;
}

const updates: UpdateItem[] = [
  { id: '1', type: 'User confirmation', text: "Tonight's the night. And it's going to happen again and again. It has to happen. I'm thinking two circus clowns dancing. Tonight's the night.", time: '7 months ago' },
  { id: '2', type: 'Continuous evaluation', text: "It has to happen. I'm thinking two circus clowns dancing. Tonight's the night.", time: '7 months ago' },
  { id: '3', type: 'Promotion', text: "It has to happen. I'm thinking two circus clowns dancing. Tonight's the night.", time: '7 months ago' },
];

const getTypeColor = (type: UpdateItem['type']) => {
  switch (type) {
    case 'User confirmation': return 'text-green-500';
    case 'Continuous evaluation': return 'text-blue-500';
    case 'Promotion': return 'text-yellow-500';
    default: return 'text-muted-foreground';
  }
};

export default function UpdatesList() {
  return (
    <Card className="bg-card border-border shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Updates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {updates.map((update) => (
            <div key={update.id} className="flex items-start">
              <CircleDot className={`w-4 h-4 mt-1 mr-3 ${getTypeColor(update.type)}`} />
              <div>
                <p className="font-medium text-foreground">{update.type}</p>
                <p className="text-sm text-muted-foreground">{update.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{update.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}