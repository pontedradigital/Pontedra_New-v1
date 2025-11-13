import React, { useState, useEffect } from 'react';
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Importar RadioGroup
import { PlusCircle, Edit, Trash2, Loader2, HardHat, DollarSign, Percent, CalendarDays } from 'lucide-react';

// Tipos de dados para Serviços (anteriormente Produtos)
interface ServiceItem {
  id: string;
  sku: string; // NOVO: Adicionado campo SKU
  name: string;
  category: 'Web' | 'Sistemas' | 'Marketing' | 'Design' | 'Completo';
  description: string | null;
  initial_delivery_days: number | null;
  cost: number | null;
  price: number; // Preço base (valor inicial antes de qualquer ajuste de pagamento)
  discount_percentage: number | null;
  tax_percentage: number | null;
  
  // Novos campos para opções de pagamento padrão
  default_payment_option: 'vista' | 'lojista' | 'cliente';
  default_installments_lojista: number | null; // Número de parcelas se lojista paga
  default_installments_cliente: number | null; // Número de parcelas se cliente paga

  final_price: number | null; // Este campo no DB armazenará o valor que o cliente paga
  created_at: string;
  updated_at: string;
  // REMOVIDO: is_active: boolean; // Esta coluna não existe na tabela 'products'
}

interface InstallmentRate {
  installments: number;
  merchant_pays_rate: number;
  client_pays_rate: number;
}

