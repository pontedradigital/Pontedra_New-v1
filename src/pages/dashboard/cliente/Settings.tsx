import React, { useState } from "react";
import ClientDashboardLayout from "@/components/layouts/ClientDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useMockData } from "@/context/MockContext";

const ClientSettingsPage = () => {
  const { user } = useAuth();
  const { clientNotificationSettings, clientPrivacySettings, updateClientNotificationSettings, updateClientPrivacySettings, isLoading } = useMockData();

  const [localNotificationSettings, setLocalNotificationSettings] = useState(clientNotificationSettings);
  const [localPrivacySettings, setLocalPrivacySettings] = useState(clientPrivacySettings);

  React.useEffect(() => {
    setLocalNotificationSettings(clientNotificationSettings);
    setLocalPrivacySettings(clientPrivacySettings);
  }, [clientNotificationSettings, clientPrivacySettings]);

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalNotificationSettings({ ...localNotificationSettings, [e.target.id]: e.target.checked });
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPrivacySettings({ ...localPrivacySettings, [e.target.id]: e.target.checked });
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateClientNotificationSettings(localNotificationSettings);
      await updateClientPrivacySettings(localPrivacySettings);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar configurações.");
    }
  };

  return (
    <ClientDashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Configurações</h1>
      </div>

      <form onSubmit={handleSaveChanges} className="grid gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-foreground">Notificações</CardTitle>
              <CardDescription className="text-muted-foreground">Gerencie como você recebe as notificações.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center space-x-2">
                <input
                  id="emailNotifications"
                  type="checkbox"
                  checked={localNotificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded bg-background"
                />
                <Label htmlFor="emailNotifications" className="text-foreground">Notificações por E-mail</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="smsNotifications"
                  type="checkbox"
                  checked={localNotificationSettings.smsNotifications}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded bg-background"
                />
                <Label htmlFor="smsNotifications" className="text-foreground">Notificações por SMS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="whatsappNotifications"
                  type="checkbox"
                  checked={localNotificationSettings.whatsappNotifications}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded bg-background"
                />
                <Label htmlFor="whatsappNotifications" className="text-foreground">Notificações por WhatsApp</Label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-foreground">Privacidade</CardTitle>
              <CardDescription className="text-muted-foreground">Controle suas preferências de privacidade.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center space-x-2">
                <input
                  id="dataSharing"
                  type="checkbox"
                  checked={localPrivacySettings.dataSharing}
                  onChange={handlePrivacyChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded bg-background"
                />
                <Label htmlFor="dataSharing" className="text-foreground">Compartilhamento de Dados com Terceiros</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="marketingEmails"
                  type="checkbox"
                  checked={localPrivacySettings.marketingEmails}
                  onChange={handlePrivacyChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded bg-background"
                />
                <Label htmlFor="marketingEmails" className="text-foreground">Receber E-mails de Marketing</Label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-end"
        >
          <Button type="submit" disabled={isLoading} className="uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20">
            {isLoading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </motion.div>
      </form>
    </ClientDashboardLayout>
  );
};

export default ClientSettingsPage;