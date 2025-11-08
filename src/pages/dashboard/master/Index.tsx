import React, { useState, useEffect } from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, Briefcase, CalendarDays, Bot, LayoutDashboard, Lightbulb, TrendingUp, Tag, DollarSign, MessageSquare, UserPlus, CalendarPlus, BarChart, MessageCircle, Newspaper, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MOCK_CHART_DATA, MOCK_AI_SUGGESTIONS, MOCK_RECENT_ACTIVITIES } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const MasterDashboardPage = () => {
  const [currentAISuggestionIndex, setCurrentAISuggestionIndex] = useState(0);
  const [recentActivities, setRecentActivities] = useState(MOCK_RECENT_ACTIVITIES.slice(0, 4)); // Display a few recent ones

  useEffect(() => {
    const aiInterval = setInterval(() => {
      setCurrentAISuggestionIndex((prevIndex) =>
        (prevIndex + 1) % MOCK_AI_SUGGESTIONS.length
      );
    }, 15000); // Change AI suggestion every 15 seconds

    const activityInterval = setInterval(() => {
      // Simulate new activity
      const newActivityIndex = Math.floor(Math.random() * MOCK_RECENT_ACTIVITIES.length);
      const newActivity = {
        ...MOCK_RECENT_ACTIVITIES[newActivityIndex],
        id: `act${Date.now()}`, // Ensure unique ID
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setRecentActivities((prev) => [newActivity, ...prev].slice(0, 4)); // Keep last 4 activities
    }, 30000); // Add new activity every 30 seconds

    return () => {
      clearInterval(aiInterval);
      clearInterval(activityInterval);
    };
  }, []);

  const handleGenerateNewAISuggestion = () => {
    setCurrentAISuggestionIndex((prevIndex) =>
      (prevIndex + 1) % MOCK_AI_SUGGESTIONS.length
    );
  };

  const currentSuggestion = MOCK_AI_SUGGESTIONS[currentAISuggestionIndex];

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ElementType } = {
      Lightbulb, TrendingUp, Tag, DollarSign, MessageSquare, UserPlus, CalendarPlus, BarChart, MessageCircle, Briefcase, Newspaper
    };
    return icons[iconName] || Lightbulb;
  };

  return (
    <MasterDashboardLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Dashboard Master</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">1,234</div>
              <p className="text-xs text-muted-foreground">+20.1% do mês passado</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Serviços Ativos</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">78</div>
              <p className="text-xs text-muted-foreground">+15% do mês passado</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Agendamentos Hoje</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">12</div>
              <p className="text-xs text-muted-foreground">+5% da semana passada</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Integrações IA</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">3</div>
              <p className="text-xs text-muted-foreground">Novas funcionalidades em breve!</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        {/* IA Insights e Planejamento Inteligente */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className="lg:col-span-2">
          <Card className="bg-card border-border shadow-lg rounded-2xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" /> IA Insights e Planejamento Inteligente
              </CardTitle>
              <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-muted" onClick={handleGenerateNewAISuggestion}>
                <RefreshCcw className="h-4 w-4 mr-2" /> Nova Análise
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <CardDescription className="text-muted-foreground mb-4">
                Análises e recomendações automáticas geradas pela IA Pontedra com base no desempenho geral do sistema.
              </CardDescription>
              <motion.div
                key={currentSuggestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-start gap-3 p-4 bg-background border border-border rounded-lg"
              >
                {React.createElement(getIconComponent(currentSuggestion.icon), { className: "h-6 w-6 text-primary flex-shrink-0 mt-1" })}
                <div>
                  <p className="text-sm font-semibold text-foreground">{currentSuggestion.category}:</p>
                  <p className="text-sm text-muted-foreground">{currentSuggestion.message}</p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Atividades Recentes */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }} className="lg:col-span-1">
          <Card className="bg-card border-border shadow-lg rounded-2xl h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-muted-foreground" /> Atividades Recentes
              </CardTitle>
              <CardDescription className="text-muted-foreground">Eventos recentes no sistema.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const ActivityIcon = getIconComponent(activity.icon);
                  return (
                    <Link to={activity.link} key={activity.id} className="block">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-3 p-3 bg-background border border-border rounded-md hover:bg-muted transition-colors cursor-pointer"
                      >
                        <ActivityIcon className={cn("h-5 w-5 flex-shrink-0", activity.iconColor)} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mt-6">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.7 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl h-full">
            <CardHeader>
              <CardTitle className="text-foreground">Volume Mensal de Agendamentos</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={MOCK_CHART_DATA.monthlyAppointments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.8 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl h-full">
            <CardHeader>
              <CardTitle className="text-foreground">Popularidade dos Serviços</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_CHART_DATA.servicePopularity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border shadow-sm bg-card mt-6"
      >
        <div className="flex flex-col items-center gap-1 text-center p-4">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            Bem-vindo ao Painel Master!
          </h3>
          <p className="text-sm text-muted-foreground">
            Gerencie usuários, serviços e agendamentos.
          </p>
        </div>
      </motion.div>
    </MasterDashboardLayout>
  );
};

export default MasterDashboardPage;