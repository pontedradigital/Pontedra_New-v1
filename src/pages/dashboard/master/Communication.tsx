import React from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bot, Instagram, Whatsapp } from "lucide-react";
import { toast } from "sonner";

const CommunicationPage = () => {
  return (
    <MasterDashboardLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Comunicação Multicanal</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
            <Whatsapp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Envie mensagens diretas e automáticas para seus clientes via WhatsApp.
            </p>
            <Button className="mt-4 w-full" variant="outline" onClick={() => toast.info("Funcionalidade WhatsApp em desenvolvimento.")}>
              Em Desenvolvimento
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messenger</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Gerencie conversas e automações no Facebook Messenger.
            </p>
            <Button className="mt-4 w-full" variant="outline" onClick={() => toast.info("Funcionalidade Messenger em desenvolvimento.")}>
              Em Desenvolvimento
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instagram Direct</CardTitle>
            <Instagram className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Interaja com clientes e automatize respostas no Instagram Direct.
            </p>
            <Button className="mt-4 w-full" variant="outline" onClick={() => toast.info("Funcionalidade Instagram Direct em desenvolvimento.")}>
              Em Desenvolvimento
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-6">
        <div className="flex flex-col items-center gap-1 text-center p-4">
          <h3 className="text-2xl font-bold tracking-tight">
            Integrações de Comunicação
          </h3>
          <p className="text-sm text-muted-foreground">
            Em breve, você poderá gerenciar toda a comunicação com seus clientes em um só lugar.
          </p>
        </div>
      </div>
    </MasterDashboardLayout>
  );
};

export default CommunicationPage;