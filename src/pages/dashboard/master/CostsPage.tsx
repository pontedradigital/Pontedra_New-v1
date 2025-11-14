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
import { Textarea } from '@/components/ui/textarea';
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
import { PlusCircle, Edit, Trash2, Loader2, DollarSign, Tag, Info, CreditCard, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

// Tipos de dados para Custo
interface CostItem {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  value_brl: number;
  value_usd: number | null;
  payment_method: 'credit_card' | 'debit_card' | 'pix' | 'boleto' | 'other';
  function_category: 'tool' | 'fixed_account' | 'server' | 'hosting' | 'miscellaneous';
  created_at: string;
  user_id: string;
}

const paymentMethods = [
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'pix', label: 'Pix' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'other', label: 'Outro' },
];

const functionCategories = [
  { value: 'tool', label: 'Ferramenta' },
  { value: 'fixed_account', label: 'Conta Fixa' },
  { value: 'server', label: 'Servidor' },
  { value: 'hosting', label: 'Hospedagem' },
  { value: 'miscellaneous', label: 'Diversos' },
];

export default function CostsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<CostItem | null>(null);
  const [formData, setFormData] = useState<Partial<CostItem>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | CostItem['function_category']>('all');

  // Fetch costs
  const { data: costs, isLoading, isError, error } = useQuery<CostItem[], Error>({
    queryKey: ['costs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('costs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch IOF percentage from settings
  const { data: iofSetting, isLoading: isLoadingIof } = useQuery<{ key: string; value: number } | null, Error>({
    queryKey: ['settings', 'iof_percentage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'iof_percentage')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    staleTime: Infinity,
  });

  // Fetch USD to BRL rate from settings
  const { data: usdRateSetting, isLoading: isLoadingUsdRate } = useQuery<{ key: string; value: number } | null, Error>({
    queryKey: ['settings', 'usd_to_brl_rate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'usd_to_brl_rate')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    staleTime: Infinity,
  });

  const iofPercentage = iofSetting?.value || 0.38; // Default to 0.38%
  const usdToBrlRate = usdRateSetting?.value || 5.00; // Default to 5.00

  // Calculate value_brl based on value_usd, iof, and exchange rate
  const calculateValueBrl = (usdValue: number | null) => {
    if (usdValue === null || usdValue === 0) return 0;
    const iofFactor = 1 + (iofPercentage / 100);
    return parseFloat((usdValue * usdToBrlRate * iofFactor).toFixed(2));
  };

  // Update formData.value_brl when formData.value_usd changes
  useEffect(() => {
    if (formData.value_usd !== undefined && formData.value_usd !== null) {
      setFormData(prev => ({
        ...prev,
        value_brl: calculateValueBrl(prev.value_usd),
      }));
    }
  }, [formData.value_usd, iofPercentage, usdToBrlRate]);

  // Add/Edit cost mutation
  const upsertCostMutation = useMutation<void, Error, Partial<CostItem>>({
    mutationFn: async (newCost) => {
      if (!user) throw new Error("Usuário não autenticado.");

      const costToSave = {
        ...newCost,
        user_id: user.id,
        value_brl: newCost.value_usd !== undefined && newCost.value_usd !== null
          ? calculateValueBrl(newCost.value_usd)
          : newCost.value_brl, // Use calculated BRL or direct BRL input
      };

      if (newCost.id) {
        const { error } = await supabase.from('costs').update(costToSave).eq('id', newCost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('costs').insert(costToSave);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costs'] });
      toast.success(editingCost ? 'Custo atualizado com sucesso!' : 'Custo adicionado com sucesso!');
      setIsDialogOpen(false);
      setEditingCost(null);
      setFormData({});
    },
    onError: (err) => {
      toast.error(`Erro ao salvar custo: ${err.message}`);
    },
  });

  // Delete cost mutation
  const deleteCostMutation = useMutation<void, Error, string>({
    mutationFn: async (costId) => {
      const { error } = await supabase.from('costs').delete().eq('id', costId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costs'] });
      toast.success('Custo excluído com sucesso!');
    },
    onError: (err) => {
      toast.error(`Erro ao excluir custo: ${err.message}`);
    },
  });

  const handleOpenDialog = (cost?: CostItem) => {
    if (cost) {
      setEditingCost(cost);
      setFormData(cost);
    } else {
      setEditingCost(null);
      setFormData({
        name: '',
        description: '',
        value_brl: 0,
        value_usd: null,
        payment_method: 'credit_card',
        function_category: 'tool',
        code: '', // Reset code for new entry
      });
    }
    setIsDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
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
    upsertCostMutation.mutate(formData);
  };

  const filteredCosts = useMemo(() => {
    return costs?.filter(cost => {
      const matchesCategory = filterCategory === 'all' || cost.function_category === filterCategory;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        cost.name.toLowerCase().includes(searchLower) ||
        cost.description?.toLowerCase().includes(searchLower) ||
        cost.code?.toLowerCase().includes(searchLower);
      return matchesCategory && matchesSearch;
    });
  }, [costs, searchTerm, filterCategory]);

  if (isLoading || isLoadingIof || isLoadingUsdRate) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-[#9ba8b5]">
          <Loader2 className="w-8 h-8 animate-spin mr-3" /> Carregando custos e configurações...
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-destructive">
          Erro ao carregar custos: {error?.message}
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
          <h1 className="text-4xl font-bold text-[#57e389]">Gerenciar Custos</h1>
          <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Custo
          </Button>
        </div>
        <p className="text-lg text-[#9ba8b5]">
          Registre e acompanhe todos os custos operacionais da empresa.
        </p>

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar custo por nome, descrição ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
          <Select onValueChange={(value) => setFilterCategory(value as 'all' | CostItem['function_category'])} value={filterCategory}>
            <SelectTrigger className="w-[180px] bg-card border-border text-foreground">
              <SelectValue placeholder="Filtrar por Função" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="all">Todas as Funções</SelectItem>
                {functionCategories.map(category => (
                  <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabela de Custos */}
        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead className="text-muted-foreground">CÓDIGO</TableHead>
                <TableHead className="text-muted-foreground">NOME</TableHead>
                <TableHead className="text-muted-foreground">DESCRIÇÃO</TableHead>
                <TableHead className="text-muted-foreground">CATEGORIA</TableHead>
                <TableHead className="text-muted-foreground">FORMA PAGAMENTO</TableHead>
                <TableHead className="text-muted-foreground">VALOR (USD)</TableHead>
                <TableHead className="text-muted-foreground">VALOR (BRL)</TableHead>
                <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCosts && filteredCosts.length > 0 ? (
                filteredCosts.map((cost) => (
                  <TableRow key={cost.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10">
                    <TableCell className="font-medium text-foreground py-4">{cost.code || 'N/A'}</TableCell>
                    <TableCell className="font-medium text-foreground py-4">{cost.name}</TableCell>
                    <TableCell className="text-muted-foreground py-4 max-w-[200px] truncate">
                      {cost.description || 'N/A'}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-4">
                      {functionCategories.find(cat => cat.value === cost.function_category)?.label || cost.function_category}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-4">
                      {paymentMethods.find(method => method.value === cost.payment_method)?.label || cost.payment_method}
                    </TableCell>
                    <TableCell className="text-foreground py-4">
                      {cost.value_usd ? `U$ ${cost.value_usd.toFixed(2)}` : 'N/A'}
                    </TableCell>
                    <TableCell className="font-bold text-foreground py-4">
                      R$ {cost.value_brl.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(cost)} className="text-primary hover:text-primary/80">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteCostMutation.mutate(cost.id)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum custo encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog para Adicionar/Editar Custo */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                {editingCost ? 'Editar Custo' : 'Adicionar Novo Custo'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Preencha os detalhes do custo. Se preencher o valor em USD, o valor em BRL será calculado automaticamente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-left">Código</Label>
                <Input
                  id="code"
                  name="code"
                  value={editingCost?.code || 'Gerado Automaticamente'}
                  readOnly
                  className="w-full bg-muted/50 border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-left">Nome do Serviço/Ferramenta *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleFormChange}
                  className="w-full bg-background border-border text-foreground"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-left">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleFormChange}
                  className="w-full bg-background border-border text-foreground"
                  rows={3}
                />
              </div>
              
              {/* Valor em USD */}
              <div className="space-y-2">
                <Label htmlFor="value_usd" className="text-left">Valor em USD (Opcional)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="value_usd"
                    name="value_usd"
                    type="number"
                    step="0.01"
                    value={formData.value_usd || ''}
                    onChange={handleFormChange}
                    className="w-full pl-10 bg-background border-border text-foreground"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Taxa de Câmbio: R$ {usdToBrlRate.toFixed(4)} | IOF: {iofPercentage.toFixed(2)}%
                </p>
              </div>

              {/* Valor em BRL (Calculado ou Manual) */}
              <div className="space-y-2">
                <Label htmlFor="value_brl" className="text-left">Valor em BRL *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="value_brl"
                    name="value_brl"
                    type="number"
                    step="0.01"
                    value={formData.value_brl || 0}
                    onChange={handleFormChange}
                    className="w-full pl-10 bg-background border-border text-foreground"
                    required
                    readOnly={formData.value_usd !== undefined && formData.value_usd !== null && formData.value_usd > 0}
                    placeholder="0.00"
                  />
                </div>
                {formData.value_usd !== undefined && formData.value_usd !== null && formData.value_usd > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Calculado automaticamente de USD.
                  </p>
                )}
              </div>

              {/* Forma de Pagamento */}
              <div className="space-y-2">
                <Label htmlFor="payment_method" className="text-left">Forma de Pagamento *</Label>
                <Select
                  name="payment_method"
                  value={formData.payment_method || 'credit_card'}
                  onValueChange={(value) => handleSelectChange('payment_method', value as CostItem['payment_method'])}
                >
                  <SelectTrigger className="w-full bg-background border-border text-foreground">
                    <SelectValue placeholder="Selecione a Forma de Pagamento" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {paymentMethods.map(method => (
                      <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categoria de Função */}
              <div className="space-y-2">
                <Label htmlFor="function_category" className="text-left">Função *</Label>
                <Select
                  name="function_category"
                  value={formData.function_category || 'tool'}
                  onValueChange={(value) => handleSelectChange('function_category', value as CostItem['function_category'])}
                >
                  <SelectTrigger className="w-full bg-background border-border text-foreground">
                    <SelectValue placeholder="Selecione a Função" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {functionCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="md:col-span-2 mt-6">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-background border-border text-foreground hover:bg-muted">
                  Cancelar
                </Button>
                <Button type="submit" disabled={upsertCostMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {upsertCostMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingCost ? 'Salvar Alterações' : 'Adicionar Custo'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}