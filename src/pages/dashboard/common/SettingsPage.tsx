import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Settings as SettingsIcon } from 'lucide-react';
import DefaultTaxSettingCard from '@/components/dashboard/master/DefaultTaxSettingCard'; // Importar o novo componente

export default function SettingsPage() {
  const { user, profile, loading, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile && user) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(user.email || '');
      setPhone(profile.telefone || '');
    }
  }, [profile, user]);

  const formatarTelefone = (value: string) => {
    const numero = value.replace(/\D/g, '');
    if (numero.length <= 11) {
      return numero
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return phone;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await updateProfile({
      first_name: firstName,
      last_name: lastName,
      email: email,
      telefone: phone,
    });
    setIsSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-[#9ba8b5]">Carregando configurações...</div>
      </DashboardLayout>
    );
  }

  if (!user || !profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-destructive">Erro ao carregar perfil. Por favor, faça login novamente.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 max-w-3xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-8">
          <SettingsIcon className="w-10 h-10 text-[#57e389]" />
          <h1 className="text-4xl font-bold text-foreground">Configurações</h1>
        </div>

        {/* Seção de Perfil */}
        <Card className="bg-card border-border shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">Meu Perfil</CardTitle>
            <CardDescription className="text-muted-foreground">
              Gerencie suas informações pessoais e de contato.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-foreground">Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="first_name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10 bg-background border-border text-foreground focus:ring-primary"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-foreground">Sobrenome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="last_name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="pl-10 bg-background border-border text-foreground focus:ring-primary"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground focus:ring-primary"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Atenção: A alteração do e-mail requer confirmação por e-mail.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatarTelefone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="pl-10 bg-background border-border text-foreground focus:ring-primary"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md">
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Seção de Imposto Padrão (apenas para Master) */}
        {profile.role === 'master' && (
          <DefaultTaxSettingCard />
        )}

        {/* Outras Configurações (Placeholder) */}
        <Card className="bg-card border-border shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-foreground">Outras Configurações</CardTitle>
            <CardDescription className="text-muted-foreground">
              Ajuste outras preferências da sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notification-toggle" className="text-foreground">Receber Notificações por E-mail</Label>
              {/* Exemplo de um switch de shadcn/ui */}
              <Button variant="outline" size="sm" className="bg-background border-border text-foreground">Ativar/Desativar</Button>
            </div>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-select" className="text-foreground">Tema da Interface</Label>
              {/* Exemplo de um select de shadcn/ui */}
              <Button variant="outline" size="sm" className="bg-background border-border text-foreground">Escuro (Padrão)</Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Mais opções de configuração serão adicionadas aqui em breve!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}