const serviceCategories = ['Web', 'Sistemas', 'Marketing', 'Design', 'Completo'];

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState<Partial<ServiceItem>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('Todas');

  // Fetch services (from 'products' table)
  const { data: services, isLoading, isError, error } = useQuery<ServiceItem[], Error>({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch default tax percentage from settings
  const { data: defaultTaxSetting } = useQuery<{ key: string; value: number } | null, Error>({
    queryKey: ['settings', 'default_tax_percentage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'default_tax_percentage')
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        throw error;
      }
      return data;
    },
    staleTime: Infinity, // This setting doesn't change often
  });

  // Fetch installment rates
  const { data: installmentRates, isLoading: isLoadingRates } = useQuery<InstallmentRate[], Error>({
    queryKey: ['installment_rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('installment_rates')
        .select('*')
        .order('installments', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: Infinity, // These rates don't change often
  });

  // Calculate all pricing metrics for a service
  const calculateMetrics = (service: Partial<ServiceItem>, rates: InstallmentRate[] | undefined) => {
    const initialPriceInput = service.price || 0; // Este é o valor do campo de input 'Preço Base'

    const cost = service.cost || 0;
    const discountPercentage = service.discount_percentage || 0;
    const taxPercentage = service.tax_percentage || 0;

    // Deduções que afetam o lucro, mas são calculadas sobre o initialPriceInput
    const taxDeduction = parseFloat((initialPriceInput * (taxPercentage / 100)).toFixed(2));
    const discountDeduction = parseFloat((initialPriceInput * (discountPercentage / 100)).toFixed(2));

    let clientFinalPayment = initialPriceInput; // O que o cliente *realmente* paga
    let companyNetRevenue = initialPriceInput; // O que a empresa *realmente* recebe (antes de custos e impostos)
    let installmentCostDeduction = 0; // Custo absorvido pela empresa devido ao parcelamento (taxa da operadora)

    switch (service.default_payment_option) {
      case 'vista':
        // Cliente recebe 10% de desconto sobre o initialPriceInput
        clientFinalPayment = parseFloat((initialPriceInput * 0.90).toFixed(2));
        companyNetRevenue = clientFinalPayment; // Empresa recebe o valor com desconto
        break;
      case 'lojista':
        // Cliente paga o initialPriceInput. Lojista absorve os juros (taxa da operadora).
        clientFinalPayment = initialPriceInput;
        const lojistaInstallments = service.default_installments_lojista || 1;
        const lojistaRate = rates?.find(r => r.installments === lojistaInstallments)?.merchant_pays_rate || 0;
        installmentCostDeduction = parseFloat((initialPriceInput * lojistaRate).toFixed(2));
        companyNetRevenue = parseFloat((initialPriceInput - installmentCostDeduction).toFixed(2)); // Empresa recebe o valor base menos a taxa
        break;
      case 'cliente':
        // Cliente paga o initialPriceInput + juros.
        const clienteInstallments = service.default_installments_cliente || 1;
        const clienteRate = rates?.find(r => r.installments === clienteInstallments)?.client_pays_rate || 0;
        clientFinalPayment = parseFloat((initialPriceInput * (1 + clienteRate)).toFixed(2)); // Cliente paga o valor base + juros

        // A empresa ainda tem um custo de processamento (taxa da operadora) sobre o valor base,
        // mesmo que o cliente pague os juros. Usamos a taxa do lojista para representar isso.
        const lojistaRateForClientOption = rates?.find(r => r.installments === clienteInstallments)?.merchant_pays_rate || 0;
        installmentCostDeduction = parseFloat((initialPriceInput * lojistaRateForClientOption).toFixed(2));
        
        // A receita líquida da empresa é o valor base (initialPriceInput) menos o custo de processamento da operadora.
        // O valor extra pago pelo cliente (juros) cobre o custo da operadora, mas a empresa não o "lucra".
        companyNetRevenue = parseFloat((initialPriceInput - installmentCostDeduction).toFixed(2));
        break;
      default:
        // Caso padrão, nenhuma opção de pagamento especial selecionada
        clientFinalPayment = initialPriceInput;
        companyNetRevenue = initialPriceInput;
        break;
    }

    // Calcular o lucro com base na receita líquida da empresa após todas as deduções
    const profit = parseFloat((companyNetRevenue - cost - taxDeduction - discountDeduction).toFixed(2));

    return {
      valorBrutoCobradoDisplay: clientFinalPayment, // O que o cliente paga
      custoDisplay: cost,
      deducaoImpostoDisplay: taxDeduction,
      deducaoDescontoDisplay: discountDeduction,
      custoParcelamentoDisplay: installmentCostDeduction, // Custo absorvido pela empresa
      lucroLiquidoDisplay: profit,
    };
  };

  // Add/Edit service mutation (to 'products' table)
  const upsertServiceMutation = useMutation<void, Error, Partial<ServiceItem>>({
    mutationFn: async (newService) => {
      const { valorBrutoCobradoDisplay } = calculateMetrics(newService, installmentRates); // Obter o valor final que o cliente paga
      const serviceToSave = { ...newService, final_price: valorBrutoCobradoDisplay }; // Salvar este valor em final_price

      if (newService.id) {
        // Ao editar, não alteramos o SKU, pois ele é gerado apenas na criação
        const { error } = await supabase.from('products').update(serviceToSave).eq('id', newService.id);
        if (error) throw error;
      } else {
        // Ao adicionar, o SKU será gerado automaticamente pelo trigger no banco de dados
        const { error } = await supabase.from('products').insert(serviceToSave);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(editingService ? 'Serviço atualizado com sucesso!' : 'Serviço adicionado com sucesso!');
      setIsDialogOpen(false);
      setEditingService(null);
      setFormData({});
    },
    onError: (err) => {
      toast.error(`Erro ao salvar serviço: ${err.message}`);
    },
  });

  // Delete service mutation (from 'products' table)
  const deleteServiceMutation = useMutation<void, Error, string>({
    mutationFn: async (serviceId) => {
      const { error } = await supabase.from('products').delete().eq('id', serviceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Serviço excluído com sucesso!');
    },
    onError: (err) => {
      toast.error(`Erro ao excluir serviço: ${err.message}`);
    },
  });

  const handleOpenDialog = (service?: ServiceItem) => {
    if (service) {
      setEditingService(service);
      setFormData(service);
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        category: 'Web',
        description: '',
        initial_delivery_days: 0,
        cost: 0,
        price: 0,
        discount_percentage: 0,
        tax_percentage: defaultTaxSetting?.value || 18, // Usa o valor do banco ou 18 como fallback
        default_payment_option: 'vista', // Padrão
        default_installments_lojista: 1,
        default_installments_cliente: 1,
        final_price: 0,
        sku: '', // Inicializa SKU vazio para novos serviços
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

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertServiceMutation.mutate(formData);
  };

  const filteredServices = services?.filter(service => {
    const matchesSearch = searchTerm === '' ||
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.sku.toLowerCase().includes(searchTerm.toLowerCase()); // NOVO: Busca por SKU
    
    const matchesCategory = filterCategory === 'Todas' || service.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const { valorBrutoCobradoDisplay, custoDisplay, deducaoImpostoDisplay, deducaoDescontoDisplay, custoParcelamentoDisplay, lucroLiquidoDisplay } = calculateMetrics(formData, installmentRates);

  if (isLoading || isLoadingRates) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-[#9ba8b5]">
          <Loader2 className="w-8 h-8 animate-spin mr-3" /> Carregando serviços e taxas...
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-destructive">
          Erro ao carregar serviços: {error?.message}
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
          <h1 className="text-4xl font-bold text-[#57e389]">Gerenciar Serviços</h1>
          <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Serviço
          </Button>
        </div>
        <p className="text-lg text-[#9ba8b5]">
          Crie, edite e organize todos os serviços que a Pontedra oferece aos seus clientes.
        </p>

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar serviço por nome, descrição ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
          <Select onValueChange={(value) => setFilterCategory(value)} value={filterCategory}>
            <SelectTrigger className="w-[180px] bg-card border-border text-foreground">
              <SelectValue placeholder="Filtrar por Categoria" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="Todas">Todas as Categorias</SelectItem>
                {serviceCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabela de Serviços */}
        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead className="text-muted-foreground">SKU</TableHead> {/* NOVO: Coluna SKU */}
                <TableHead className="text-muted-foreground">NOME</TableHead>
                <TableHead className="text-muted-foreground">CATEGORIA</TableHead>
                <TableHead className="text-muted-foreground">VALOR INICIAL</TableHead>
                <TableHead className="text-muted-foreground">IMPOSTO</TableHead>
                <TableHead className="text-muted-foreground">DESCONTO</TableHead>
                <TableHead className="text-muted-foreground">OPÇÃO PADRÃO</TableHead>
                <TableHead className="text-muted-foreground">VALOR FINAL</TableHead>
                <TableHead className="text-muted-foreground">LUCRO</TableHead>
                <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices && filteredServices.length > 0 ? (
                filteredServices.map((service) => {
                  const { lucroLiquidoDisplay: rowLucro } = calculateMetrics(service, installmentRates);
                  const defaultOptionText = service.default_payment_option === 'vista' ? 'À Vista (10% OFF)' :
                                            service.default_payment_option === 'lojista' ? `Lojista (${service.default_installments_lojista}x)` :
                                            service.default_payment_option === 'cliente' ? `Cliente (${service.default_installments_cliente}x)` : 'N/A';
                  return (
                    <TableRow key={service.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10">
                      <TableCell className="font-medium text-foreground py-4">{service.sku}</TableCell> {/* NOVO: Exibindo SKU */}
                      <TableCell className="font-medium text-foreground py-4">{service.name}</TableCell>
                      <TableCell className="text-muted-foreground py-4">{service.category}</TableCell>
                      <TableCell className="text-foreground py-4">R$ {service.price?.toFixed(2)}</TableCell>
                      <TableCell className="text-foreground py-4">{service.tax_percentage}%</TableCell>
                      <TableCell className="text-foreground py-4">{service.discount_percentage}%</TableCell>
                      <TableCell className="text-muted-foreground py-4">{defaultOptionText}</TableCell>
                      <TableCell className="text-foreground py-4">R$ {service.final_price?.toFixed(2)}</TableCell>
                      <TableCell className={`font-bold py-4 ${rowLucro >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        R$ {rowLucro.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(service)} className="text-primary hover:text-primary/80">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteServiceMutation.mutate(service.id)} className="text-destructive hover:text-destructive/80">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8"> {/* Colspan ajustado */}
                    Nenhum serviço encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog para Adicionar/Editar Serviço */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                {editingService ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Preencha os detalhes do serviço.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
              {/* NOVO: Campo SKU (somente leitura) */}
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-left">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={editingService?.sku || 'Gerado Automaticamente'}
                  readOnly
                  className="w-full bg-muted/50 border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-left">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleFormChange}
                  className="w-full bg-background border-border text-foreground"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-left">Categoria</Label>
                <Select
                  name="category"
                  value={formData.category || 'Web'}
                  onValueChange={(value) => handleSelectChange('category', value as ServiceItem['category'])}
                  disabled={!!editingService} // Desabilita a mudança de categoria ao editar para manter o SKU consistente
                >
                  <SelectTrigger className="w-full bg-background border-border text-foreground">
                    <SelectValue placeholder="Selecione a Categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {serviceCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="space-y-2">
                <Label htmlFor="initial_delivery_days" className="text-left">Prazo Inicial (dias)</Label>
                <Input
                  id="initial_delivery_days"
                  name="initial_delivery_days"
                  type="number"
                  value={formData.initial_delivery_days || 0}
                  onChange={handleFormChange}
                  className="w-full bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost" className="text-left">Custo (R$)</Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost || 0}
                  onChange={handleFormChange}
                  className="w-full bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-left">Preço Base (Valor Inicial) (R$)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price || 0}
                  onChange={handleFormChange}
                  className="w-full bg-background border-border text-foreground"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_percentage" className="text-left">Desconto (%)</Label>
                <Input
                  id="discount_percentage"
                  name="discount_percentage"
                  type="number"
                  step="0.01"
                  value={formData.discount_percentage || 0}
                  onChange={handleFormChange}
                  className="w-full bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_percentage" className="text-left">Imposto (%)</Label>
                <Input
                  id="tax_percentage"
                  name="tax_percentage"
                  type="number"
                  step="0.01"
                  value={formData.tax_percentage || 0}
                  onChange={handleFormChange}
                  className="w-full bg-background border-border text-foreground"
                />
              </div>

              {/* Opções de Pagamento Padrão */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-xl font-bold text-primary mb-4">Opções de Pagamento Padrão</h3>
                <RadioGroup
                  value={formData.default_payment_option || 'vista'}
                  onValueChange={(value: 'vista' | 'lojista' | 'cliente') => handleSelectChange('default_payment_option', value)}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vista" id="option-vista" />
                    <Label htmlFor="option-vista">À Vista (10% de Desconto)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lojista" id="option-lojista" />
                    <Label htmlFor="option-lojista">Parcelado (Lojista Paga Juros)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cliente" id="option-cliente" />
                    <Label htmlFor="option-cliente">Parcelado (Cliente Paga Juros)</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.default_payment_option === 'lojista' && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="installments-lojista" className="text-left">Parcelas (Lojista)</Label>
                  <Select
                    name="default_installments_lojista"
                    value={String(formData.default_installments_lojista || 1)}
                    onValueChange={(value) => handleSelectChange('default_installments_lojista', parseInt(value))}
                  >
                    <SelectTrigger className="w-full bg-background border-border text-foreground">
                      <SelectValue placeholder="Número de Parcelas" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      {installmentRates?.filter(r => r.installments <= 6).map(rate => ( // Lojista paga até 6x
                        <SelectItem key={rate.installments} value={String(rate.installments)}>
                          {rate.installments}x ({ (rate.merchant_pays_rate * 100).toFixed(2) }%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.default_payment_option === 'cliente' && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="installments-cliente" className="text-left">Parcelas (Cliente)</Label>
                  <Select
                    name="default_installments_cliente"
                    value={String(formData.default_installments_cliente || 1)}
                    onValueChange={(value) => handleSelectChange('default_installments_cliente', parseInt(value))}
                  >
                    <SelectTrigger className="w-full bg-background border-border text-foreground">
                      <SelectValue placeholder="Número de Parcelas" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      {installmentRates?.filter(r => r.installments >= 6 && r.installments <= 10).map(rate => ( // Cliente paga de 6x a 10x
                        <SelectItem key={rate.installments} value={String(rate.installments)}>
                          {rate.installments}x ({ (rate.client_pays_rate * 100).toFixed(2) }%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Detalhes do Lucro */}
              <div className="md:col-span-2 mt-4 pt-4 border-t border-border">
                <h3 className="text-xl font-bold text-primary mb-4">Detalhes do Lucro</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Valor Bruto Cobrado (R$)</Label>
                    <Input value={`R$ ${valorBrutoCobradoDisplay.toFixed(2)}`} readOnly className="bg-muted/50 border-border text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Custo do Serviço (R$)</Label>
                    <Input value={`R$ ${custoDisplay.toFixed(2)}`} readOnly className="bg-muted/50 border-border text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Dedução de Imposto (R$)</Label>
                    <Input value={`R$ ${deducaoImpostoDisplay.toFixed(2)}`} readOnly className="bg-muted/50 border-border text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Dedução de Desconto (R$)</Label>
                    <Input value={`R$ ${deducaoDescontoDisplay.toFixed(2)}`} readOnly className="bg-muted/50 border-border text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Custo de Parcelamento (R$)</Label>
                    <Input value={`R$ ${custoParcelamentoDisplay.toFixed(2)}`} readOnly className="bg-muted/50 border-border text-foreground" />
                  </div>
                </div>
              </div>

              {/* LUCRO LÍQUIDO */}
              <div className="md:col-span-2 flex justify-between items-center mt-4 pt-4 border-t border-border">
                <Label className="font-bold text-lg">LUCRO LÍQUIDO (R$)</Label>
                <Input
                  value={lucroLiquidoDisplay.toFixed(2)}
                  readOnly
                  className={`w-1/2 bg-muted/50 border-border font-bold text-lg text-right ${lucroLiquidoDisplay >= 0 ? 'text-green-500' : 'text-red-500'}`}
                />
              </div>
              <DialogFooter className="md:col-span-2 mt-6">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-background border-border text-foreground hover:bg-muted">
                  Cancelar
                </Button>
                <Button type="submit" disabled={upsertServiceMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {upsertServiceMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingService ? 'Salvar Alterações' : 'Adicionar Serviço'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}