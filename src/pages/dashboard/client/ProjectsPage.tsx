import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, CalendarDays, Clock, User, Package, HardHat, DollarSign, CheckCircle, XCircle, Tag, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, addBusinessDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

// Interfaces para dados aninhados
interface ServiceItem {
  id: string;
  name: string;
  initial_delivery_days: number | null;
  final_price: number;
}

interface PackageItem {
  id: string;
  name: string;
  price: number; // Preço mensal do pacote
  package_services: {
    products: ServiceItem;
  }[];
}

interface BudgetItem {
  id: string;
  item_type: 'service' | 'package';
  item_name: string;
  item_description: string | null;
  item_price: number;
  service_id: string | null;
  package_id: string | null;
}

interface Budget {
  id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  total_amount: number;
  budget_items: BudgetItem[];
}

interface ClientContract {
  id: string;
  project_id: string;
  client_id: string;
  budget_id: string | null; // Novo campo
  contract_type: 'monthly' | 'one-time';
  start_date: string;
  end_date: string | null;
  price_agreed: number;
  is_paid: boolean;
  payment_due_date: string | null;
  products: ServiceItem | null; // Serviço direto se contract_type for 'one-time'
  packages: PackageItem | null; // Pacote se contract_type for 'monthly'
  budgets: Budget | null; // NOVO: Adicionado para vincular ao orçamento completo
}

