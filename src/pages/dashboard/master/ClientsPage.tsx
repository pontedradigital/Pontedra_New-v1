import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Loader2,
  Edit,
  Trash2,
  ChevronDown,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  CalendarDays,
  Clock,
  Save,
  XCircle,
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ClientDetailsPopup from '@/components/dashboard/master/ClientDetailsPopup'; // Importar o novo componente

// Tipos de dados para o perfil do usuário (atualizado)
interface UserProfile {
  id: string;
  client_id: string | null; // NOVO: Adicionado client_id
  first_name: string | null;
  last_name: string | null;
  telefone: string | null;
  role: 'prospect' | 'client' | 'master';
  status: 'ativo' | 'inativo';
  company_organization: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_cep: string | null;
  date_of_birth: string | null; // Formato 'YYYY-MM-DD'
  created_at: string;
  email: string; // Adicionado para facilitar a exibição
}

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // Renomeado para evitar conflito
  const [editingClient, setEditingClient] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'prospect' | 'client' | 'master'>('all');

  const [isDetailsPopupOpen, setIsDetailsPopupOpen] = useState(false); // Estado para o pop-up de detalhes
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<UserProfile | null>(null); // Cliente para exibir no pop-up

  // Fetch all user profiles
  const { data: profilesData, isLoading, isError, error } = useQuery<Omit<UserProfile, 'email'>[], Error>({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          client_id, -- NOVO: Selecionar client_id
          first_name,
          last_name,
          telefone,
          role,
          status,
          company_organization,
          address_street,
          address_number,
          address_complement,
          address_neighborhood,
          address_city,
          address_state,
          address_cep,
          date_of_birth,
          created_at
        `);

      if (profilesError) throw profilesError;
      return profiles;
    },
  });

  // Fetch emails via Edge Function
  const { data: emailsMap, isLoading: isLoadingEmails } = useQuery<Record<string, string>, Error>({
    queryKey: ['clientEmails', profilesData?.map(p => p.id)],
    queryFn: async ({ queryKey }) => {
      const userIds = queryKey[1] as string[];
      if (!userIds || userIds.length === 0) return {};

      const { data, error } = await supabase.functions.invoke('get-user-emails', {
        body: { userIds },
      });

      if (error) throw error;
      return data as Record<string, string>;
    },
    enabled: !!profilesData && profilesData.length > 0,
    staleTime: 5 * 60 * 1000, // Cache emails for 5 minutes
  });

  // Combine profiles with emails
  const clients = useMemo(() => {
    if (!profilesData) return [];
    return profilesData.map(profile => ({
      ...profile,
      email: emailsMap?.[profile.id] || 'N/A',
    }));
  }, [profilesData, emailsMap]);

  // Mutation to update a client profile
  const updateClientMutation = useMutation<void, Error, Partial<UserProfile>>({
    mutationFn: async (updates) => {
      if (!updates.id) throw new Error("ID do cliente é necessário para atualização.");

      const { email, ...profileUpdates } = updates; // Separar email dos outros campos do perfil

      // Atualizar auth.users para o email, se houver mudança
      if (email && editingClient?.email !== email) {
        const { error: authError } = await supabase.auth.admin.updateUserById(updates.id, { email });
        if (authError) throw new Error(`Erro ao atualizar e-mail: ${authError.message}`);
      }

      // Atualizar public.profiles para os outros campos
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', updates.id);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientEmails'] }); // Invalidate emails cache too
      toast.success('Perfil do cliente atualizado com sucesso!');
      setIsEditDialogOpen(false);
      setEditingClient(null);
      setFormData({});
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar perfil: ${err.message}`);
    },
  });

  // Mutation to delete a client profile
  const deleteClientMutation = useMutation<void, Error, string>({
    mutationFn: async (clientId) => {
      // Nota: Deletar o perfil em `public.profiles` com `ON DELETE CASCADE` no FK
      // deve automaticamente deletar o usuário em `auth.users`.
      // Se não, seria necessário usar `supabase.auth.admin.deleteUser(clientId)`.
      const { error } = await supabase.from('profiles').delete().eq('id', clientId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientEmails'] }); // Invalidate emails cache too
      toast.success('Cliente excluído com sucesso!');
    },
    onError: (err) => {
      toast.error(`Erro ao excluir cliente: ${err.message}`);
    },
  });

  const handleOpenEditDialog = (client: UserProfile) => {
    setEditingClient(client);
    setFormData({
      ...client,
      date_of_birth: client.date_of_birth ? format(parseISO(client.date_of_birth), 'yyyy-MM-dd') : '', // Formata para input date
    });
    setIsEditDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient?.id) {
      toast.error("Erro: ID do cliente não encontrado para atualização.");
      return;
    }
    updateClientMutation.mutate({ id: editingClient.id, ...formData });
  };

  const formatPhoneNumber = (value: string | null) => {
    if (!value) return 'N/A';
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    }
    return value;
  };

  const formatCep = (value: string | null) => {
    if (!value) return 'N/A';
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
    }
    return value;
  };

  const calculateDaysSinceRegistration = (createdAt: string) => {
    const createdDate = parseISO(createdAt);
    const today = new Date();
    return differenceInDays(today, createdDate);
  };

  const filteredClients = useMemo(() => {
    return clients?.filter(client => {
      const matchesRole = filterRole === 'all' || client.role === filterRole;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        client.first_name?.toLowerCase().includes(searchLower) ||
        client.last_name?.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.telefone?.toLowerCase().includes(searchLower) ||
        client.company_organization?.toLowerCase().includes(searchLower) ||
        client.address_city?.toLowerCase().includes(searchLower) ||
        client.address_state?.toLowerCase().includes(searchLower) ||
        client.client_id?.toLowerCase().includes(searchLower); // NOVO: Busca por client_id
      return matchesRole && matchesSearch;
    });
  }, [clients, searchTerm, filterRole]);

  const handleRowClick = (client: UserProfile) => {
    setSelectedClientForDetails(client);
    setIsDetailsPopupOpen(true);
  };

  if (isLoading || isLoadingEmails) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-[#9ba8b5]">
          <Loader2 className="w-8 h-8 animate-spin mr-3" /> Carregando clientes...
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-destructive">
          Erro ao carregar clientes: {error?.message}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <Users className="w-10 h-10 text-[#57e389]" />
          <h1 className="text-4xl font-bold text-foreground">Gerenciar Clientes</h1>
        </div>
        <p className="text-lg text-[#9ba8b5]">
          Visualize e gerencie todos os perfis de usuários cadastrados na plataforma.
        </p>

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar por nome, e-mail, telefone, empresa, cidade ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-card border-border text-foreground">
                Filtrar por Papel: {filterRole === 'all' ? 'Todos' : filterRole.charAt(0).toUpperCase() + filterRole.slice(1)} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border text-popover-foreground">
              <DropdownMenuItem onClick={() => setFilterRole('all')}>Todos</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterRole('prospect')}>Prospect</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterRole('client')}>Cliente</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterRole('master')}>Master</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabela de Clientes */}
        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead className="text-muted-foreground">ID</TableHead> {/* NOVO: Coluna ID */}
                <TableHead className="text-muted-foreground">NOME</TableHead>
                <TableHead className="text-muted-foreground">CONTATO</TableHead>
                <TableHead className="text-muted-foreground">EMPRESA/ENDEREÇO</TableHead>
                <TableHead className="text-muted-foreground">PAPEL</TableHead>
                <TableHead className="text-muted-foreground">CADASTRO</TableHead>
                <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients && filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10 cursor-pointer" onClick={() => handleRowClick(client)}>
                    <TableCell className="font-medium text-foreground py-4">{client.client_id || 'N/A'}</TableCell> {/* NOVO: Exibir client_id */}
                    <TableCell className="font-medium text-foreground py-4">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-primary" />
                        <div>
                          <p>{client.first_name} {client.last_name}</p>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground py-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" /> {formatPhoneNumber(client.telefone)}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground py-4">
                      {client.company_organization && (
                        <div className="flex items-center gap-2 mb-1">
                          <Building className="w-4 h-4" /> {client.company_organization}
                        </div>
                      )}
                      {client.address_city && client.address_state && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> {client.address_city} - {client.address_state}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-4 capitalize text-primary font-semibold">
                      {client.role}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" /> {format(parseISO(client.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <Clock className="w-4 h-4" /> Há {calculateDaysSinceRegistration(client.created_at)} dias
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenEditDialog(client); }} className="text-primary hover:text-primary/80">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteClientMutation.mutate(client.id); }} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog para Editar Cliente */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                Editar Cliente: {editingClient?.first_name} {editingClient?.last_name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Atualize as informações do perfil do cliente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
              {/* Campo de ID do Cliente (somente leitura) */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="client_id">ID do Cliente</Label>
                <Input
                  id="client_id"
                  name="client_id"
                  value={editingClient?.client_id || 'N/A'}
                  readOnly
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>

              {/* Campos Obrigatórios */}
              <div className="space-y-2">
                <Label htmlFor="first_name">Nome</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleFormChange}
                  className="bg-background border-border text-foreground"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Sobrenome</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name || ''}
                  onChange={handleFormChange}
                  className="bg-background border-border text-foreground"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleFormChange}
                  className="bg-background border-border text-foreground"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  value={formData.telefone || ''}
                  onChange={handleFormChange}
                  placeholder="(00) 00000-0000"
                  className="bg-background border-border text-foreground"
                />
              </div>

              {/* Campos Opcionais */}
              <div className="space-y-2">
                <Label htmlFor="company_organization">Empresa/Organização</Label>
                <Input
                  id="company_organization"
                  name="company_organization"
                  value={formData.company_organization || ''}
                  onChange={handleFormChange}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Data de Nascimento</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={handleFormChange}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address_street">Endereço</Label>
                <Input
                  id="address_street"
                  name="address_street"
                  value={formData.address_street || ''}
                  onChange={handleFormChange}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_number">Número</Label>
                <Input
                  id="address_number"
                  name="address_number"
                  value={formData.address_number || ''}
                  onChange={handleFormChange}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_complement">Complemento</Label>
                <Input
                  id="address_complement"
                  name="address_complement"
                  value={formData.address_complement || ''}
                  onChange={handleFormChange}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_neighborhood">Bairro</Label>
                <Input
                  id="address_neighborhood"
                  name="address_neighborhood"
                  value={formData.address_neighborhood || ''}
                  onChange={handleFormChange}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_city">Cidade</Label>
                <Input
                  id="address_city"
                  name="address_city"
                  value={formData.address_city || ''}
                  onChange={handleFormChange}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_state">Estado</Label>
                <Input
                  id="address_state"
                  name="address_state"
                  value={formData.address_state || ''}
                  onChange={handleFormChange}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_cep">CEP</Label>
                <Input
                  id="address_cep"
                  name="address_cep"
                  value={formData.address_cep || ''}
                  onChange={handleFormChange}
                  className="bg-background border-border text-foreground"
                />
              </div>

              {/* Campo de Papel (Role) */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="role">Papel</Label>
                <Select
                  name="role"
                  value={formData.role || 'prospect'}
                  onValueChange={(value) => handleSelectChange('role', value as UserProfile['role'])}
                >
                  <SelectTrigger className="w-full bg-background border-border text-foreground">
                    <SelectValue placeholder="Selecione o Papel" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="md:col-span-2 mt-6">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="bg-background border-border text-foreground hover:bg-muted">
                  <XCircle className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button type="submit" disabled={updateClientMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {updateClientMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Pop-up de Detalhes do Cliente */}
        <ClientDetailsPopup
          isOpen={isDetailsPopupOpen}
          onClose={() => setIsDetailsPopupOpen(false)}
          client={selectedClientForDetails}
        />
      </motion.div>
    </DashboardLayout>
  );
}