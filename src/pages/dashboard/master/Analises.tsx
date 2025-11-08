import React, { useState, useEffect } from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, Lightbulb, TrendingUp, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const generateRandomPercentage = () => (Math.random() * 30 - 10).toFixed(1); // -10% to +20%
const generateRandomValue = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const AnalisesPage = () => {
  const [analysisData, setAnalysisData] = useState({
    appointmentVolumeChange: generateRandomPercentage(),
    peakHours: ["14h e 18h", "10h e 12h", "16h e 20h"][generateRandomValue(0, 2)],
    communicationChannelRecommendation: ["Instagram Direct", "WhatsApp Business", "Messenger"][generateRandomValue(0, 2)],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setAnalysisData({
        appointmentVolumeChange: generateRandomPercentage(),
        peakHours: ["14h e 18h", "10h e 12h", "16h e 20h"][generateRandomValue(0, 2)],
        communicationChannelRecommendation: ["Instagram Direct", "WhatsApp Business", "Messenger"][generateRandomValue(0, 2)],
      });
    }, 7000); // Update every 7 seconds

    return () => clearInterval(interval);
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <MasterDashboardLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Relatórios e Sugestões IA</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volume de Agendamentos</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analysisData.appointmentVolumeChange}%
                <span className={parseFloat(analysisData.appointmentVolumeChange) >= 0 ? "text-green-500 ml-2" : "text-red-500 ml-2"}>
                  {parseFloat(analysisData.appointmentVolumeChange) >= 0 ? "↑" : "↓"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">em relação à semana passada</p>
              <p className="text-sm mt-2">
                O volume de atendimentos {parseFloat(analysisData.appointmentVolumeChange) >= 0 ? "aumentou" : "diminuiu"} em {Math.abs(parseFloat(analysisData.appointmentVolumeChange))}% esta semana.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horários de Pico</CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysisData.peakHours}</div>
              <p className="text-xs text-muted-foreground">Períodos mais procurados</p>
              <p className="text-sm mt-2">
                Clientes preferem agendar entre {analysisData.peakHours}. Considere otimizar sua equipe nesses horários.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sugestão de Comunicação</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{analysisData.communicationChannelRecommendation}</div>
              <p className="text-xs text-muted-foreground">Canal recomendado para engajamento</p>
              <p className="text-sm mt-2">
                Recomenda-se reforçar a comunicação no {analysisData.communicationChannelRecommendation} para maior engajamento com seus clientes.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-6">
        <div className="flex flex-col items-center gap-1 text-center p-4">
          <h3 className="text-2xl font-bold tracking-tight">
            Relatórios Inteligentes
          </h3>
          <p className="text-sm text-muted-foreground">
            Insights e sugestões para otimizar seu negócio.
          </p>
        </div>
      </div>
    </MasterDashboardLayout>
  );
};

export default AnalisesPage;