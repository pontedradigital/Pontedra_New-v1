import React, { useState } from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Camera, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useMockData } from "@/context/MockContext";

const CanaisAtendimentoPage = () => {
  const { channels, toggleChannelConnection, isLoading } = useMockData();

  const renderChannelCard = (
    channelId: string,
    title: string,
    description: string,
    Icon: React.ElementType,
    connected: boolean,
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
              <span className={connected ? "text-primary" : "text-destructive"}>
                {connected ? "Conectado" : "Não conectado"}
              </span>
            </p>
            <Button
              className="w-full uppercase"
              variant={connected ? "destructive" : "default"}
              onClick={() => toggleChannelConnection(channelId)}
              disabled={isLoading}
            >
              {isLoading ? "Carregando..." : connected ? "Desconectar Conta" : "Simular Conexão"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const whatsappChannel = channels.find(c => c.name === "WhatsApp Business");
  const messengerChannel = channels.find(c => c.name === "Messenger (Facebook)");
  const instagramChannel = channels.find(c => c.name === "Instagram Direct");

  return (
    <MasterDashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Canais de Atendimento</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {whatsappChannel && renderChannelCard(
          whatsappChannel.id,
          whatsappChannel.name,
          whatsappChannel.description,
          MessageCircle,
          whatsappChannel.connected,
          0.1
        )}

        {messengerChannel && renderChannelCard(
          messengerChannel.id,
          messengerChannel.name,
          messengerChannel.description,
          MessageSquare,
          messengerChannel.connected,
          0.2
        )}

        {instagramChannel && renderChannelCard(
          instagramChannel.id,
          instagramChannel.name,
          instagramChannel.description,
          Camera,
          instagramChannel.connected,
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