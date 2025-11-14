import React, { useState, useMemo } from 'react';
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
import { Switch } from '@/components/ui/switch';
import {
  DollarSign,
  LayoutDashboard,
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Building,
  Zap,
  Lightbulb,
  Wifi,
  Book,
  Scale,
  Users,
  Handshake,
  MoreHorizontal,
  CreditCard,
  CalendarDays, // NOVO: Importar CalendarDays
  Tag, // NOVO: Importar Tag para o ID
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, getYear, getMonth, setMonth, setYear, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MonthlyFinancialCharts from '@/components/dashboard/master/MonthlyFinancialCharts'; // Importar o novo componente

// Tipos de dados
interface Budget {
  id: string;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'converted'; // Adicionado status
  created_at: string; // Adicionado para filtrar por data
}

interface CostItem {
  id: string;
  name: string;
  value_brl: number;
  is_active: boolean; // Adicionado is_active
  function_category: string;
  created_at: string;
}

interface VariableCostItem {
  id: string;
  code: string | null; // NOVO: Adicionado campo code
  name: string;
  value: number;
  is_active: boolean;
  date: string; // NOVO: Adicionado campo date
  created_at: string;
  updated_at: string;
  user_id: string;
}

// New interface for chart data point
interface MonthlyDataPoint {
  monthYear: string; // e.g., "Jan 2023"
  revenue: number;
  fixedCosts: number;
  variableCosts: number;
  totalCosts: number;
  profit: number;
}

const variableCostCategories = [
  { value: 'Aluguel', label: 'Aluguel', icon: Building },
  { value: 'Agua', label: 'Água', icon: Zap },
  { value: 'Luz', label: 'Luz', icon: Lightbulb },
  { value: 'Internet', label: 'Internet', icon: Wifi },
  { value: 'Contador', label: 'Contador', icon: Book },
  { value: 'Advogado', label: 'Advogado', icon: Scale },
  { value: 'Equipe', label: 'Equipe', icon: Users },
  { value: 'Comissoes', label: 'Comissões', icon: Handshake },
  { value: 'Outros Custos', label: 'Outros Custos', icon: MoreHorizontal },
];

export default function FinancialOverviewPage() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [isVariableCostDialogOpen, setIsVariableCostDialogOpen] = useState(false);
  const [editingVariableCost, setEditingVariableCost] = useState<VariableCostItem | null>(null);
  const [variableCostFormData, setVariableCostFormData] = useState<Partial<VariableCostItem>>({});

  const [selectedDate, setSelectedDate] = useState(new Date()); // State for selected month/year

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = setMonth(new Date(), i);
    return { value: i, label: format(date, 'MMMM', { locale: ptBR }) };
  });

  // Generate year options (current year and past 2 years)
  const currentYear = getYear(new Date());
  const yearOptions = Array.from({ length: 3 }, (_, i) => {
    const year = currentYear - i;
    return { value: year, label: String(year) };
  });

  // Derived state for query filters for the current month view
  const startOfSelectedMonth = startOfMonth(selectedDate);
  const endOfSelectedMonth = endOfMonth(selectedDate);

  // --- Queries ---

  // Fetch converted budgets for the selected month
  const { data: convertedBudgets, isLoading: isLoadingBudgets } = useQuery<Budget[], Error>({
    queryKey: ['convertedBudgets', startOfSelectedMonth.toISOString(), endOfSelectedMonth.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('id, total_amount, status, created_at')
        .eq('status', 'converted')
        .gte('created_at', startOfSelectedMonth.toISOString())
        .lte('created_at', endOfSelectedMonth.toISOString());
      if (error) throw error;
      return data;
    },
  });

  // Fetch active fixed costs (these apply to every month)
  const { data: fixedCosts, isLoading: isLoadingFixedCosts } = useQuery<CostItem[], Error>({
    queryKey: ['fixedCosts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('costs')
        .select('id, name, value_brl, is_active, function_category, created_at')
        .eq('is_active', true); // Filtrar por custos ativos
      if (error) throw error;
      return data;
    },
  });

  // Fetch variable costs for the selected month
  const { data: variableCosts, isLoading: isLoadingVariableCosts } = useQuery<VariableCostItem[], Error>({
    queryKey: ['variableCosts', startOfSelectedMonth.toISOString(), endOfSelectedMonth.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('variable_costs')
        .select('*')
        .gte('date', startOfSelectedMonth.toISOString())
        .lte('date', endOfSelectedMonth.toISOString())
        .order('date', { ascending: false }); // Ordenar por data
      if (error) throw error;
      return data;
    },
    enabled: profile?.role === 'master', // Apenas master pode gerenciar custos variáveis
  });

  // Fetch historical data for charts (last 12 months)
  const twelveMonthsAgo = subMonths(new Date(), 11);
  const startOfTwelveMonthsAgo = startOfMonth(twelveMonthsAgo);
  const endOfCurrentMonth = endOfMonth(new Date());

  const { data: historicalConvertedBudgets, isLoading: isLoadingHistoricalBudgets } = useQuery<Budget[], Error>({
    queryKey: ['historicalConvertedBudgets', startOfTwelveMonthsAgo.toISOString(), endOfCurrentMonth.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('id, total_amount, status, created_at')
        .eq('status', 'converted')
        .gte('created_at', startOfTwelveMonthsAgo.toISOString())
        .lte('created_at', endOfCurrentMonth.toISOString());
      if (error) throw error;
      return data;
    },
  });

  const { data: historicalVariableCosts, isLoading: isLoadingHistoricalVariableCosts } = useQuery<VariableCostItem[], Error>({
    queryKey: ['historicalVariableCosts', startOfTwelveMonthsAgo.toISOString(), endOfCurrentMonth.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('variable_costs')
        .select('*')
        .gte('date', startOfTwelveMonthsAgo.toISOString())
        .lte('date', endOfCurrentMonth.toISOString())
        .eq('is_active', true); // Only active variable costs for historical view
      if (error) throw error;
      return data;
    },
    enabled: profile?.role === 'master',
  });

  // --- Calculations for current month view ---

  const totalConvertedProjects = useMemo(() => {
    return convertedBudgets?.length || 0;
  }, [convertedBudgets]);

  const totalValueConvertedProjects = useMemo(() => {
    return convertedBudgets?.reduce((sum, budget) => sum + budget.total_amount, 0) || 0;
  }, [convertedBudgets]);

  const totalActiveFixedCosts = useMemo(() => {
    return fixedCosts?.reduce((sum, cost) => sum + cost.value_brl, 0) || 0;
  }, [fixedCosts]);

  const totalActiveVariableCosts = useMemo(() => {
    return variableCosts?.filter(vc => vc.is_active).reduce((sum, vc) => sum + vc.value, 0) || 0;
  }, [variableCosts]);

  const totalMonthlyCosts = useMemo(() => {
    return totalActiveFixedCosts + totalActiveVariableCosts;
  }, [totalActiveFixedCosts, totalActiveVariableCosts]);

  // --- Calculations for charts (last 12 months) ---
  const monthlyFinancialData = useMemo(() => {
    const dataMap = new Map<string, MonthlyDataPoint>();
    const today = new Date();

    // Initialize map for last 12 months
    for (let i = 0; i < 12; i++) {
      const monthDate = subMonths(today, 11 - i);
      const monthYearKey = format(monthDate, 'MMM yyyy', { locale: ptBR });
      dataMap.set(monthYearKey, {
        monthYear: monthYearKey,
        revenue: 0,
        fixedCosts: totalActiveFixedCosts, // Fixed costs are constant per month
        variableCosts: 0,
        totalCosts: totalActiveFixedCosts,
        profit: -totalActiveFixedCosts,
      });
    }

    // Aggregate historical converted budgets
    historicalConvertedBudgets?.forEach(budget => {
      const monthYearKey = format(new Date(budget.created_at), 'MMM yyyy', { locale: ptBR });
      if (dataMap.has(monthYearKey)) {
        const current = dataMap.get(monthYearKey)!;
        current.revenue += budget.total_amount;
        current.profit += budget.total_amount;
      }
    });

    // Aggregate historical variable costs
    historicalVariableCosts?.forEach(cost => {
      const monthYearKey = format(new Date(cost.date), 'MMM yyyy', { locale: ptBR });
      if (dataMap.has(monthYearKey)) {
        const current = dataMap.get(monthYearKey)!;
        current.variableCosts += cost.value;
        current.totalCosts += cost.value;
        current.profit -= cost.value;
      }
    });

    return Array.from(dataMap.values());
  }, [historicalConvertedBudgets, historicalVariableCosts, totalActiveFixedCosts]); // Depend on fixed costs for initialization

  // --- Mutations for Variable Costs ---

  const upsertVariableCostMutation = useMutation<void, Error, Partial<VariableCostItem>>({
    mutationFn: async (newCost) => {
      if (!user) throw new Error("Usuário não autenticado.");

      const costToSave = {
        ...newCost,
        user_id: user.id,
      };

      if (newCost.id) {
        const { error } = await supabase.from('variable_costs').update(costToSave).eq('id', newCost.id);
        if (error) throw error;
      } else {
        // Para novas inserções, o 'code' será gerado pelo trigger do banco de dados
        const { error } = await supabase.from('variable_costs').insert(costToSave);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variableCosts'] });
      queryClient.invalidateQueries({ queryKey: ['historicalVariableCosts'] }); // Invalidate historical data too
      toast.success(editingVariableCost ? 'Custo variável atualizado!' : 'Custo variável adicionado!');
      setIsVariableCostDialogOpen(false);
      setEditingVariableCost(null);
      setVariableCostFormData({});
    },
    onError: (err) => {
      toast.error(`Erro ao salvar custo variável: ${err.message}`);
    },
  });

  const deleteVariableCostMutation = useMutation<void, Error, string>({
    mutationFn: async (costId) => {
      const { error } = await supabase.from('variable_costs').delete().eq('id', costId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variableCosts'] });
      queryClient.invalidateQueries({ queryKey: ['historicalVariableCosts'] }); // Invalidate historical data too
      toast.success('Custo variável excluído com sucesso!');
    },
    onError: (err) => {
      toast.error(`Erro ao excluir custo variável: ${err.message}`);
    },
  });

  const toggleVariableCostActiveMutation = useMutation<void, Error, { id: string; is_active: boolean }>({
    mutationFn: async ({ id, is_active }) => {
      const { error } = await supabase.from('variable_costs').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variableCosts'] });
      queryClient.invalidateQueries({ queryKey: ['historicalVariableCosts'] }); // Invalidate historical data too
      toast.success('Status do custo variável atualizado!');
    },
    onError: (err) => {
      toast.error(`Erro ao atualizar status: ${err.message}`);
    },
  });

  // --- Handlers ---

  const handleOpenVariableCostDialog = (cost?: VariableCostItem) => {
    if (cost) {
      setEditingVariableCost(cost);
      setVariableCostFormData(cost);
    } else {
      setEditingVariableCost(null);
      setVariableCostFormData({
        name: '',
        value: 0,
        is_active: true,
        date: format(new Date(), 'yyyy-MM-dd'), // Padrão para a data atual
      });
    }
    setIsVariableCostDialogOpen(true);
  };

  const handleVariableCostFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setVariableCostFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleVariableCostSelectChange = (name: string, value: string | boolean) => {
    setVariableCostFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVariableCostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertVariableCostMutation.mutate(variableCostFormData);
  };

  // --- Loading State ---

  const isLoadingCharts = isLoadingHistoricalBudgets || isLoadingHistoricalVariableCosts || isLoadingFixedCosts;

  if (isLoadingBudgets || isLoadingFixedCosts || isLoadingVariableCosts || isLoadingCharts) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-[#9ba8b5]">
          <Loader2 className="w-8 h-8 animate-spin mr-3" /> Carregando visão geral financeira...
        </div>
      </DashboardLayout>
    );
  }

  if (profile?.role !== 'master') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-destructive">
          Você não tem permissão para acessar esta página.
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
        <div className="flex items-center gap-4 mb-8">
          <LayoutDashboard className="w-10 h-10 text-[#57e389]" />
          <h1 className="text-4xl font-bold text-foreground">Visão Geral Financeira</h1>
        </div>
        <p className="text-lg text-[#9ba8b5]">
          Olá, <span className="font-semibold text-white">{profile?.first_name}</span>! Aqui você encontrará um resumo completo das finanças da Pontedra.
          {profile?.client_id && <span className="block text-sm text-muted-foreground mt-1">ID do Cliente: {profile.client_id}</span>}
        </p>

        {/* Seletores de Mês e Ano */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 space-y-2">
            <Label htmlFor="select-month">Mês</Label>
            <Select
              value={getMonth(selectedDate).toString()}
              onValueChange={(value) => setSelectedDate(prev => setMonth(prev, parseInt(value)))}
            >
              <SelectTrigger id="select-month" className="w-full bg-card border-border text-foreground">
                <SelectValue placeholder="Selecione o Mês" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                {monthOptions.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="select-year">Ano</Label>
            <Select
              value={getYear(selectedDate).toString()}
              onValueChange={(value) => setSelectedDate(prev => setYear(prev, parseInt(value)))}
            >
              <SelectTrigger id="select-year" className="w-full bg-card border-border text-foreground">
                <SelectValue placeholder="Selecione o Ano" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                {yearOptions.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Seção de Projetos Fechados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-card border-border shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" /> Projetos Fechados ({format(selectedDate, 'MMMM/yyyy', { locale: ptBR })})
            </h2>
            <p className="text-muted-foreground mb-4">
              Contagem e valor total dos orçamentos convertidos em projetos no mês selecionado.
            </p>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total de Projetos</p>
                <p className="text-3xl font-bold text-primary">{totalConvertedProjects}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-3xl font-bold text-primary">R$ {totalValueConvertedProjects.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Seção de Custos Fixos Mensais */}
          <div className="bg-card border-border shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-500" /> Custos Fixos Ativos
            </h2>
            <p className="text-muted-foreground mb-4">
              Soma de todos os custos fixos marcados como ativos (aplicável a todos os meses).
            </p>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Itens Ativos</p>
                <p className="text-3xl font-bold text-blue-500">{fixedCosts?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Mensal</p>
                <p className="text-3xl font-bold text-blue-500">R$ {totalActiveFixedCosts.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Custos Variáveis Mensais */}
        <div className="bg-card border-border shadow-lg rounded-xl p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-yellow-500" /> Custos Variáveis Mensais ({format(selectedDate, 'MMMM/yyyy', { locale: ptBR })})
            </h2>
            <Button onClick={() => handleOpenVariableCostDialog()} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Custo Variável
            </Button>
          </div>
          <p className="text-muted-foreground mb-4">
            Gerencie e contabilize seus custos variáveis para o mês selecionado. Apenas custos ativos são somados.
          </p>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead className="text-muted-foreground">ID</TableHead> {/* NOVO: Coluna ID */}
                  <TableHead className="text-muted-foreground">NOME</TableHead>
                  <TableHead className="text-muted-foreground">VALOR (BRL)</TableHead>
                  <TableHead className="text-muted-foreground">DATA</TableHead> {/* NOVO: Coluna Data */}
                  <TableHead className="text-muted-foreground">STATUS</TableHead>
                  <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variableCosts && variableCosts.length > 0 ? (
                  variableCosts.map((cost) => {
                    const Icon = variableCostCategories.find(cat => cat.value === cost.name)?.icon || MoreHorizontal;
                    return (
                      <TableRow key={cost.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10">
                        <TableCell className="font-medium text-foreground py-4 flex items-center gap-2">
                          <Tag className="w-4 h-4 text-muted-foreground" /> {cost.code || 'N/A'}
                        </TableCell>
                        <TableCell className="font-medium text-foreground py-4 flex items-center gap-2">
                          <Icon className="w-5 h-5 text-muted-foreground" /> {cost.name}
                        </TableCell>
                        <TableCell className="text-foreground py-4">R$ {cost.value.toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground py-4">
                          {format(new Date(cost.date), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="py-4">
                          <Switch
                            checked={cost.is_active}
                            onCheckedChange={(checked) => toggleVariableCostActiveMutation.mutate({ id: cost.id, is_active: checked })}
                            disabled={toggleVariableCostActiveMutation.isPending}
                          />
                          <span className="ml-2 text-sm text-muted-foreground">
                            {cost.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenVariableCostDialog(cost)} className="text-primary hover:text-primary/80">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteVariableCostMutation.mutate(cost.id)} className="text-destructive hover:text-destructive/80">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum custo variável encontrado para {format(selectedDate, 'MMMM/yyyy', { locale: ptBR })}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center text-lg font-bold text-foreground mt-6 pt-4 border-t border-border">
            <span>Total de Custos Variáveis Ativos:</span>
            <span className="text-yellow-500">R$ {totalActiveVariableCosts.toFixed(2)}</span>
          </div>
        </div>

        {/* Total de Custos Mensais */}
        <div className="bg-card border-border shadow-lg rounded-xl p-6 mt-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-red-500" /> Total de Custos Mensais ({format(selectedDate, 'MMMM/yyyy', { locale: ptBR })})
          </h2>
          <p className="text-muted-foreground mb-4">
            Soma de todos os custos fixos e variáveis ativos para o mês selecionado.
          </p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Custos Fixos Ativos</p>
              <p className="text-xl font-bold text-blue-500">R$ {totalActiveFixedCosts.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Custos Variáveis Ativos</p>
              <p className="text-xl font-bold text-yellow-500">R$ {totalActiveVariableCosts.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Geral</p>
              <p className="text-4xl font-bold text-red-500">R$ {totalMonthlyCosts.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Seção de Evolução Financeira Mensal (Gráficos) */}
        <MonthlyFinancialCharts data={monthlyFinancialData} isLoading={isLoadingCharts} />

        {/* Dialog para Adicionar/Editar Custo Variável */}
        <Dialog open={isVariableCostDialogOpen} onOpenChange={setIsVariableCostDialogOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                {editingVariableCost ? 'Editar Custo Variável' : 'Adicionar Novo Custo Variável'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Preencha os detalhes do custo variável mensal.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleVariableCostSubmit} className="space-y-4 py-4">
              {/* NOVO: Campo de ID (somente leitura) */}
              <div className="space-y-2">
                <Label htmlFor="code" className="text-left">ID do Custo</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="code"
                    name="code"
                    value={editingVariableCost?.code || 'Gerado Automaticamente'}
                    readOnly
                    className="w-full pl-10 bg-muted/50 border-border text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-left">Nome do Custo *</Label>
                <Select
                  name="name"
                  value={variableCostFormData.name || ''}
                  onValueChange={(value) => handleVariableCostSelectChange('name', value)}
                >
                  <SelectTrigger className="w-full bg-background border-border text-foreground">
                    <SelectValue placeholder="Selecione o tipo de custo" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {variableCostCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="w-4 h-4 text-muted-foreground" /> {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value" className="text-left">Valor (R$) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    step="0.01"
                    value={variableCostFormData.value || 0}
                    onChange={handleVariableCostFormChange}
                    className="w-full pl-10 bg-background border-border text-foreground"
                    required
                  />
                </div>
              </div>
              {/* NOVO: Campo de Data */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-left">Data do Custo *</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={variableCostFormData.date || format(new Date(), 'yyyy-MM-dd')}
                    onChange={handleVariableCostFormChange}
                    className="w-full pl-10 bg-background border-border text-foreground"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="is_active">Ativo</Label>
                <Switch
                  id="is_active"
                  checked={variableCostFormData.is_active}
                  onCheckedChange={(checked) => handleVariableCostSelectChange('is_active', checked)}
                />
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsVariableCostDialogOpen(false)} className="bg-background border-border text-foreground hover:bg-muted">
                  Cancelar
                </Button>
                <Button type="submit" disabled={upsertVariableCostMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {upsertVariableCostMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingVariableCost ? 'Salvar Alterações' : 'Adicionar Custo'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}