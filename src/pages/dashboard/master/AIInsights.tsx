import React from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

const AIInsightsPage = () => {
  return (
    <MasterDashboardLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">IA Insights</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Visão Geral da IA</CardTitle>
          <Bot className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Aqui o Master receberá sugestões automáticas de desempenho, engajamento e oportunidades com base nos dados de agendamento e interação.
          </p>
          <div className="border rounded-md p-4 bg-muted/50">
            <h4 className="font-semibold mb-2">Relatório de IA (Simulado)</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              <li>**Sugestão de Otimização:** Clientes que agendam "Corte de Cabelo Masculino" frequentemente também se interessam por "Barba e Bigode". Considere oferecer um pacote combinado.</li>
              <li>**Tendência de Agendamento:** Aumento de 15% nos agendamentos para serviços de "Estética" nas últimas 4 semanas.</li>
              <li>**Engajamento:** Clientes que recebem lembretes via WhatsApp têm uma taxa de comparecimento 20% maior.</li>
              <li>**Oportunidade de Venda:** Identificamos 50 clientes inativos há mais de 3 meses. Sugerimos uma campanha de reengajamento com um desconto especial.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-6">
        <div className="flex flex-col items-center gap-1 text-center p-4">
          <h3 className="text-2xl font-bold tracking-tight">
            Inteligência Artificial a seu Serviço
          </h3>
          <p className="text-sm text-muted-foreground">
            Em breve, insights poderosos para otimizar seu negócio.
          </p>
        </div>
      </div>
    </MasterDashboardLayout>
  );
};

export default AIInsightsPage;