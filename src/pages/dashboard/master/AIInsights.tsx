import React, { useState, useEffect } => "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Importar Button
import { Bot, Clock, Briefcase, Users, TrendingUp, RefreshCcw } from "lucide-react"; // Adicionar RefreshCcw
import { motion } from "framer-motion";
import { useMockData } from "@/context/MockContext"; // Importar useMockData

const generateRandomValue = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const AIInsightsPage = () => {
  const { aiInsights, generateNewAIInsights, isLoading } = useMockData();
  const [localInsights, setLocalInsights] = useState({
    mostBusyTime: "14:00 - 16:00",
    mostBookedService: "Corte de Cabelo Masculino",
    activeClients: generateRandomValue(50, 200),
    avgResponseTime: generateRandomValue(5, 30), // in minutes
  });

  // Update local insights based on mockData's AI insights or random values
  useEffect(() => {
    // This effect will run once on mount and whenever aiInsights from context changes
    // For the purpose of displaying the main metrics, we can keep them somewhat static or update them less frequently
    // The 'generateNewAIInsights' button will specifically update the list of AI insights.
    setLocalInsights({
      mostBusyTime: ["10:00 - 12:00", "14:00 - 16:00", "17:00 - 19:00"][generateRandomValue(0, 2)],
      mostBookedService: aiInsights[generateRandomValue(0, aiInsights.length - 1)]?.title || "Serviço Mais Agendado",
      activeClients: generateRandomValue(50, 200),
      avgResponseTime: generateRandomValue(5, 30),
    });
  }, [aiInsights]); // Depend on aiInsights from context

  const handleGenerateInsights = async () => {
    await generateNewAIInsights();
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <MasterDashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Assistente Pontedra Insights</h1>
        <Button size="sm" className="bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20 uppercase" onClick={handleGenerateInsights} disabled={isLoading}>
          <RefreshCcw className="h-4 w-4 mr-2" /> {isLoading ? "Gerando..." : "Atualizar Insights"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Horário Mais Movimentado</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{localInsights.mostBusyTime}</div>
              <p className="text-xs text-muted-foreground">Baseado em agendamentos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Serviço Mais Agendado</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-foreground">{localInsights.mostBookedService}</div>
              <p className="text-xs text-muted-foreground">Popularidade entre clientes</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Clientes Ativos (Mês)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{localInsights.activeClients}</div>
              <p className="text-xs text-muted-foreground">Interações recentes</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Tempo Médio de Resposta</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{localInsights.avgResponseTime} min</div>
              <p className="text-xs text-muted-foreground">No chat e canais</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-6"
      >
        <Card className="bg-card border-border shadow-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Visão Geral da Assistente Pontedra</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Aqui o Master receberá sugestões automáticas de desempenho, engajamento e oportunidades com base nos dados de agendamento e interação.
            </p>
            <div className="border border-border rounded-lg p-4 bg-background">
              <h4 className="font-semibold mb-2 text-foreground">Relatório da Assistente Pontedra (Simulado)</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {aiInsights.map((insight) => (
                  <li key={insight.id}>
                    <strong>{insight.title}:</strong> {insight.description}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </MasterDashboardLayout>
  );
};

export default AIInsightsPage;