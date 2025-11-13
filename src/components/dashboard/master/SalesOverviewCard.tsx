import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SalesOverviewCard() {
  return (
    <Card className="bg-card border-border shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Visão Geral do Relatório de Vendas</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Informações de vendas sobre publicidade, exposições, pesquisa de mercado, mídia online, desejos do cliente, RP e muito mais
        </p>
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div>
            <p className="text-xs text-muted-foreground">Downloads</p>
            <p className="text-lg font-bold text-foreground">13,956</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Compras</p>
            <p className="text-lg font-bold text-foreground">55,123</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Usuários</p>
            <p className="text-lg font-bold text-foreground">29,829</p>
          </div>
        </div>
        <p className="text-xs text-green-500 mb-6">↑ 15% a mais que na semana passada</p>
        <div className="flex gap-2">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md">Atualizar</Button>
          <Button variant="outline" className="bg-background border-border text-foreground hover:bg-muted rounded-md">Mais</Button>
        </div>
      </CardContent>
    </Card>
  );
}