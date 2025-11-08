import React, { useEffect, useState } from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Lightbulb, RefreshCcw, Users, CalendarCheck, Percent } from "lucide-react";
import { motion } from "framer-motion";
import { gerarRelatorioInteligente, obterUltimoRelatorio } from "@/utils/assistentePontedraAnalise";
import { useMockData } from "@/context/MockContext"; // Importar useMockData

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const AnaliseInteligente = () => {
  const { clients, appointments, services, isLoading } = useMockData();
  const [relatorio, setRelatorio] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const updateReport = () => {
    setLoadingReport(true);
    // Simulate API call delay
    setTimeout(() => {
      const novoRelatorio = gerarRelatorioInteligente(clients, appointments, services);
      setRelatorio(novoRelatorio);
      setLoadingReport(false);
      toast.success("Relatório inteligente atualizado!");
    }, 1000);
  };

  useEffect(() => {
    const salvo = obterUltimoRelatorio();
    if (salvo) {
      setRelatorio(salvo);
    } else {
      updateReport(); // Gerar o primeiro relatório se não houver nenhum salvo
    }
  }, [clients, appointments, services]); // Dependências para regenerar o relatório se os dados mockados mudarem

  if (!relatorio) {
    return (
      <MasterDashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Gerando relatório inteligente...</p>
        </div>
      </MasterDashboardLayout>
    );
  }

  return (
    <MasterDashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">📈 Análises e Recomendações Inteligentes</h1>
        <Button
          size="sm"
          className="bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20 uppercase"
          onClick={updateReport}
          disabled={loadingReport || isLoading}
        >
          <RefreshCcw className="h-4 w-4 mr-2" /> {loadingReport ? "Atualizando..." : "Atualizar Relatório"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{relatorio.totalClientes}</div>
              <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Agendamentos Concluídos</CardTitle>
              <CalendarCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{relatorio.totalAgendamentos}</div>
              <p className="text-xs text-muted-foreground">Total de agendamentos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Taxa de Conversão</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{relatorio.taxaConversao}%</div>
              <p className="text-xs text-muted-foreground">Agendamentos concluídos / total</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total de Serviços</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{relatorio.totalServicos}</div>
              <p className="text-xs text-muted-foreground">Serviços cadastrados</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
        <Card className="bg-card border-border shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" /> Sugestões da Assistente Pontedra
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Recomendações inteligentes para otimizar seu negócio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {relatorio.sugestoes.map((s: string, i: number) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 text-foreground bg-background p-3 rounded-md border border-border"
                >
                  <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <p className="text-sm">{s}</p>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border shadow-sm bg-card mt-6"
      >
        <div className="flex flex-col items-center gap-1 text-center p-4">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            Relatório Gerado em: {relatorio.dataGeracao}
          </h3>
          <p className="text-sm text-muted-foreground">
            Mantenha-se atualizado com as análises da Assistente Pontedra.
          </p>
        </div>
      </motion.div>
    </MasterDashboardLayout>
  );
};

export default AnaliseInteligente;