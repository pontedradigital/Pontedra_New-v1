import React, { useState, useEffect } from "react";
import ClientDashboardLayout from "@/components/layouts/ClientDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, CalendarDays, Award, DollarSign, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Benefit {
  id: string;
  name: string;
  pointsRequired: number;
  description: string;
}

interface PointHistoryEntry {
  id: string;
  date: string;
  description: string;
  pointsChange: number; // positive for gain, negative for redemption
  status: "Confirmado" | "Utilizado" | "Pendente";
}

const MOCK_BENEFITS: Benefit[] = [
  { id: "b1", name: "Desconto de 10% em qualquer serviço", pointsRequired: 100, description: "Use 100 pontos para um desconto de 10% na sua próxima compra." },
  { id: "b2", name: "Serviço de Manicure Grátis", pointsRequired: 250, description: "Resgate uma sessão de manicure completa sem custo." },
  { id: "b3", name: "Upgrade de Serviço (50% off)", pointsRequired: 300, description: "50% de desconto no upgrade para um serviço premium." },
  { id: "b4", name: "Acesso VIP a Eventos", pointsRequired: 500, description: "Acesso exclusivo a eventos e lançamentos da Pontedra." },
];

const initialPoints = 150;
const initialHistory: PointHistoryEntry[] = [
  { id: "ph1", date: "2024-10-20", description: "Agendamento: Corte de Cabelo", pointsChange: 50, status: "Confirmado" },
  { id: "ph2", date: "2024-10-25", description: "Agendamento: Manicure e Pedicure", pointsChange: 80, status: "Confirmado" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const BeneficiosFidelidadePage = () => {
  const { user } = useAuth();
  const [totalPoints, setTotalPoints] = useState<number>(initialPoints);
  const [pointHistory, setPointHistory] = useState<PointHistoryEntry[]>(initialHistory);
  const [lastRedemption, setLastRedemption] = useState<string | null>(null);
  const [activeBenefitsCount, setActiveBenefitsCount] = useState<number>(0);

  useEffect(() => {
    const redeemedBenefits = pointHistory.filter(entry => entry.pointsChange < 0 && entry.status === "Utilizado");
    if (redeemedBenefits.length > 0) {
      const last = redeemedBenefits.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())[0];
      setLastRedemption(`${last.description} em ${format(parseISO(last.date), "dd/MM/yyyy", { locale: ptBR })}`);
    } else {
      setLastRedemption("Nenhum resgate ainda");
    }
    setActiveBenefitsCount(redeemedBenefits.length);
  }, [pointHistory]);

  const getFidelityLevel = (points: number) => {
    if (points >= 1000) return { name: "Diamante", color: "text-blue-400" };
    if (points >= 500) return { name: "Ouro", color: "text-yellow-400" };
    if (points >= 200) return { name: "Prata", color: "text-gray-400" };
    return { name: "Bronze", color: "text-orange-400" };
  };

  const fidelityLevel = getFidelityLevel(totalPoints);

  const handleRedeemBenefit = (benefit: Benefit) => {
    if (totalPoints >= benefit.pointsRequired) {
      setTotalPoints(prev => prev - benefit.pointsRequired);
      const newHistoryEntry: PointHistoryEntry = {
        id: `ph${pointHistory.length + 1}`,
        date: format(new Date(), "yyyy-MM-dd"),
        description: `Resgate: ${benefit.name}`,
        pointsChange: -benefit.pointsRequired,
        status: "Utilizado",
      };
      setPointHistory(prev => [newHistoryEntry, ...prev]);
      toast.success(`Benefício "${benefit.name}" resgatado com sucesso!`);
    } else {
      toast.error(`Você não tem pontos suficientes para resgatar "${benefit.name}".`);
    }
  };

  const handleSimulatePointsGain = () => {
    const pointsGained = Math.floor(Math.random() * 50) + 20;
    setTotalPoints(prev => prev + pointsGained);
    const newHistoryEntry: PointHistoryEntry = {
      id: `ph${pointHistory.length + 1}`,
      date: format(new Date(), "yyyy-MM-dd"),
      description: `Simulação: Ganho por atividade`,
      pointsChange: pointsGained,
      status: "Confirmado",
    };
    setPointHistory(prev => [newHistoryEntry, ...prev]);
    toast.info(`Você ganhou ${pointsGained} pontos!`);
  };

  return (
    <ClientDashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl text-foreground">Benefícios e Fidelidade</h1>
          <p className="text-sm text-muted-foreground">Acompanhe seus pontos, vantagens e histórico de uso.</p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <Gift className="h-8 w-8 text-primary" />
        </motion.div>
      </div>

      {/* Cards Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Pontos Totais</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalPoints}</div>
              <p className="text-xs text-muted-foreground">Pontos acumulados</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Benefícios Ativos</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{activeBenefitsCount}</div>
              <p className="text-xs text-muted-foreground">Benefícios resgatados</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Último Resgate</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-md font-bold text-foreground line-clamp-2">{lastRedemption}</div>
              <p className="text-xs text-muted-foreground">Detalhes do benefício</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Nível Atual</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", fidelityLevel.color)}>{fidelityLevel.name}</div>
              <p className="text-xs text-muted-foreground">Próximo nível: {fidelityLevel.name === "Diamante" ? "Máximo" : getFidelityLevel(totalPoints + 1).name}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabela de Histórico de Pontos */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
        className="mb-6"
      >
        <Card className="bg-card border-border shadow-lg rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Histórico de Pontos</CardTitle>
              <CardDescription className="text-muted-foreground">Seus ganhos e resgates de pontos.</CardDescription>
            </div>
            <Button size="sm" variant="outline" className="bg-background border-border text-foreground hover:bg-muted" onClick={handleSimulatePointsGain}>
              <RefreshCcw className="h-4 w-4 mr-2" /> Simular Ganho
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="text-muted-foreground">Data</TableHead>
                    <TableHead className="text-muted-foreground">Descrição</TableHead>
                    <TableHead className="text-muted-foreground">Pontos</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pointHistory.length > 0 ? (
                    pointHistory.map((entry) => (
                      <TableRow key={entry.id} className="border-b border-border/50 hover:bg-background">
                        <TableCell className="font-medium text-foreground">{format(parseISO(entry.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.description}</TableCell>
                        <TableCell className={cn("font-semibold", entry.pointsChange > 0 ? "text-primary" : "text-destructive")}>
                          {entry.pointsChange > 0 ? `+${entry.pointsChange}` : entry.pointsChange}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-xs font-semibold",
                            entry.status === "Confirmado" && "bg-green-500/20 text-green-400 hover:bg-green-500/20",
                            entry.status === "Utilizado" && "bg-blue-500/20 text-blue-400 hover:bg-blue-500/20",
                            entry.status === "Pendente" && "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20"
                          )}>
                            {entry.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                        Nenhum histórico de pontos encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Seção "Benefícios Disponíveis" */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-card border-border shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-foreground">Benefícios Disponíveis</CardTitle>
            <CardDescription className="text-muted-foreground">Resgate suas recompensas com os pontos acumulados.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_BENEFITS.map((benefit, index) => (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-background border border-border rounded-lg shadow-sm flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{benefit.description}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    <Star className="h-3 w-3 mr-1 text-yellow-400" /> {benefit.pointsRequired} Pontos
                  </Badge>
                  <Button
                    size="sm"
                    className="uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20"
                    onClick={() => handleRedeemBenefit(benefit)}
                    disabled={totalPoints < benefit.pointsRequired}
                  >
                    Resgatar
                  </Button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </ClientDashboardLayout>
  );
};

export default BeneficiosFidelidadePage;