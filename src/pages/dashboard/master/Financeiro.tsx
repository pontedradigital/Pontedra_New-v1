import React, { useState, useEffect } from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, TrendingDown, Briefcase, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MOCK_FINANCE_SUMMARY, MOCK_FINANCE_ENTRIES, MOCK_FINANCE_CHART_DATA, FinanceEntry } from "@/data/mockData";
import { toast } from "sonner";

const FinanceiroPage = () => {
  const [financeSummary, setFinanceSummary] = useState(MOCK_FINANCE_SUMMARY);
  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>(MOCK_FINANCE_ENTRIES);
  const [chartData, setChartData] = useState(MOCK_FINANCE_CHART_DATA);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newEntry: FinanceEntry = {
        id: `fe${financeEntries.length + 1}`,
        date: new Date().toISOString().slice(0, 10),
        clientName: ["Mariana", "Gustavo", "Isabela", "Rafael"][Math.floor(Math.random() * 4)],
        serviceName: ["Corte de Cabelo", "Manicure", "Limpeza de Pele", "Massagem"][Math.floor(Math.random() * 4)],
        value: parseFloat((Math.random() * (200 - 50) + 50).toFixed(2)),
        status: "Concluído",
      };
      setFinanceEntries(prev => [newEntry, ...prev].slice(0, 10));
    }, 30000);

    return () => clearInterval(interval);
  }, [financeEntries.length]);

  const handleUpdateFinance = () => {
    setLoading(true);
    setTimeout(() => {
      setFinanceSummary({
        totalRevenue: parseFloat((MOCK_FINANCE_SUMMARY.totalRevenue * (1 + (Math.random() * 0.1 - 0.05))).toFixed(2)),
        revenueChange: parseFloat((Math.random() * 30 - 10).toFixed(1)),
        netProfit: parseFloat((MOCK_FINANCE_SUMMARY.netProfit * (1 + (Math.random() * 0.1 - 0.05))).toFixed(2)),
        mostProfitableService: ["Coloração", "Corte de Cabelo Masculino", "Limpeza de Pele"][Math.floor(Math.random() * 3)],
      });
      setFinanceEntries(MOCK_FINANCE_ENTRIES.map(entry => ({
        ...entry,
        value: parseFloat((entry.value * (1 + (Math.random() * 0.05 - 0.02))).toFixed(2)),
      })));
      setChartData({
        monthlyRevenue: MOCK_FINANCE_CHART_DATA.monthlyRevenue.map(data => ({ ...data, value: data.value + Math.floor(Math.random() * 1000 - 500) })),
        accumulatedProfit: MOCK_FINANCE_CHART_DATA.accumulatedProfit.map(data => ({ ...data, value: data.value + Math.floor(Math.random() * 500 - 250) })),
      });
      setLoading(false);
      toast.success("Dados financeiros atualizados!");
    }, 1500);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <MasterDashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Painel Financeiro Master</h1>
        <Button size="sm" className="bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20 uppercase" onClick={handleUpdateFinance} disabled={loading}>
          <RefreshCcw className="h-4 w-4 mr-2" /> {loading ? "Atualizando..." : "Atualizar Financeiro"}
        </Button>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Receita Total (Mês)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">R$ {financeSummary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className={`text-xs ${financeSummary.revenueChange >= 0 ? "text-primary" : "text-destructive"}`}>
                {financeSummary.revenueChange >= 0 ? "+" : ""}{financeSummary.revenueChange}% do mês anterior
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Lucro Líquido (Mês)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">R$ {financeSummary.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">Estimativa</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Serviço Mais Rentável</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-foreground">{financeSummary.mostProfitableService}</div>
              <p className="text-xs text-muted-foreground">Baseado em agendamentos concluídos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Comparativo Anual</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">+12.5%</div>
              <p className="text-xs text-muted-foreground">Em relação ao ano anterior</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráficos Financeiros */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mt-6 mb-6">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl h-full">
            <CardHeader>
              <CardTitle className="text-foreground">Faturamento Mensal</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.monthlyRevenue}>
                  <CartesianGrid strokeDashArray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl h-full">
            <CardHeader>
              <CardTitle className="text-foreground">Lucro Acumulado</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.accumulatedProfit}>
                  <CartesianGrid strokeDashArray="3 3" stroke="hsl(var(--muted))" />
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

      {/* Tabela de Entradas Recentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-6"
      >
        <Card className="bg-card border-border shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-foreground">Entradas Recentes</CardTitle>
            <CardDescription className="text-muted-foreground">Últimas transações de serviços concluídos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="text-muted-foreground">Data</TableHead>
                    <TableHead className="text-muted-foreground">Cliente</TableHead>
                    <TableHead className="text-muted-foreground">Serviço</TableHead>
                    <TableHead className="text-muted-foreground">Valor</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financeEntries.map((entry) => (
                    <TableRow key={entry.id} className="border-b border-border/50 hover:bg-background">
                      <TableCell className="font-medium text-foreground">{entry.date}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.clientName}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.serviceName}</TableCell>
                      <TableCell className="text-muted-foreground">R$ {entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          entry.status === "Concluído" ? "bg-green-500/20 text-green-400" :
                          entry.status === "Pendente" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {entry.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </MasterDashboardLayout>
  );
};

export default FinanceiroPage;