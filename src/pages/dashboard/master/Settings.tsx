import React, { useState } from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings as SettingsIcon, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useMockData } from "@/context/MockContext";

const SettingsPage = () => {
  const { companyInfo, systemParams, updateCompanyInfo, updateSystemParams, isLoading } = useMockData();
  const [localCompanyInfo, setLocalCompanyInfo] = useState(companyInfo);
  const [localSystemParams, setLocalSystemParams] = useState(systemParams);

  React.useEffect(() => {
    setLocalCompanyInfo(companyInfo);
    setLocalSystemParams(systemParams);
  }, [companyInfo, systemParams]);

  const handleCompanyInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalCompanyInfo({ ...localCompanyInfo, [e.target.id]: e.target.value });
  };

  const handleSystemParamsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setLocalSystemParams({ ...localSystemParams, [e.target.id]: e.target.value });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCompanyInfo(localCompanyInfo);
      await updateSystemParams(localSystemParams);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar configurações.");
    }
  };

  const handleExportReports = () => {
    toast.info("Exportando relatórios (funcionalidade simulada).");
  };

  return (
    <MasterDashboardLayout>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground">Configurações Gerais</h1>
      </div>

      <form onSubmit={handleSaveSettings} className="grid gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-card border-border shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-foreground">Informações da Empresa</CardTitle>
              <CardDescription className="text-muted-foreground">Atualize os detalhes da sua empresa.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-foreground">Nome da Empresa</Label>
                <Input id="name" value={localCompanyInfo.name} onChange={handleCompanyInfoChange} className="bg-background border-border text-foreground focus:ring-primary" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-foreground">E-mail de Contato</Label>
                <Input id="email" type="email" value={localCompanyInfo.email} onChange={handleCompanyInfoChange} className="bg-background border-border text-foreground focus:ring-primary" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-foreground">Telefone</Label>
                <Input id="phone" value={localCompanyInfo.phone} onChange={handleCompanyInfoChange} className="bg-background border-border text-foreground focus:ring-primary" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address" className="text-foreground">Endereço</Label>
                <Input id="address" value={localCompanyInfo.address} onChange={handleCompanyInfoChange} className="bg-background border-border text-foreground focus:ring-primary" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="logoUrl" className="text-foreground">URL do Logo</Label>
                <div className="flex items-center gap-2">
                  <Input id="logoUrl" value={localCompanyInfo.logoUrl} onChange={handleCompanyInfoChange} className="flex-1 bg-background border-border text-foreground focus:ring-primary" />
                  <Button type="button" variant="outline" size="sm" className="bg-background border-border text-foreground hover:bg-muted" onClick={() => toast.info("Upload de logo (simulado)")}>
                    <Upload className="h-4 w-4 mr-2" /> Upload
                  </Button>
                </div>
                {localCompanyInfo.logoUrl && (
                  <img src={localCompanyInfo.logoUrl} alt="Logo da Empresa" className="mt-2 h-16 object-contain rounded-md border border-border p-1" />
                )}
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
              <CardTitle className="text-foreground">Parâmetros do Sistema</CardTitle>
              <CardDescription className="text-muted-foreground">Defina configurações operacionais da plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="clientLimit" className="text-foreground">Limite de Clientes</Label>
                <Input id="clientLimit" type="number" value={localSystemParams.clientLimit} onChange={handleSystemParamsChange} className="bg-background border-border text-foreground focus:ring-primary" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="activePlan" className="text-foreground">Plano Ativo</Label>
                <select
                  id="activePlan"
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                  value={localSystemParams.activePlan}
                  onChange={handleSystemParamsChange}
                >
                  <option value="Free">Grátis</option>
                  <option value="Basic">Básico</option>
                  <option value="Premium">Premium</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-end gap-2"
        >
          <Button type="button" variant="outline" className="bg-background border-border text-foreground hover:bg-muted" onClick={handleExportReports}>
            Exportar Relatórios
          </Button>
          <Button type="submit" disabled={isLoading} className="uppercase bg-primary text-background hover:bg-primary/90 shadow-md shadow-primary/20">
            {isLoading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </motion.div>
      </form>
    </MasterDashboardLayout>
  );
};

export default SettingsPage;