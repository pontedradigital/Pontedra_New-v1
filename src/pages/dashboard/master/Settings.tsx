import React, { useState } from "react";
import MasterDashboardLayout from "@/components/layouts/MasterDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings as SettingsIcon, Upload } from "lucide-react";

const SettingsPage = () => {
  const [companyInfo, setCompanyInfo] = useState({
    name: "Dyad SaaS Ltda.",
    email: "contato@dyadsaas.com",
    phone: "5511999998888",
    address: "Rua Exemplo, 123 - Cidade, Estado",
    logoUrl: "https://via.placeholder.com/150",
  });
  const [systemParams, setSystemParams] = useState({
    clientLimit: 1000,
    activePlan: "Premium",
  });

  const handleCompanyInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyInfo({ ...companyInfo, [e.target.id]: e.target.value });
  };

  const handleSystemParamsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSystemParams({ ...systemParams, [e.target.id]: e.target.value });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Configurações salvas com sucesso!");
    console.log("Company Info:", companyInfo);
    console.log("System Params:", systemParams);
  };

  const handleExportReports = () => {
    toast.info("Exportando relatórios (funcionalidade simulada).");
  };

  return (
    <MasterDashboardLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Configurações Gerais</h1>
      </div>

      <form onSubmit={handleSaveSettings} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
            <CardDescription>Atualize os detalhes da sua empresa.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Empresa</Label>
              <Input id="name" value={companyInfo.name} onChange={handleCompanyInfoChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail de Contato</Label>
              <Input id="email" type="email" value={companyInfo.email} onChange={handleCompanyInfoChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={companyInfo.phone} onChange={handleCompanyInfoChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" value={companyInfo.address} onChange={handleCompanyInfoChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="logoUrl">URL do Logo</Label>
              <div className="flex items-center gap-2">
                <Input id="logoUrl" value={companyInfo.logoUrl} onChange={handleCompanyInfoChange} />
                <Button type="button" variant="outline" size="sm" onClick={() => toast.info("Upload de logo (simulado)")}>
                  <Upload className="h-4 w-4 mr-2" /> Upload
                </Button>
              </div>
              {companyInfo.logoUrl && (
                <img src={companyInfo.logoUrl} alt="Logo da Empresa" className="mt-2 h-16 object-contain" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parâmetros do Sistema</CardTitle>
            <CardDescription>Defina configurações operacionais da plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="clientLimit">Limite de Clientes</Label>
              <Input id="clientLimit" type="number" value={systemParams.clientLimit} onChange={handleSystemParamsChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="activePlan">Plano Ativo</Label>
              <select
                id="activePlan"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={systemParams.activePlan}
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

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleExportReports}>
            Exportar Relatórios
          </Button>
          <Button type="submit">Salvar Configurações</Button>
        </div>
      </form>
    </MasterDashboardLayout>
  );
};

export default SettingsPage;