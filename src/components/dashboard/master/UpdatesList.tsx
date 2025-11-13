import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDot } from 'lucide-react';

interface UpdateItem {
  id: string;
  type: 'Confirmação de Usuário' | 'Avaliação Contínua' | 'Promoção';
  text: string;
  time: string;
}

const updates: UpdateItem[] = [
  { id: '1', type: 'Confirmação de Usuário', text: "Esta noite é a noite. E vai acontecer de novo e de novo. Tem que acontecer. Estou pensando em dois palhaços de circo dançando. Esta noite é a noite.", time: '7 meses atrás' },
  { id: '2', type: 'Avaliação Contínua', text: "Tem que acontecer. Estou pensando em dois palhaços de circo dançando. Esta noite é a noite.", time: '7 meses atrás' },
  { id: '3', type: 'Promoção', text: "Tem que acontecer. Estou pensando em dois palhaços de circo dançando. Esta noite é a noite.", time: '7 meses atrás' },
];

const getTypeColor = (type: UpdateItem['type']) => {
  switch (type) {
    case 'Confirmação de Usuário': return 'text-green-500';
    case 'Avaliação Contínua': return 'text-blue-500';
    case 'Promoção': return 'text-yellow-500';
    default: return 'text-muted-foreground';
  }
};

export default function UpdatesList() {
  return (
    <Card className="bg-card border-border shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Atualizações</CardTitle>
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