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
  PlusCircle, // Adicionado para o botão de adicionar
  Lock, // Adicionado para campos de senha
  Eye, // Adicionado para visibilidade da senha
  EyeOff, // Adicionado para visibilidade da senha
  RefreshCw, // NOVO: Ícone para o botão de atualizar
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ClientDetailsPopup from '@/components/dashboard/master/ClientDetailsPopup'; // Importar o novo componente
import { v4 as uuidv4 } from 'uuid'; // Importar uuid para gerar senhas temporárias

// Tipos de dados para o perfil do usuário (completo)
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

// Função para gerar uma senha temporária
const generateTemporaryPassword = () => {
  return uuidv4().replace(/-/g, '').substring(0, 12); // 12 caracteres alfanuméricos
};

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'prospect' | 'client' | 'master'>('all');

  const [isDetailsPopupOpen, setIsDetailsPopupOpen] = useState(false);
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<UserProfile | null>(null);

  // NOVO: Estados para o diálogo de criação de cliente
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newClientFormData, setNewClientFormData] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirmPassword: string;
    telefone: string;
    company_organization: string;
    address_street: string;
    address_number: string;
    address_complement: string;
    address_neighborhood: string;
    address_city: string;
    address_state: string;
    address_cep: string;
    date_of_birth: string;
    role: 'prospect' | 'client' | 'master'; // Adicionado role
    status: 'ativo' | 'inativo'; // Adicionado status
  }>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefone: '',
    company_organization: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_cep: '',
    date_of_birth: '',
    role: 'prospect', // Default role
    status: 'ativo', // Default status
  });
  const [showNewClientPassword, setShowNewClientPassword] = useState(false);
  const [showNewClientConfirmPassword, setShowNewClientConfirmPassword] = useState(false);

  // Fetch all user profiles
  const { data: profilesData, isLoading, isError, error, refetch } = useQuery<Omit<UserProfile, 'email'>[], Error>({ // Adicionado refetch
    queryKey: ['clients'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          client_id,
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

  // NOVO: Mutation to create a new client (user and profile)
  const createClientMutation = useMutation<void, Error, typeof newClientFormData>({
    mutationFn: async (clientData) => {
      if (clientData.password !== clientData.confirmPassword) {
        throw new Error("As senhas não coincidem.");
      }

      const tempPassword = clientData.password; // Usar a senha fornecida pelo master
      const userMetadata = {
        first_name: clientData.first_name,
        last_name: clientData.last_name || null, // Sobrenome agora é opcional
        telefone: clientData.telefone || null,
        company_organization: clientData.company_organization || null,
        address_street: clientData.address_street || null,
        address_number: clientData.address_number || null,
        address_complement: clientData.address_complement || null,
        address_neighborhood: clientData.address_neighborhood || null,
        address_city: clientData.address_city || null,
        address_state: clientData.address_state || null,
        address_cep: clientData.address_cep || null,
        date_of_birth: clientData.date_of_birth || null,
        role: clientData.role, // Passa o papel para o trigger handle_new_user
        status: clientData.status, // Passa o status para o trigger handle_new_user
      };

      // Chamar a Edge Function para criar o usuário sem verificação
      const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('create-unverified-user', {
        body: {
          email: clientData.email,
          password: tempPassword,
          user_metadata: userMetadata,
        },
      });

      if (edgeFunctionError) {
        const specificErrorMessage = (edgeFunctionError as any)?.context?.data?.error || edgeFunctionError.message;
        throw new Error(`Falha ao criar novo usuário: ${specificErrorMessage}`);
      }
      if (!edgeFunctionData || !edgeFunctionData.userId) {
        throw new Error("Falha ao criar novo usuário: Edge Function não retornou ID do usuário.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientEmails'] });
      toast.success('Cliente criado com sucesso!');
      setIsCreateDialogOpen(false);
      setNewClientFormData({
        first_name: '', last_name: '', email: '', password: '', confirmPassword: '',
        telefone: '', company_organization: '', address_street: '', address_number: '',
        address_complement: '', address_neighborhood: '', address_city: '', address_state: '',
        address_cep: '', date_of_birth: '', role: 'prospect', status: 'ativo',
      });
    },
    onError: (err: any) => {
      console.error("Erro completo da mutação de criação de cliente:", err);
      let errorMessage = "Erro desconhecido ao criar cliente.";
      if (err && err.message) {
        errorMessage = err.message;
      }
      toast.error(`Erro ao criar cliente: ${errorMessage}`);
    },
  });

  // Mutation to delete a client profile using the Edge Function
  const deleteClientMutation = useMutation<void, Error, string>({
    mutationFn: async (clientId) => {
      // Chamar a Edge Function para deletar o usuário
      const { data, error } = await supabase.functions.invoke('delete-user-and-profile', {
        body: { userId: clientId },
      });

      if (error) {
        throw error;
      }
      if (data && !data.success) {
        throw new Error(data.error || "Falha ao deletar usuário via Edge Function.");
      }
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

  // NOVO: Funções para o formulário de criação de cliente
  const handleOpenCreateDialog = () => {
    setNewClientFormData({
      first_name: '', last_name: '', email: '', password: '', confirmPassword: '',
      telefone: '', company_organization: '', address_street: '', address_number: '',
      address_complement: '', address_neighborhood: '', address_city: '', address_state: '',
      address_cep: '', date_of_birth: '', role: 'prospect', status: 'ativo',
    });
    setShowNewClientPassword(false);
    setShowNewClientConfirmPassword(false);
    setIsCreateDialogOpen(true);
  };

  const handleNewClientFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewClientFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewClientSelectChange = (name: string, value: string) => {
    setNewClientFormData(prev => ({
      ...prev,
      [name]: value as any, // Cast para aceitar os tipos de role/status
    }));
  };

  const handleCreateClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createClientMutation.mutate(newClientFormData);
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

  // NOVO: Função para atualizar os dados dos clientes
  const handleRefreshClients = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] }); // Invalida a query 'clients'
    queryClient.invalidateQueries({ queryKey: ['clientEmails'] }); // Invalida a query de emails
    toast.info("Atualizando lista de clientes...");
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Users className="w-10 h-10 text-[#57e389]" />
            <h1 className="text-4xl font-bold text-foreground">Gerenciar Clientes</h1>
          </div>
          <div className="flex gap-2"> {/* Container para os botões */}
            <Button onClick={handleRefreshClients} className="bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md">
              <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
            </Button>
            <Button onClick={handleOpenCreateDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Cliente
            </Button>
          </div>
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
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteClientMutation.mutate(client.id); }} className="text-destructive hover:text-destructive/80" disabled={client.role === 'master'}>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="address_number">Número</Label>
                  <Input
                    id="address_number"
                    name="address_number"
                    value={formData.address_number || ''}
                    onChange={handleFormChange}
                    placeholder="123"
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
                    placeholder="Apto, Bloco, etc."
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="address_neighborhood">Bairro</Label>
                  <Input
                    id="address_neighborhood"
                    name="address_neighborhood"
                    value={formData.address_neighborhood || ''}
                    onChange={handleFormChange}
                    placeholder="Seu bairro"
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
                    placeholder="Sua cidade"
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="address_state">Estado</Label>
                  <Input
                    id="address_state"
                    name="address_state"
                    value={formData.address_state || ''}
                    onChange={handleFormChange}
                    placeholder="Seu estado"
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
                    maxLength={9}
                    placeholder="00000-000"
                    className="bg-background border-border text-foreground"
                  />
                </div>
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

        {/* NOVO: Dialog para Criar Cliente */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                Adicionar Novo Cliente
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Preencha os detalhes para criar uma nova conta de cliente. Uma senha temporária será gerada.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClientSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-client-first_name">Nome *</Label>
                <Input
                  id="new-client-first_name"
                  name="first_name"
                  value={newClientFormData.first_name}
                  onChange={handleNewClientFormChange}
                  className="bg-background border-border text-foreground"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-client-last_name">Sobrenome</Label> {/* Removido o asterisco */}
                <Input
                  id="new-client-last_name"
                  name="last_name"
                  value={newClientFormData.last_name}
                  onChange={handleNewClientFormChange}
                  className="bg-background border-border text-foreground"
                  // Removido o atributo 'required'
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-client-email">E-mail *</Label>
                <Input
                  id="new-client-email"
                  name="email"
                  type="email"
                  value={newClientFormData.email}
                  onChange={handleNewClientFormChange}
                  className="bg-background border-border text-foreground"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-client-telefone">Telefone</Label>
                <Input
                  id="new-client-telefone"
                  name="telefone"
                  type="tel"
                  value={newClientFormData.telefone}
                  onChange={handleNewClientFormChange}
                  placeholder="(00) 00000-0000"
                  className="bg-background border-border text-foreground"
                />
              </div>

              {/* Senha e Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="new-client-password">Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="new-client-password"
                    name="password"
                    type={showNewClientPassword ? "text" : "password"}
                    value={newClientFormData.password}
                    onChange={handleNewClientFormChange}
                    className="pl-10 bg-background border-border text-foreground focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewClientPassword(!showNewClientPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showNewClientPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-client-confirmPassword">Confirmar Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="new-client-confirmPassword"
                    name="confirmPassword"
                    type={showNewClientConfirmPassword ? "text" : "password"}
                    value={newClientFormData.confirmPassword}
                    onChange={handleNewClientFormChange}
                    className="pl-10 bg-background border-border text-foreground focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewClientConfirmPassword(!showNewClientConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showNewClientConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Campos Opcionais */}
              <div className="space-y-2">
                <Label htmlFor="new-client-company_organization">Empresa/Organização</Label>
                <Input
                  id="new-client-company_organization"
                  name="company_organization"
                  value={newClientFormData.company_organization}
                  onChange={handleNewClientFormChange}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-client-date_of_birth">Data de Nascimento</Label>
                <Input
                  id="new-client-date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={newClientFormData.date_of_birth}
                  onChange={handleNewClientFormChange}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="new-client-address_street">Endereço</Label>
                <Input
                  id="new-client-address_street"
                  name="address_street"
                  value={newClientFormData.address_street}
                  onChange={handleNewClientFormChange}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="new-client-address_number">Número</Label>
                  <Input
                    id="new-client-address_number"
                    name="address_number"
                    value={newClientFormData.address_number}
                    onChange={handleNewClientFormChange}
                    placeholder="123"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-client-address_complement">Complemento</Label>
                  <Input
                    id="new-client-address_complement"
                    name="address_complement"
                    value={newClientFormData.address_complement}
                    onChange={handleNewClientFormChange}
                    placeholder="Apto, Bloco, etc."
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="new-client-address_neighborhood">Bairro</Label>
                  <Input
                    id="new-client-address_neighborhood"
                    name="address_neighborhood"
                    value={newClientFormData.address_neighborhood}
                    onChange={handleNewClientFormChange}
                    placeholder="Seu bairro"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-client-address_city">Cidade</Label>
                  <Input
                    id="new-client-address_city"
                    name="address_city"
                    value={newClientFormData.address_city}
                    onChange={handleNewClientFormChange}
                    placeholder="Sua cidade"
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="new-client-address_state">Estado</Label>
                  <Input
                    id="new-client-address_state"
                    name="address_state"
                    value={newClientFormData.address_state}
                    onChange={handleNewClientFormChange}
                    placeholder="Seu estado"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-client-address_cep">CEP</Label>
                  <Input
                    id="new-client-address_cep"
                    name="address_cep"
                    value={newClientFormData.address_cep}
                    onChange={handleNewClientFormChange}
                    maxLength={9}
                    placeholder="00000-000"
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              {/* Campo de Papel (Role) */}
              <div className="space-y-2">
                <Label htmlFor="new-client-role">Papel</Label>
                <Select
                  name="role"
                  value={newClientFormData.role}
                  onValueChange={(value) => handleNewClientSelectChange('role', value)}
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

              {/* Campo de Status */}
              <div className="space-y-2">
                <Label htmlFor="new-client-status">Status</Label>
                <Select
                  name="status"
                  value={newClientFormData.status}
                  onValueChange={(value) => handleNewClientSelectChange('status', value)}
                >
                  <SelectTrigger className="w-full bg-background border-border text-foreground">
                    <SelectValue placeholder="Selecione o Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="md:col-span-2 mt-6">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="bg-background border-border text-foreground hover:bg-muted">
                  <XCircle className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button type="submit" disabled={createClientMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {createClientMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  Adicionar Cliente
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