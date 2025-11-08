import React, { useState } from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageCircle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const WhatsAppIntegracao = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleConnection = () => {
    setLoading(true);
    setTimeout(() => {
      setConnected(!connected);
      setLoading(false);
      if (!connected) {
        toast.success("WhatsApp Business conectado com sucesso!");
      } else {
        toast.info("WhatsApp Business desconectado.");
      }
    }, 1500);
  };

  const mockMessages = [
    { client: "João Silva", message: "Olá, tudo bem?", status: "Enviada", time: "10:32" },
    { client: "Maria Souza", message: "Gostaria de agendar um serviço.", status: "Lida", time: "Ontem, 15:00" },
    { client: "Pedro Lima", message: "Qual o horário de funcionamento?", status: "Respondida", time: "2 dias atrás" },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <MasterDashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Integração WhatsApp Business</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card className="h-full flex flex-col bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Status da Conexão</CardTitle>
              <MessageCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <p className="text-sm text-muted-foreground mb-4">
                Simulação de integração com a API do WhatsApp Business para automação de atendimentos e envio de mensagens automáticas.
              </p>
              <div>
                <p className="text-sm font-semibold mb-2 text-foreground">
                  Status:{" "}
                  <span className={connected ? "text-primary" : "text-destructive"}>
                    {connected ? "Conectado" : "Desconectado"}
                  </span>
                </p>
                {connected && (
                  <p className="text-xs text-muted-foreground mb-4">Número Conectado: +55 11 9XXXX-XXXX</p>
                )}
                <Button
                  className="w-full uppercase"
                  variant={connected ? "destructive" : "default"}
                  onClick={handleToggleConnection}
                  disabled={loading}
                >
                  {loading ? "Carregando..." : connected ? "Desconectar Conta" : "Conectar Conta"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Card className="h-full flex flex-col bg-card border-border shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Mensagens Automáticas</CardTitle>
              <CardDescription className="text-muted-foreground">
                Simula o envio de mensagens automáticas da Assistente Pontedra.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Resposta de saudação
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Confirmação de agendamento
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive" /> Lembrete de pagamento
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="lg:col-span-2 xl:col-span-1">
          <Card className="h-full flex flex-col bg-card border-border shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Logs de Mensagens Recentes</CardTitle>
              <CardDescription className="text-muted-foreground">
                Últimas interações via WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="text-muted-foreground">Cliente</TableHead>
                    <TableHead className="text-muted-foreground">Mensagem</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Horário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMessages.map((msg, index) => (
                    <TableRow key={index} className="border-b border-border/50 hover:bg-background">
                      <TableCell className="font-medium text-foreground">{msg.client}</TableCell>
                      <TableCell className="text-muted-foreground">{msg.message}</TableCell>
                      <TableCell className="text-muted-foreground">{msg.status}</TableCell>
                      <TableCell className="text-muted-foreground">{msg.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MasterDashboardLayout>
  );
};

export default WhatsAppIntegracao;