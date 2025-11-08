import React, { useState } from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Camera, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const InstagramIntegracao = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoGreeting, setAutoGreeting] = useState(true);
  const [awayMessage, setAwayMessage] = useState(true);
  const [forwardToHuman, setForwardToHuman] = useState(false);

  const handleToggleConnection = () => {
    setLoading(true);
    setTimeout(() => {
      setConnected(!connected);
      setLoading(false);
      if (!connected) {
        toast.success("Instagram Direct conectado com sucesso!");
      } else {
        toast.info("Instagram Direct desconectado.");
      }
    }, 1500);
  };

  const mockRecentMessages = [
    { client: "Maria L.", lastMessage: "Qual o valor do serviço?", status: "Respondida" },
    { client: "Carlos P.", lastMessage: "Tem horário para amanhã?", status: "Pendente" },
    { client: "Ana R.", lastMessage: "Adorei o resultado!", status: "Lida" },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <MasterDashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Integração Instagram Direct</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card className="h-full flex flex-col bg-card border-border shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Status da Conexão</CardTitle>
              <Camera className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <p className="text-sm text-muted-foreground mb-4">
                Gerencie suas mensagens diretas no Instagram e automatize respostas com a IA Pontedra.
              </p>
              <div>
                <p className="text-sm font-semibold mb-2 text-foreground">
                  Status:{" "}
                  <span className={connected ? "text-primary" : "text-destructive"}>
                    {connected ? "Conectado" : "Desconectado"}
                  </span>
                </p>
                {connected && (
                  <p className="text-xs text-muted-foreground mb-4">Usuário Conectado: @pontedra_saas</p>
                )}
                <Button
                  className="w-full uppercase"
                  variant={connected ? "destructive" : "default"}
                  onClick={handleToggleConnection}
                  disabled={loading}
                >
                  {loading ? "Carregando..." : connected ? "Desconectar Conta Instagram" : "Conectar Conta Instagram"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Card className="h-full flex flex-col bg-card border-border shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Configurações de Resposta Rápida</CardTitle>
              <CardDescription className="text-muted-foreground">
                Automatize respostas para interações comuns.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 grid gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="auto-greeting" checked={autoGreeting} onCheckedChange={(checked) => setAutoGreeting(!!checked)} />
                <Label htmlFor="auto-greeting" className="text-foreground">Resposta automática de saudação</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="away-message" checked={awayMessage} onCheckedChange={(checked) => setAwayMessage(!!checked)} />
                <Label htmlFor="away-message" className="text-foreground">Mensagem fora do horário de atendimento</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="forward-human" checked={forwardToHuman} onCheckedChange={(checked) => setForwardToHuman(!!checked)} />
                <Label htmlFor="forward-human" className="text-foreground">Encaminhar para atendente humano</Label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="lg:col-span-2 xl:col-span-1">
          <Card className="h-full flex flex-col bg-card border-border shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Mensagens Recentes</CardTitle>
              <CardDescription className="text-muted-foreground">
                Últimas mensagens recebidas no Instagram Direct.
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
                  {mockRecentMessages.map((msg, index) => (
                    <TableRow key={index} className="border-b border-border/50 hover:bg-background">
                      <TableCell className="font-medium text-foreground">{msg.client}</TableCell>
                      <TableCell className="text-muted-foreground">{msg.lastMessage}</TableCell>
                      <TableCell className="text-muted-foreground">{msg.status}</TableCell>
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

export default InstagramIntegracao;