import React, { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CalendarDays, Clock, User, Package, HardHat, DollarSign, CheckCircle, XCircle, Tag } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, addBusinessDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces para dados aninhados
interface ServiceInContract {
  id: string;
  name: string;
  initial_delivery_days: number | null;
}

interface PackageInContract {
  id: string;
  name: string;
  package_services: {
    products: ServiceInContract; // Corrigido para 'products' na interface
  }[];
}

interface ClientContract {
  id: string;
  project_id: string; // Nova coluna
  client_id: string;
  contract_type: 'monthly' | 'one-time';
  start_date: string;
  end_date: string | null;
  price_agreed: number;
  is_paid: boolean;
  payment_due_date: string | null;
  products: ServiceInContract | null; // Serviço direto se contract_type for 'one-time'
  packages: PackageInContract | null; // Pacote se contract_type for 'monthly'
}

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

export default function ProjectsPage() {
  const { user, profile, loading: authLoading } = useAuth();

  // Busca os contratos do cliente logado
  const { data: contracts, isLoading: isLoadingContracts, isError: isContractsError, error: contractsError } = useQuery<ClientContract[], Error>({
    queryKey: ['clientProjects', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated.");
      const { data, error } = await supabase
        .from('client_contracts')
        .select(`
          id,
          project_id,
          client_id,
          contract_type,
          start_date,
          end_date,
          price_agreed,
          is_paid,
          payment_due_date,
          products:service_id (
            id,
            name,
            initial_delivery_days
          ),
          packages:package_id (
            id,
            name,
            package_services (
              products:service_id ( -- CORREÇÃO AQUI: Usando 'products:service_id' novamente
                id,
                name,
                initial_delivery_days
              )
            )
          )
        `)
        .eq('client_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id, // Só executa a query se o usuário estiver autenticado
  });

  // Processa os contratos para calcular dias e datas de entrega
  const projects = useMemo(() => {
    if (!contracts) return [];

    return contracts.map(contract => {
      let totalDeliveryDays = 0;
      const items: { name: string; type: 'service' | 'package' }[] = [];

      if (contract.contract_type === 'one-time' && contract.products) {
        totalDeliveryDays += contract.products.initial_delivery_days || 0;
        items.push({ name: contract.products.name, type: 'service' });
      } else if (contract.contract_type === 'monthly' && contract.packages) {
        items.push({ name: contract.packages.name, type: 'package' });
        contract.packages.package_services.forEach(ps => {
          totalDeliveryDays += ps.products.initial_delivery_days || 0; // Acessando via 'products'
          items.push({ name: ps.products.name, type: 'service' }); // Adiciona serviços individuais do pacote
        });
      }

      const startDate = parseISO(contract.start_date);
      const estimatedDeliveryDate = addBusinessDays(startDate, totalDeliveryDays);

      return {
        ...contract,
        totalDeliveryDays,
        estimatedDeliveryDate: format(estimatedDeliveryDate, 'dd/MM/yyyy', { locale: ptBR }),
        items,
      };
    });
  }, [contracts]);

  if (authLoading || isLoadingContracts) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-[#9ba8b5]">
          <Loader2 className="w-8 h-8 animate-spin mr-3" /> Carregando seus projetos...
        </div>
      </DashboardLayout>
    );
  }

  if (isContractsError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-destructive">
          Erro ao carregar projetos: {contractsError?.message}
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-destructive">
          Você precisa estar logado para ver seus projetos.
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
        <h1 className="text-4xl font-bold text-[#57e389] mb-6">Meus Projetos</h1>
        {profile && (
          <p className="text-lg text-[#9ba8b5]">
            Olá, <span className="font-semibold text-white">{profile.first_name}</span>! Aqui você pode acompanhar o status dos seus projetos com a Pontedra.
            {profile.client_id && <span className="block text-sm text-muted-foreground mt-1">ID do Cliente: {profile.client_id}</span>}
          </p>
        )}
        <p className="mt-4 text-[#9ba8b5]">
          Visualize os detalhes de cada projeto, prazos de entrega e os serviços/pacotes contratados.
        </p>

        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead className="text-muted-foreground">ID DO PROJETO</TableHead>
                <TableHead className="text-muted-foreground">CLIENTE</TableHead>
                <TableHead className="text-muted-foreground">ITENS CONTRATADOS</TableHead>
                <TableHead className="text-muted-foreground">INÍCIO</TableHead>
                <TableHead className="text-muted-foreground">PRAZO ESTIMADO</TableHead>
                <TableHead className="text-muted-foreground">ENTREGA ESTIMADA</TableHead>
                <TableHead className="text-muted-foreground">STATUS PAGAMENTO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <TableRow key={project.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10">
                    <TableCell className="font-medium text-foreground py-4 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" /> {project.project_id}
                    </TableCell>
                    <TableCell className="font-medium text-foreground py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {profile?.first_name} {profile?.last_name}
                      </div>
                      <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    </TableCell>
                    <TableCell className="py-4">
                      <ul className="space-y-1">
                        {project.items.map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-foreground">
                            {item.type === 'service' ? <HardHat className="w-4 h-4 text-blue-500" /> : <Package className="w-4 h-4 text-purple-500" />}
                            {item.name}
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell className="text-muted-foreground py-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" /> {format(parseISO(project.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" /> {project.totalDeliveryDays} dias úteis
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground py-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" /> {project.estimatedDeliveryDate}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={project.is_paid ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}>
                        {project.is_paid ? 'Pago' : 'Pendente'}
                      </Badge>
                      {!project.is_paid && project.payment_due_date && (
                        <p className="text-xs text-muted-foreground mt-1">Venc: {format(parseISO(project.payment_due_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum projeto encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}