export default function ProjectsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ClientContract | null>(null);
  const [formData, setFormData] = useState<{
    projectName: string;
    contractType: 'one-time' | 'monthly' | undefined;
    selectedItemId: string | undefined;
    priceAgreed: number;
    startDate: string;
    estimatedCompletionDate: string | undefined;
    budget_id: string | undefined;
    // is_paid e payment_due_date removidos do estado do formulário, serão fixos
  }>({
    projectName: '',
    contractType: undefined,
    selectedItemId: undefined,
    priceAgreed: 0,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    estimatedCompletionDate: undefined,
    budget_id: undefined,
  });

  // Fetch all available services (products)
  const { data: services, isLoading: isLoadingServices } = useQuery<ServiceItem[], Error>({
    queryKey: ['availableServices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, initial_delivery_days, final_price')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch all available packages with their services
  const { data: packagesData, isLoading: isLoadingPackages } = useQuery<PackageItem[], Error>({
    queryKey: ['availablePackages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          id,
          name,
          price,
          package_services (
            products:service_id (
              id,
              name,
              initial_delivery_days,
              final_price
            )
          )
        `)
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch all budgets for the current user
  const { data: budgets, isLoading: isLoadingBudgets } = useQuery<Budget[], Error>({
    queryKey: ['clientBudgets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          id,
          client_name,
          client_phone,
          client_email,
          total_amount,
          budget_items (
            id, item_type, item_name, item_description, item_price, service_id, package_id
          )
        `)
        .eq('user_id', user.id) // Assuming budgets are linked to the client's user_id
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch client contracts (projects) for the logged-in client
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
          budget_id,
          contract_type,
          start_date,
          end_date,
          price_agreed,
          is_paid,
          payment_due_date,
          products:service_id (
            id,
            name,
            initial_delivery_days,
            final_price
          ),
          packages:package_id (
            id,
            name,
            price,
            package_services (
              products:service_id (
                id,
                name,
                initial_delivery_days,
                final_price
              )
            )
          ),
          budgets (
            id,
            budget_items (
              id, item_type, item_name, item_description, item_price, service_id, package_id
            )
          )
        `)
        .eq('client_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Process projects for display
  const projects = useMemo(() => {
    if (!contracts) return [];

    return contracts.map(contract => {
      let totalDeliveryDays = 0;
      const items: { name: string; type: 'service' | 'package' }[] = [];

      // NOVO: Se o contrato tem um budget_id, use os itens do orçamento
      if (contract.budget_id && contract.budgets?.budget_items) {
        contract.budgets.budget_items.forEach(budgetItem => {
          items.push({ name: budgetItem.item_name, type: budgetItem.item_type });
          // Para calcular os dias de entrega, precisamos buscar os detalhes do serviço/pacote
          if (budgetItem.item_type === 'service' && budgetItem.service_id) {
            const serviceDetail = services?.find(s => s.id === budgetItem.service_id);
            totalDeliveryDays += serviceDetail?.initial_delivery_days || 0;
          } else if (budgetItem.item_type === 'package' && budgetItem.package_id) {
            const packageDetail = packagesData?.find(p => p.id === budgetItem.package_id);
            packageDetail?.package_services.forEach(ps => {
              const serviceInPackage = services?.find(s => s.id === ps.products.id);
              totalDeliveryDays += serviceInPackage?.initial_delivery_days || 0;
            });
          }
        });
      } else if (contract.contract_type === 'one-time' && contract.products) {
        totalDeliveryDays += contract.products.initial_delivery_days || 0;
        items.push({ name: contract.products.name, type: 'service' });
      } else if (contract.contract_type === 'monthly' && contract.packages) {
        items.push({ name: contract.packages.name, type: 'package' });
        contract.packages.package_services.forEach(ps => {
          totalDeliveryDays += ps.products.initial_delivery_days || 0;
          items.push({ name: ps.products.name, type: 'service' });
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
  }, [contracts, services, packagesData]); // Adicionado services e packagesData às dependências

  // Add/Edit project mutation
  const upsertProjectMutation = useMutation<void, Error, Partial<ClientContract>>({
    mutationFn: async (projectData) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");

      const dataToSave = {
        ...projectData,
        client_id: user.id, // Always link to the logged-in client
        is_paid: true, // Sempre true para novos projetos
        payment_due_date: null, // Sempre null se já está pago
      };

      if (projectData.id) {
        const { error } = await supabase.from('client_contracts').update(dataToSave).eq('id', projectData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('client_contracts').insert(dataToSave);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientProjects'] });
      toast.success(editingProject ? 'Projeto atualizado com sucesso!' : 'Projeto adicionado com sucesso!');
      setIsDialogOpen(false);
      setEditingProject(null);
      setFormData({
        projectName: '',
        contractType: undefined,
        selectedItemId: undefined,
        priceAgreed: 0,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        estimatedCompletionDate: undefined,
        budget_id: undefined,
      });
    },
    onError: (err) => {
      toast.error(`Erro ao salvar projeto: ${err.message}`);
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation<void, Error, string>({
    mutationFn: async (projectId) => {
      const { error } = await supabase.from('client_contracts').delete().eq('id', projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientProjects'] });
      toast.success('Projeto excluído com sucesso!');
    },
    onError: (err) => {
      toast.error(`Erro ao excluir projeto: ${err.message}`);
    },
  });

  const handleOpenDialog = (project?: ClientContract) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        projectName: project.products?.name || project.packages?.name || project.budgets?.client_name || '', // Prioriza nome do orçamento
        contractType: project.contract_type || undefined,
        selectedItemId: project.service_id || project.package_id || undefined,
        priceAgreed: project.price_agreed,
        startDate: project.start_date,
        estimatedCompletionDate: project.end_date || undefined, // Garante undefined se for null
        budget_id: project.budget_id || undefined,
        // is_paid e payment_due_date não são carregados no formData, pois são fixos
      });
    } else {
      setEditingProject(null);
      setFormData({
        projectName: '',
        contractType: undefined,
        selectedItemId: undefined,
        priceAgreed: 0,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        estimatedCompletionDate: undefined,
        budget_id: undefined,
      });
    }
    setIsDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string | undefined) => { // value pode ser undefined
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Se mudar o tipo de contrato, limpa o item selecionado
    if (name === 'contractType') {
      setFormData(prev => ({ ...prev, selectedItemId: undefined }));
    }
    // Se selecionar um item, preenche o preço acordado
    if (name === 'selectedItemId') {
      const selectedService = services?.find(s => s.id === value);
      const selectedPackage = packagesData?.find(p => p.id === value);
      if (selectedService) {
        setFormData(prev => ({ ...prev, priceAgreed: selectedService.final_price }));
      } else if (selectedPackage) {
        setFormData(prev => ({ ...prev, priceAgreed: selectedPackage.price }));
      } else {
        setFormData(prev => ({ ...prev, priceAgreed: 0 }));
      }
    }
    // Se selecionar um orçamento, preenche os dados
    if (name === 'budget_id' && value) {
      const selectedBudget = budgets?.find(b => b.id === value);
      if (selectedBudget) {
        const firstItem = selectedBudget.budget_items[0]; // Pega o primeiro item do orçamento
        setFormData(prev => ({
          ...prev,
          projectName: selectedBudget.client_name + (selectedBudget.budget_items.length > 1 ? ` (${selectedBudget.budget_items.length} itens)` : ` - ${firstItem?.item_name || ''}`),
          contractType: firstItem?.item_type || undefined,
          selectedItemId: firstItem?.service_id || firstItem?.package_id || undefined,
          priceAgreed: selectedBudget.total_amount,
          // startDate: já preenchido com a data atual
          // estimatedCompletionDate: pode ser calculado ou deixado para o usuário
        }));
        toast.info("Dados do orçamento preenchidos automaticamente.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("Usuário não autenticado.");
      return;
    }
    if (!formData.projectName || !formData.contractType || !formData.selectedItemId || !formData.priceAgreed || !formData.startDate) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const projectData: Partial<ClientContract> = {
      project_id: editingProject?.project_id, // Mantém o ID existente se estiver editando
      client_id: user.id,
      budget_id: formData.budget_id || null,
      contract_type: formData.contractType,
      start_date: formData.startDate,
      end_date: formData.estimatedCompletionDate || null, // Garante que seja null se não preenchido
      price_agreed: formData.priceAgreed,
      is_paid: true, // Sempre true
      payment_due_date: null, // Sempre null
    };

    if (formData.contractType === 'one-time') {
      projectData.service_id = formData.selectedItemId;
      projectData.package_id = null;
    } else {
      projectData.package_id = formData.selectedItemId;
      projectData.service_id = null;
    }

    if (editingProject) {
      upsertProjectMutation.mutate({ ...projectData, id: editingProject.id });
    } else {
      upsertProjectMutation.mutate(projectData);
    }
  };

  const isLoading = authLoading || isLoadingContracts || isLoadingServices || isLoadingPackages || isLoadingBudgets;

  if (isLoading) {
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-[#57e389]">Meus Projetos</h1>
          <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Projeto
          </Button>
        </div>
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
                <TableHead className="text-muted-foreground">NOME DO PROJETO</TableHead>
                <TableHead className="text-muted-foreground">ITENS CONTRATADOS</TableHead>
                <TableHead className="text-muted-foreground">INÍCIO</TableHead>
                <TableHead className="text-muted-foreground">PRAZO ESTIMADO</TableHead>
                <TableHead className="text-muted-foreground">ENTREGA ESTIMADA</TableHead>
                <TableHead className="text-muted-foreground">STATUS PAGAMENTO</TableHead>
                <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
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
                      {project.products?.name || project.packages?.name || project.budgets?.client_name || 'N/A'}
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
                    <TableCell className="text-right py-4">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(project)} className="text-primary hover:text-primary/80">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteProjectMutation.mutate(project.id)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum projeto encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog para Adicionar/Editar Projeto */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                {editingProject ? `Editar Projeto #${editingProject.project_id}` : 'Adicionar Novo Projeto'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Preencha os detalhes do seu projeto. O status de pagamento será definido como 'Pago' automaticamente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
              {/* ID do Projeto (somente leitura) */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project_id">ID do Projeto</Label>
                <Input
                  id="project_id"
                  name="project_id"
                  value={editingProject?.project_id || 'Gerado Automaticamente'}
                  readOnly
                  className="w-full bg-muted/50 border-border text-foreground"
                />
              </div>

              {/* Nome do Projeto */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="projectName">Nome do Projeto *</Label>
                <Input
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleFormChange}
                  className="w-full bg-background border-border text-foreground"
                  required
                />
              </div>

              {/* ID do Orçamento (Opcional) */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="budget_id">ID do Orçamento (Opcional)</Label>
                <Select
                  name="budget_id"
                  value={formData.budget_id}
                  onValueChange={(value) => handleSelectChange('budget_id', value)}
                >
                  <SelectTrigger className="w-full bg-background border-border text-foreground">
                    <SelectValue placeholder="Vincular a um orçamento existente" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value={undefined}>Nenhum Orçamento</SelectItem>
                    {budgets?.map(budget => (
                      <SelectItem key={budget.id} value={budget.id}>
                        {budget.client_name} - R$ {budget.total_amount.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.budget_id && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Ao vincular um orçamento, o nome do projeto e o preço serão preenchidos.
                  </p>
                )}
              </div>

              {/* Tipo de Contrato */}
              <div className="space-y-2">
                <Label htmlFor="contractType">Tipo de Contrato *</Label>
                <Select
                  name="contractType"
                  value={formData.contractType}
                  onValueChange={(value: 'one-time' | 'monthly' | undefined) => handleSelectChange('contractType', value)}
                  required
                >
                  <SelectTrigger className="w-full bg-background border-border text-foreground">
                    <SelectValue placeholder="Selecione o Tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="one-time">Serviço Único</SelectItem>
                    <SelectItem value="monthly">Pacote Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Item Contratado (Serviço ou Pacote) */}
              <div className="space-y-2">
                <Label htmlFor="selectedItemId">Item Contratado *</Label>
                <Select
                  name="selectedItemId"
                  value={formData.selectedItemId}
                  onValueChange={(value) => handleSelectChange('selectedItemId', value)}
                  required
                  disabled={!formData.contractType}
                >
                  <SelectTrigger className="w-full bg-background border-border text-foreground">
                    <SelectValue placeholder={`Selecione um ${formData.contractType === 'one-time' ? 'Serviço' : formData.contractType === 'monthly' ? 'Pacote' : 'Item'}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {formData.contractType === 'one-time' && services?.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} (R$ {service.final_price.toFixed(2)})
                      </SelectItem>
                    ))}
                    {formData.contractType === 'monthly' && packagesData?.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} (R$ {pkg.price.toFixed(2)}/mês)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preço Acordado */}
              <div className="space-y-2">
                <Label htmlFor="priceAgreed">Preço Acordado (R$) *</Label>
                <Input
                  id="priceAgreed"
                  name="priceAgreed"
                  type="number"
                  step="0.01"
                  value={formData.priceAgreed}
                  onChange={handleFormChange}
                  className="w-full bg-background border-border text-foreground"
                  required
                />
              </div>

              {/* Data de Início */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleFormChange}
                  className="w-full bg-background border-border text-foreground"
                  required
                />
              </div>

              {/* Data Estimada de Conclusão */}
              <div className="space-y-2">
                <Label htmlFor="estimatedCompletionDate">Data Estimada de Conclusão</Label>
                <Input
                  id="estimatedCompletionDate"
                  name="estimatedCompletionDate"
                  type="date"
                  value={formData.estimatedCompletionDate || ''}
                  onChange={handleFormChange}
                  className="w-full bg-background border-border text-foreground"
                />
              </div>

              {/* Mensagem de Status de Pagamento Fixo */}
              <div className="md:col-span-2 text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                O status de pagamento será definido como <span className="font-semibold text-green-500">Pago</span> automaticamente.
              </div>

              <DialogFooter className="md:col-span-2 mt-6">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-background border-border text-foreground hover:bg-muted">
                  Cancelar
                </Button>
                <Button type="submit" disabled={upsertProjectMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {upsertProjectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingProject ? 'Salvar Alterações' : 'Adicionar Projeto'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}