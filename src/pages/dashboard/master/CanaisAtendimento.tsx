import React, { useState } from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Camera, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ChannelState {
  connected: boolean;
  loading: boolean;
}

const CanaisAtendimentoPage = () => {
  const [whatsappState, setWhatsappState] = useState<ChannelState>({ connected: false, loading: false });
  const [messengerState, setMessengerState] = useState<ChannelState>({ connected: false, loading: false });
  const [instagramState, setInstagramState] = useState<ChannelState>({ connected: false, loading: false });

  const toggleConnection = (channel: "whatsapp" | "messenger" | "instagram") => {
    let setState: React.Dispatch<React.SetStateAction<ChannelState>>;
    let currentStatus: boolean;
    let channelName: string;

    if (channel === "whatsapp") {
      setState = setWhatsappState;
      currentStatus = whatsappState.connected;
      channelName = "WhatsApp Business";
    } else if (channel === "messenger") {
      setState = setMessengerState;
      currentStatus = messengerState.connected;
      channelName = "Messenger";
    } else {
      setState = setInstagramState;
      currentStatus = instagramState.connected;
      channelName = "Instagram Direct";
    }

    setState(prev => ({ ...prev, loading: true }));

    setTimeout(() => {
      setState(prev => ({ ...prev, connected: !currentStatus, loading: false }));
      if (!currentStatus) {
        toast.success(`${channelName} conectado com sucesso!`);
      } else {
        toast.info(`${channelName} desconectado.`);
      }
    }, 1500); // Simulate API call
  };

  const renderChannelCard = (
    title: string,
    description: string,
    Icon: React.ElementType,
    state: ChannelState,
    onToggle: () => void,
    delay: number
  ) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
    >
      <Card className="h-full flex flex-col bg-card border-border shadow-lg rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <p className="text-sm text-muted-foreground mb-4">
            {description}
          </p>
          <div>
            <p className="text-sm font-semibold mb-2 text-foreground">
              Status:{" "}
              <span className={state.connected ? "text-primary" : "text-destructive"}>
                {state.connected ? "Conectado" : "Não conectado"}
              </span>
            </p>
            <Button
              className="w-full uppercase"
              variant={state.connected ? "destructive" : "default"}
              onClick={onToggle}
              disabled={state.loading}
            >
              {state.loading ? "Carregando..." : state.connected ? "Desconectar Conta" : "Simular Conexão"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <MasterDashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Canais de Atendimento</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {renderChannelCard(
          "WhatsApp Business",
          "Simulação de integração com o WhatsApp para mensagens automatizadas e atendimento ao cliente.",
          MessageCircle,
          whatsappState,
          () => toggleConnection("whatsapp"),
          0.1
        )}

        {renderChannelCard(
          "Messenger (Facebook)",
          "Simulação de gerenciamento de conversas e automações no Facebook Messenger.",
          MessageSquare,
          messengerState,
          () => toggleConnection("messenger"),
          0.2
        )}

        {renderChannelCard(
          "Instagram Direct",
          "Simulação de interação com clientes e automação de respostas no Instagram Direct.",
          Camera,
          instagramState,
          () => toggleConnection("instagram"),
          0.3
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border shadow-sm bg-card mt-6"
      >
        <div className="flex flex-col items-center gap-1 text-center p-4">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            Integrações de Comunicação
          </h3>
          <p className="text-sm text-muted-foreground">
            Gerencie toda a comunicação com seus clientes em um só lugar.
          </p>
        </div>
      </motion.div>
    </MasterDashboardLayout>
  );
};

export default CanaisAtendimentoPage;