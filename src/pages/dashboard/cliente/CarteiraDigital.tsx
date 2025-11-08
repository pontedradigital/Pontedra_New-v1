import React, { useState, useEffect } from "react";
import ClientDashboardLayout from "@/components/layouts/ClientDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, CreditCard, Wallet, TrendingUp, RefreshCcw, Filter, Info, LineChart as LineChartIcon, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from "sonner";
import {
  MOCK_CLIENT_FINANCIAL_SUMMARY,
  MOCK_CLIENT_TRANSACTIONS,
  MOCK_CLIENT_FINANCIAL_INSIGHTS,
  MOCK_CLIENT_SPENDING_CHART_DATA,
  ClientTransaction,
  ClientFinancialInsight,
  ClientSpendingChartData,
} from "@/data/mockData";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const CarteiraDigitalPage = () => {
  const [financialSummary, setFinancialSummary] = useState(MOCK_CLIENT_FINANCIAL_SUMMARY);
  const [transactions, setTransactions] = useState<ClientTransaction[]>(MOCK_CLIENT_TRANSACTIONS);
  const [filteredTransactions, setFilteredTransactions] = useState<ClientTransaction[]>(MOCK_CLIENT_TRANSACTIONS);
  const [financialInsights, setFinancialInsights] = useState<ClientFinancialInsight[]>(MOCK_CLIENT_FINANCIAL_INSIGHTS);
  const [spendingChartData, setSpendingChartData] = useState<ClientSpendingChartData[]>(MOCK_CLIENT_SPENDING_CHART_DATA);

  const [isAddCreditModalOpen, setIsAddCreditModalOpen] = useState(false);
  const [newCreditAmount, setNewCreditAmount] = useState<string>("");
  const [newPaymentMethod, setNewPaymentMethod] = useState<string>("pix");

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTransactionDetail, setSelectedTransactionDetail] = useState<ClientTransaction | null>(null);

  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    let tempTransactions = transactions;

    if (filterMonth !== "all") {
      tempTransactions = tempTransactions.filter(t => new Date(t.date).getMonth() === parseInt(filterMonth));
    }
    if (filterType !== "all") {
      tempTransactions = tempTransactions.filter(t => t.type === filterType);
    }
    setFilteredTransactions(tempTransactions);
  }, [transactions, filterMonth, filterType]);

  const handleAddCredit = () => {
    const amount = parseFloat(newCreditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Por favor, insira um valor válido para o crédito.");
      return;
    }

    const newTransaction: ClientTransaction = {
      id: `t${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      description: `Recarga de Saldo via ${newPaymentMethod.toUpperCase()}`,
      type: "credit",
      amount: amount,
      status: "completed",
    };

    setFinancialSummary(prev => ({
      ...prev,
      currentBalance: prev.currentBalance + amount,
      availableCredits: prev.availableCredits + amount, // Assuming credits are added to available credits
    }));
    setTransactions(prev => [newTransaction, ...prev]);
    setIsAddCreditModalOpen(false);
    setNewCreditAmount("");
    toast.success(`R$${amount.toFixed(2)} adicionados com sucesso via ${newPaymentMethod.toUpperCase()}!`);
  };

  const handleGenerateNewInsights = () => {
    const newInsights = MOCK_CLIENT_FINANCIAL_INSIGHTS.sort(() => 0.5 - Math.random()).slice(0, 3);
    setFinancialInsights(newInsights);
    toast.info("Novos insights financeiros gerados!");
  };

  const handleViewDetails = (transaction: ClientTransaction) => {
    setSelectedTransactionDetail(transaction);
    setIsDetailModalOpen(true);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "refunded":
        return "text-blue-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "credit":
      case "cashback":
        return "text-primary";
      case "debit":
        return "text-destructive";
      default:
        return "text-foreground";
    }
  };

  const getStatusDetailColor = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "refunded":
        return "text-blue-500";
      default:
        return "text-muted-foreground";
    }
  };

  const currentMonthlySpending = transactions
    .filter(t => t.type === "debit" && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);

  const spendingPercentage = financialSummary.monthlySpendingTarget > 0
    ? Math.min(100, (currentMonthlySpending / financialSummary.monthlySpendingTarget) * 100)
    : 0;

  return (
    <ClientDashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Carteira Digital</h1>
      </div>

      {/* Resumo Financeiro Atual */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Saldo Atual</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(financialSummary.currentBalance)}</div>
              <p className="text-xs text-muted-foreground">Seu dinheiro disponível</p>
              <div className="relative w-full h-2 bg-muted rounded-full mt-4">
                <div
                  className="absolute h-full bg-primary rounded-full"
                  style={{ width: `${spendingPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Gastos este mês: {formatCurrency(currentMonthlySpending)} de {formatCurrency(financialSummary.monthlySpendingTarget)} ({spendingPercentage.toFixed(0)}%)
              </p>
              <Button className="mt-4 w-full uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20" onClick={() => setIsAddCreditModalOpen(true)}>
                Adicionar Crédito
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Créditos Disponíveis</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(financialSummary.availableCredits)}</div>
              <p className="text-xs text-muted-foreground">Para usar em serviços</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Cashback Acumulado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(financialSummary.accumulatedCashback)}</div>
              <p className="text-xs text-muted-foreground">Seus ganhos de volta</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráfico de Gastos Mensais */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="mb-6">
        <Card className="bg-card border-border shadow-lg rounded-2xl h-full">
          <CardHeader>
            <CardTitle className="text-foreground">Gastos nos Últimos 6 Meses</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendingChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `R$${value}`} />
                <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="spending" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Histórico de Transações */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className="lg:col-span-2">
          <Card className="bg-card border-border shadow-lg rounded-2xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-foreground flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" /> Histórico de Transações
              </CardTitle>
              <div className="flex gap-2">
                <Select onValueChange={setFilterMonth} value={filterMonth}>
                  <SelectTrigger className="w-[120px] bg-background border-border text-foreground focus:ring-primary">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="all">Todos os Meses</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={setFilterType} value={filterType}>
                  <SelectTrigger className="w-[120px] bg-background border-border text-foreground focus:ring-primary">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="credit">Crédito</SelectItem>
                    <SelectItem value="debit">Débito</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="text-muted-foreground">Data</TableHead>
                    <TableHead className="text-muted-foreground">Descrição</TableHead>
                    <TableHead className="text-muted-foreground">Tipo</TableHead>
                    <TableHead className="text-muted-foreground">Valor</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="border-b border-border/50 hover:bg-background cursor-pointer" onClick={() => handleViewDetails(transaction)}>
                        <TableCell className="font-medium text-foreground">{transaction.date}</TableCell>
                        <TableCell className="text-muted-foreground">{transaction.description}</TableCell>
                        <TableCell className={cn("font-medium capitalize", getTransactionTypeColor(transaction.type))}>{transaction.type}</TableCell>
                        <TableCell className={cn("font-medium", getTransactionTypeColor(transaction.type))}>
                          {transaction.type === "debit" ? "-" : ""}{formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className={cn("capitalize", getStatusColor(transaction.status))}>{transaction.status}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhuma transação encontrada com os filtros aplicados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Assistente Pontedra Financeira — Insights Inteligentes */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }} className="lg:col-span-1">
          <Card className="bg-card border-border shadow-lg rounded-2xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" /> Insights Financeiros da Assistente Pontedra
              </CardTitle>
              <Button variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-muted" onClick={handleGenerateNewInsights}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <CardDescription className="text-muted-foreground mb-4">
                Sugestões e análises inteligentes sobre suas finanças.
              </CardDescription>
              <div className="space-y-3">
                {financialInsights.map((insight) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 bg-background border border-border rounded-md"
                  >
                    <p className="text-sm font-semibold text-foreground">{insight.category}</p>
                    <p className="text-xs text-muted-foreground">{insight.message}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal Adicionar Crédito */}
      <Dialog open={isAddCreditModalOpen} onOpenChange={setIsAddCreditModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Adicionar Crédito</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Adicione saldo à sua carteira digital.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right text-foreground">
                Valor
              </Label>
              <Input
                id="amount"
                type="number"
                value={newCreditAmount}
                onChange={(e) => setNewCreditAmount(e.target.value)}
                className="col-span-3 bg-background border-border text-foreground focus:ring-primary"
                placeholder="Ex: 50.00"
                step="0.01"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment-method" className="text-right text-foreground">
                Método
              </Label>
              <Select onValueChange={setNewPaymentMethod} value={newPaymentMethod}>
                <SelectTrigger id="payment-method" className="col-span-3 bg-background border-border text-foreground focus:ring-primary">
                  <SelectValue placeholder="Selecione um método" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="card">Cartão de Crédito</SelectItem>
                  <SelectItem value="balance">Saldo Existente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="border-t border-border/50 pt-4">
            <Button variant="outline" className="bg-background border-border text-foreground hover:bg-muted" onClick={() => setIsAddCreditModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleAddCredit} className="uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20">
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes da Transação */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Detalhes da Transação</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Informações completas sobre a movimentação financeira.
            </DialogDescription>
          </DialogHeader>
          {selectedTransactionDetail && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-foreground font-medium">Data:</span>
                <span className="col-span-2 text-muted-foreground">{selectedTransactionDetail.date}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-foreground font-medium">Descrição:</span>
                <span className="col-span-2 text-muted-foreground">{selectedTransactionDetail.description}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-foreground font-medium">Tipo:</span>
                <span className={cn("col-span-2 font-medium capitalize", getTransactionTypeColor(selectedTransactionDetail.type))}>{selectedTransactionDetail.type}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-foreground font-medium">Valor:</span>
                <span className={cn("col-span-2 font-medium", getTransactionTypeColor(selectedTransactionDetail.type))}>
                  {selectedTransactionDetail.type === "debit" ? "-" : ""}{formatCurrency(selectedTransactionDetail.amount)}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-foreground font-medium">Status:</span>
                <span className={cn("col-span-2 capitalize", getStatusDetailColor(selectedTransactionDetail.status))}>{selectedTransactionDetail.status}</span>
              </div>
            </div>
          )}
          <DialogFooter className="border-t border-border/50 pt-4">
            <Button variant="outline" className="bg-background border-border text-foreground hover:bg-muted" onClick={() => setIsDetailModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ClientDashboardLayout>
  );
};

export default CarteiraDigitalPage;