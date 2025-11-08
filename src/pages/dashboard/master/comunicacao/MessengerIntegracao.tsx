import React, { useState } from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const MessengerIntegracao = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState(true);
  const [newMsgNotifications, setNewMsgNotifications] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);

  const handleToggleConnection = () => {
    setLoading(true);
    setTimeout(() => {
      setConnected(!connected);
      setLoading(false);
      if (!connected) {
        toast.success("Facebook Messenger conectado com sucesso!");
      } else {
        toast.info("Facebook Messenger desconectado.");
      }
    }, 1500);
  };

  const mockRecentConversations = [
    { client: "Fernanda G.", lastMessage: "Preciso de suporte técnico.", status: "Pendente" },
    { client: "Lucas M.", lastMessage: "Obrigado pelo atendimento!", status: "Concluída" },
    { client: "Mariana S.", lastMessage: "Qual o status do meu pedido?", status: "Respondida" },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <MasterDashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Integração Facebook Messenger</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card className="h-full flex flex-col bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Status da Conexão</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <p className="text-sm text-muted-foreground mb-4">
                Conecte sua página do Facebook e automatize o atendimento via Messenger.
              </p>
              <div>
                <p className="text-sm font-semibold mb-2 text-foreground">
                  Status:{" "}
                  <span className={connected ? "text-primary" : "text-destructive"}>
                    {connected ? "Conectado" : "Desconectado"}
                  </span>
                </p>
                {connected && (
                  <p className="text-xs text-muted-foreground mb-4">Página Conectada: Pontedra Teste</p>
                )}
                <Button
                  className="w-full uppercase"
                  variant={connected ? "destructive" : "default"}
                  onClick={handleToggleConnection}
                  disabled={loading}
                >
                  {loading ? "Carregando..." : connected ? "Desconectar Página" : "Conectar Página"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Card className="h-full flex flex-col bg-card border-border shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Configurações Avançadas</CardTitle>
              <CardDescription className="text-muted-foreground">
                Ajuste as opções de automação e notificação.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="quick-replies" className="text-foreground">Ativar respostas rápidas</Label>
                <Switch id="quick-replies" checked={quickReplies} onCheckedChange={setQuickReplies} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="new-msg-notifications" className="text-foreground">Notificações de novas mensagens</Label>
                <Switch id="new-msg-notifications" checked={newMsgNotifications} onCheckedChange={setNewMsgNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-summary" className="text-foreground">Enviar resumo diário</Label>
                <Switch id="daily-summary" checked={dailySummary} onCheckedChange={setDailySummary} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="lg:col-span-2 xl:col-span-1">
          <Card className="h-full flex flex-col bg-card border-border shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Mensagens Recentes</CardTitle>
              <CardDescription className="text-muted-foreground">
                Últimas conversas no Facebook Messenger.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="text-muted-foreground">Cliente</TableHead>
                    <TableHead className="text-muted-foreground">Última Mensagem</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRecentConversations.map((conv, index) => (
                    <TableRow key={index} className="border-b border-border/50 hover:bg-background">
                      <TableCell className="font-medium text-foreground">{conv.client}</TableCell>
                      <TableCell className="text-muted-foreground">{conv.lastMessage}</TableCell>
                      <TableCell className="text-muted-foreground">{conv.status}</TableCell>
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

export default MessengerIntegracao;