import React, { useState, useEffect } from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Clock, Briefcase, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { MOCK_CLIENT_APPOINTMENTS, MOCK_CLIENT_SERVICES } from "@/data/mockData";

const generateRandomValue = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const AIInsightsPage = () => {
  const [insights, setInsights] = useState({
    mostBusyTime: "14:00 - 16:00",
    mostBookedService: "Corte de Cabelo Masculino",
    activeClients: generateRandomValue(50, 200),
    avgResponseTime: generateRandomValue(5, 30), // in minutes
  });

  useEffect(() => {
    // Simulate data fetching/generation
    const interval = setInterval(() => {
      setInsights({
        mostBusyTime: ["10:00 - 12:00", "14:00 - 16:00", "17:00 - 19:00"][generateRandomValue(0, 2)],
        mostBookedService: MOCK_CLIENT_SERVICES[generateRandomValue(0, MOCK_CLIENT_SERVICES.length - 1)].name,
        activeClients: generateRandomValue(50, 200),
        avgResponseTime: generateRandomValue(5, 30),
      });
    }, 5000); // Update every 5 seconds for simulation

    return () => clearInterval(interval);
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <MasterDashboardLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">IA Insights</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horário Mais Movimentado</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.mostBusyTime}</div>
              <p className="text-xs text-muted-foreground">Baseado em agendamentos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviço Mais Agendado</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{insights.mostBookedService}</div>
              <p className="text-xs text-muted-foreground">Popularidade entre clientes</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos (Mês)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.activeClients}</div>
              <p className="text-xs text-muted-foreground">Interações recentes</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio de Resposta</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.avgResponseTime} min</div>
              <p className="text-xs text-muted-foreground">No chat e canais</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card className="mt-6">
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
    </MasterDashboardLayout>
  );
};

export default AIInsightsPage;