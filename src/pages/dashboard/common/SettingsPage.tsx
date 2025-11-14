import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Settings as SettingsIcon, Building, MapPin, CalendarDays } from 'lucide-react';
import WhatsAppNumberSettingCard from '@/components/dashboard/master/WhatsAppNumberSettingCard'; // NOVO: Importar o novo componente

export default function SettingsPage() {
  const { user, profile, loading, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyOrganization, setCompanyOrganization] = useState(''); // NOVO
  const [addressStreet, setAddressStreet] = useState('');             // NOVO
  const [addressNumber, setAddressNumber] = useState('');             // NOVO
  const [addressComplement, setAddressComplement] = useState('');     // NOVO
  const [addressNeighborhood, setAddressNeighborhood] = useState(''); // NOVO
  const [addressCity, setAddressCity] = useState('');                 // NOVO
  const [addressState, setAddressState] = useState('');               // NOVO
  const [addressCep, setAddressCep] = useState('');                   // NOVO
  const [dateOfBirth, setDateOfBirth] = useState('');                 // NOVO
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile && user) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(user.email || '');
      setPhone(profile.telefone || '');
      setCompanyOrganization(profile.company_organization || ''); // NOVO
      setAddressStreet(profile.address_street || '');             // NOVO
      setAddressNumber(profile.address_number || '');             // NOVO
      setAddressComplement(profile.address_complement || '');     // NOVO
      setAddressNeighborhood(profile.address_neighborhood || ''); // NOVO
      setAddressCity(profile.address_city || '');                 // NOVO
      setAddressState(profile.address_state || '');               // NOVO
      setAddressCep(profile.address_cep || '');                   // NOVO
      setDateOfBirth(profile.date_of_birth || '');                // NOVO
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

  const formatarCep = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 5) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
    }
    return cleaned;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await updateProfile({
      first_name: firstName,
      last_name: lastName,
      email: email,
      telefone: phone,
      company_organization: companyOrganization, // NOVO
      address_street: addressStreet,             // NOVO
      address_number: addressNumber,             // NOVO
      address_complement: addressComplement,     // NOVO
      address_neighborhood: addressNeighborhood, // NOVO
      address_city: addressCity,                 // NOVO
      address_state: addressState,               // NOVO
      address_cep: addressCep,                   // NOVO
      date_of_birth: dateOfBirth,                // NOVO
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
                <Label htmlFor="telefone" className="text-foreground">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="telefone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatarTelefone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="pl-10 bg-background border-border text-foreground focus:ring-primary"
                  />
                </div>
              </div>

              {/* Novos Campos Opcionais */}
              <div className="space-y-2">
                <Label htmlFor="company_organization" className="text-foreground">Empresa/Organização</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="company_organization"
                    value={companyOrganization}
                    onChange={(e) => setCompanyOrganization(e.target.value)}
                    placeholder="Nome da sua empresa"
                    className="pl-10 bg-background border-border text-foreground focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth" className="text-foreground">Data de Nascimento</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address_street" className="text-foreground">Endereço</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="address_street"
                    value={addressStreet}
                    onChange={(e) => setAddressStreet(e.target.value)}
                    placeholder="Rua, Avenida, etc."
                    className="pl-10 bg-background border-border text-foreground focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_number" className="text-foreground">Número</Label>
                  <Input
                    id="address_number"
                    value={addressNumber}
                    onChange={(e) => setAddressNumber(e.target.value)}
                    placeholder="123"
                    className="bg-background border-border text-foreground focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_complement" className="text-foreground">Complemento</Label>
                  <Input
                    id="address_complement"
                    value={addressComplement}
                    onChange={(e) => setAddressComplement(e.target.value)}
                    placeholder="Apto, Bloco, etc."
                    className="bg-background border-border text-foreground focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_neighborhood" className="text-foreground">Bairro</Label>
                  <Input
                    id="address_neighborhood"
                    value={addressNeighborhood}
                    onChange={(e) => setAddressNeighborhood(e.target.value)}
                    placeholder="Seu bairro"
                    className="bg-background border-border text-foreground focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_city" className="text-foreground">Cidade</Label>
                  <Input
                    id="address_city"
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    placeholder="Sua cidade"
                    className="bg-background border-border text-foreground focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_state" className="text-foreground">Estado</Label>
                  <Input
                    id="address_state"
                    value={addressState}
                    onChange={(e) => setAddressState(e.target.value)}
                    placeholder="Seu estado"
                    className="bg-background border-border text-foreground focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_cep" className="text-foreground">CEP</Label>
                  <Input
                    id="address_cep"
                    value={addressCep}
                    onChange={(e) => setAddressCep(formatarCep(e.target.value))}
                    maxLength={9}
                    placeholder="00000-000"
                    className="bg-background border-border text-foreground focus:ring-primary"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md">
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* WhatsAppNumberSettingCard - Visível apenas para Master */}
        {profile.role === 'master' && (
          <WhatsAppNumberSettingCard />
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