import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
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
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, User, Mail, Phone, Briefcase, DollarSign, CheckCircle, XCircle, Loader2, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ClientDetailsPopup from '@/components/dashboard/master/ClientDetailsPopup'; // Importar o pop-up de detalhes

// Tipos de dados
interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  telefone: string | null;
  role: 'prospect' | 'client' | 'master';
  status: 'ativo' | 'inativo';
  company_organization: string | null; // Adicionado para o pop-up
  address_street: string | null;      // Adicionado para o pop-up
  address_number: string | null;      // Adicionado para o pop-up
  address_complement: string | null;  // Adicionado para o pop-up
  address_neighborhood: string | null; // Adicionado para o pop-up
  address_city: string | null;        // Adicionado para o pop-up
  address_state: string | null;       // Adicionado para o pop-up
  address_cep: string | null;         // Adicionado para o pop-up
  date_of_birth: string | null;       // Adicionado para o pop-up
  created_at: string;                 // Adicionado para o pop-up
  email: string; // Adicionado para facilitar a exibição
}

interface Service {
  id: string;
  name: string;
}

interface Package {
  id: string;
  name: string;
}

interface ClientContract {
  id: string;
  client_id: string;
  service_id: string | null;
  package_id: string | null;
  contract_type: 'monthly' | 'one-time';
  start_date: string;
  end_date: string | null;
  price_agreed: number;
  is_paid: boolean;
  payment_due_date: string | null;
  services: Service | null; // Relação com a tabela services
  packages: Package | null; // Relação com a tabela packages
}

interface UserWithContracts extends UserProfile {
  contracts: ClientContract[];
}

