import React, { useState, useEffect } from "react";
import ClientDashboardLayout from "@/components/layouts/ClientDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CalendarDays, CheckCircle2, Clock, Lightbulb, Gift, History, BarChart2, Star, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  MOCK_CLIENT_EXPERIENCE_SUMMARY,
  MOCK_CLIENT_APPOINTMENT_HISTORY,
  MOCK_CLIENT_AI_RECOMMENDATIONS,
  MOCK_CLIENT_PROMOTIONS,
  MOCK_CLIENT_30_DAY_STATS,
  Appointment,
} from "@/data/mockData";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const MinhaExperienciaPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(MOCK_CLIENT_EXPERIENCE_SUMMARY);
  const [history, setHistory] = useState(MOCK_CLIENT_APPOINTMENT_HISTORY);
  const [aiRecommendations, setAiRecommendations] = useState(MOCK_CLIENT_AI_RECOMMENDATIONS);
  const [promotions, setPromotions] = useState(MOCK_CLIENT_PROMOTIONS);
  const [stats30Days, setStats30Days] = useState(MOCK_CLIENT_30_DAY_STATS);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAppointmentDetail, setSelectedAppointmentDetail] = useState<any>(null); // Using 'any' for simplicity, ideally a specific type

  useEffect(() => {
    // Simulate updates for summary and stats
    const interval = setInterval(() => {
      setSummary(prev => ({
        ...prev,
        totalAppointments: prev.totalAppointments + Math.floor(Math.random() * 2),
        pendingAppointments: Math.floor(Math.random() * 3),
        lastInteraction: `há ${Math.floor(Math.random() * 7) + 1} dias`,
      }));
      setStats30Days(prev => prev.map(s => ({ ...s, agendamentos: s.agendamentos + Math.floor(Math.random() * 2 - 1) })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleGenerateNewSuggestions = () => {
    const newRecommendations = MOCK_CLIENT_AI_RECOMMENDATIONS.sort(() => 0.5 - Math.random()).slice(0, 3);
    setAiRecommendations(newRecommendations);
    toast.info("Novas sugestões da Assistente Pontedra geradas!");
  };

  const handleViewDetails = (appointment: any) => {
    setSelectedAppointmentDetail(appointment);
    setIsDetailModalOpen(true);
  };

  const handleAproveitarPromocao = (message: string) => {
    navigate("/dashboard/cliente/atendimento-inteligente", { state: { initialMessage: message } });
  };

  return (
    <ClientDashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Minha Experiência</h1>
      </div>

      {/* Resumo de Atividades Recentes */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total de Agendamentos</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{summary.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">Concluídos: {summary.completedAppointments}</p>
              <p className="text-xs text-muted-foreground">Pendentes: {summary.pendingAppointments}</p>
              <p className="text-xs text-muted-foreground mt-2">Última interação: {summary.lastInteraction}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card className="bg-card border-border shadow-lg rounded-2xl h-full">
            <CardHeader>
              <CardTitle className="text-foreground">Agendamentos nos Últimos 30 Dias</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats30Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="agendamentos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Histórico Detalhado e Assistente Pontedra — Recomendações e Insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card className="bg-card border-border shadow-lg rounded-2xl h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" /> Histórico de Serviços
              </CardTitle>
              <CardDescription className="text-muted-foreground">Seus agendamentos passados e futuros.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="text-muted-foreground">Data</TableHead>
                    <TableHead className="text-muted-foreground">Serviço</TableHead>
                    <TableHead className="text-muted-foreground">Valor</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.filter(app => app.clientEmail === user?.email).map((app) => (
                    <TableRow key={app.id} className="border-b border-border/50 hover:bg-background">
                      <TableCell className="font-medium text-foreground">{app.date}</TableCell>
                      <TableCell className="text-muted-foreground">{app.serviceName}</TableCell>
                      <TableCell className="text-muted-foreground">R$ {app.value.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          app.status === "Concluído" ? "bg-green-500/20 text-green-400" :
                          app.status === "Pendente" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {app.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-muted" onClick={() => handleViewDetails(app)}>
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="lg:col-span-1">
          <Card className="bg-card border-border shadow-lg rounded-2xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" /> Assistente Pontedra — Recomendações
              </CardTitle>
              <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-muted" onClick={handleGenerateNewSuggestions}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <CardDescription className="text-muted-foreground mb-4">
                Sugestões inteligentes baseadas no seu histórico e preferências.
              </CardDescription>
              <div className="space-y-3">
                {aiRecommendations.map((rec) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 bg-background border border-border rounded-md"
                  >
                    <p className="text-sm font-semibold text-foreground">{rec.category}</p>
                    <p className="text-xs text-muted-foreground">{rec.message}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Seção de Benefícios e Promoções */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className="mt-6">
        <Card className="bg-card border-border shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" /> Benefícios e Promoções
            </CardTitle>
            <CardDescription className="text-muted-foreground">Ofertas exclusivas para você!</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promo) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-background border border-border rounded-lg shadow-sm flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{promo.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{promo.description}</p>
                </div>
                <Button className="w-full uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20" onClick={() => handleAproveitarPromocao(promo.actionMessage)}>
                  Aproveitar Promoção
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal de Detalhes do Agendamento */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Detalhes do Agendamento</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Informações completas sobre o serviço agendado.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointmentDetail && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-foreground font-medium">Serviço:</span>
                <span className="col-span-2 text-muted-foreground">{selectedAppointmentDetail.serviceName}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-foreground font-medium">Data:</span>
                <span className="col-span-2 text-muted-foreground">{selectedAppointmentDetail.date}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-foreground font-medium">Hora:</span>
                <span className="col-span-2 text-muted-foreground">{selectedAppointmentDetail.time}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-foreground font-medium">Valor:</span>
                <span className="col-span-2 text-muted-foreground">R$ {selectedAppointmentDetail.value.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-foreground font-medium">Status:</span>
                <span className="col-span-2 text-muted-foreground">{selectedAppointmentDetail.status}</span>
              </div>
            </div>
          )}
          <DialogFooter className="border-t border-border/50 pt-4">
            <Button variant="outline" className="bg-background border-border text-foreground hover:bg-muted" onClick={() => setIsDetailModalOpen(false)}>
              Fechar
            </Button>
            <Button className="uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20" onClick={() => navigate("/dashboard/cliente/agenda")}>
              Ir para Agendamentos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ClientDashboardLayout>
  );
};

export default MinhaExperienciaPage;