export default function ManageUsersPage() {
  const { profile: currentUserProfile } = useAuth();
  const queryClient = useQueryClient();
  const [filterRole, setFilterRole] = useState<'all' | 'prospect' | 'client' | 'master'>('all'); // Adicionado 'master' ao filtro
  const [searchTerm, setSearchTerm] = useState('');

  const [isDetailsPopupOpen, setIsDetailsPopupOpen] = useState(false); // Estado para o pop-up de detalhes
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<UserProfile | null>(null); // Cliente para exibir no pop-up

  // Fetch profiles data without email initially
  const { data: profilesData, isLoading: isLoadingProfiles, isError, error } = useQuery<Omit<UserProfile, 'email'>[], Error>({
    queryKey: ['usersWithContracts'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
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
    enabled: currentUserProfile?.role === 'master',
  });

  // Fetch emails via Edge Function
  const { data: emailsMap, isLoading: isLoadingEmails } = useQuery<Record<string, string>, Error>({
    queryKey: ['userEmails', profilesData?.map(p => p.id)],
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

  // Fetch contracts
  const { data: contractsData, isLoading: isLoadingContracts } = useQuery<ClientContract[], Error>({
    queryKey: ['clientContracts'],
    queryFn: async () => {
      const { data: contracts, error: contractsError } = await supabase
        .from('client_contracts')
        .select(`
          *,
          services (id, name),
          packages (id, name)
        `);

      if (contractsError) throw contractsError;
      return contracts;
    },
    enabled: currentUserProfile?.role === 'master',
  });

  // Combine all data
  const usersData = useMemo(() => {
    if (!profilesData || !emailsMap || !contractsData) return [];

    return profilesData.map(profile => ({
      ...profile,
      email: emailsMap[profile.id] || 'N/A',
      contracts: contractsData.filter(contract => contract.client_id === profile.id) as ClientContract[]
    }));
  }, [profilesData, emailsMap, contractsData]);

  // Mutation para alterar o papel do usuário
  const changeUserRoleMutation = useMutation<void, Error, { userId: string; newRole: 'prospect' | 'client' }>({
    mutationFn: async ({ userId, newRole }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usersWithContracts'] });
      toast.success('Papel do usuário atualizado com sucesso!');
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar papel: ${err.message}`);
    },
  });

  const filteredUsers = usersData?.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.telefone?.toLowerCase().includes(searchLower) ||
      user.company_organization?.toLowerCase().includes(searchLower) || // Adicionado busca por empresa
      user.contracts.some(contract =>
        contract.services?.name.toLowerCase().includes(searchLower) ||
        contract.packages?.name.toLowerCase().includes(searchLower)
      );
    return matchesRole && matchesSearch;
  });

  const handleRowClick = (client: UserProfile) => {
    setSelectedClientForDetails(client);
    setIsDetailsPopupOpen(true);
  };

  if (isLoadingProfiles || isLoadingEmails || isLoadingContracts) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-[#9ba8b5]">
          <Loader2 className="w-8 h-8 animate-spin mr-3" /> Carregando usuários...
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-destructive">
          Erro ao carregar usuários: {error?.message}
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
        <h1 className="text-4xl font-bold text-[#57e389] mb-6">Gerenciar Usuários</h1>
        <p className="text-lg text-[#9ba8b5]">
          Visão completa e gerenciamento de todos os usuários da plataforma, seus papéis, contratos e status de pagamento.
        </p>

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar por nome, e-mail, telefone, empresa ou serviço..."
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

        {/* Tabela de Usuários */}
        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead className="text-muted-foreground">USUÁRIO</TableHead>
                <TableHead className="text-muted-foreground">CONTATO</TableHead>
                <TableHead className="text-muted-foreground">PAPEL</TableHead>
                <TableHead className="text-muted-foreground">SERVIÇOS/PACOTES</TableHead>
                <TableHead className="text-muted-foreground">STATUS PAGAMENTO</TableHead>
                <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10 cursor-pointer" onClick={() => handleRowClick(user)}>
                    <TableCell className="font-medium text-foreground py-4">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-primary" />
                        <div>
                          <p>{user.first_name} {user.last_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground py-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" /> {user.telefone || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        className={`capitalize ${
                          user.role === 'master'
                            ? 'bg-purple-500 hover:bg-purple-600'
                            : user.role === 'client'
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-gray-500 hover:bg-gray-600'
                        } text-white`}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      {user.contracts.length > 0 ? (
                        <ul className="space-y-1">
                          {user.contracts.map((contract) => (
                            <li key={contract.id} className="flex items-center gap-2 text-sm text-foreground">
                              <Briefcase className="w-4 h-4 text-primary" />
                              {contract.contract_type === 'monthly' ? (
                                <span className="font-semibold">{contract.packages?.name || 'Pacote Desconhecido'} (Mensal)</span>
                              ) : (
                                <span className="font-semibold">{contract.services?.name || 'Serviço Desconhecido'} (Único)</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground text-sm">Nenhum contrato</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      {user.contracts.length > 0 ? (
                        <ul className="space-y-1">
                          {user.contracts.map((contract) => (
                            <li key={contract.id} className="flex items-center gap-2 text-sm">
                              {contract.is_paid ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className={contract.is_paid ? 'text-green-500' : 'text-red-500'}>
                                {contract.is_paid ? 'Pago' : 'Pendente'}
                              </span>
                              {contract.payment_due_date && !contract.is_paid && (
                                <span className="text-muted-foreground text-xs"> (Venc: {new Date(contract.payment_due_date).toLocaleDateString()})</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-4">
                      {user.role !== 'master' && ( // Master não pode mudar o próprio papel
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="bg-background border-border text-foreground">
                              Mudar Papel <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-popover border-border text-popover-foreground">
                            {user.role === 'prospect' && (
                              <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); changeUserRoleMutation.mutate({ userId: user.id, newRole: 'client' }); }}
                                disabled={changeUserRoleMutation.isPending}
                              >
                                {changeUserRoleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Mover para Cliente
                              </DropdownMenuItem>
                            )}
                            {user.role === 'client' && (
                              <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); changeUserRoleMutation.mutate({ userId: user.id, newRole: 'prospect' }); }}
                                disabled={changeUserRoleMutation.isPending}
                              >
                                {changeUserRoleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Mover para Prospect
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

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