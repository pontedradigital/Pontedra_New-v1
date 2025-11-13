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
  name: string;
  category: 'Web' | 'Sistemas' | 'Marketing' | 'Design' | 'Completo';
  description: string | null;
  initial_delivery_days: number | null;
  cost: number | null;
  price: number; // Preço base antes de impostos/descontos/juros
  discount_percentage: number | null;
  tax_percentage: number | null;
  
  // Novos campos para opções de pagamento padrão
  default_payment_option: 'vista' | 'lojista' | 'cliente';
  default_installments_lojista: number | null; // Número de parcelas se lojista paga
  default_installments_cliente: number | null; // Número de parcelas se cliente paga

  final_price: number | null; // Preço final calculado com base na default_payment_option
  created_at: string;
  updated_at: string;
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
    const cost = service.cost || 0;
    const basePrice = service.price || 0;
    const discount = service.discount_percentage || 0;
    const tax = service.tax_percentage || 0;

    // Preço após desconto e imposto (base para cálculos de parcelamento)
    let priceAfterDiscountAndTax = basePrice * (1 - discount / 100);
    priceAfterDiscountAndTax *= (1 + tax / 100);
    priceAfterDiscountAndTax = parseFloat(priceAfterDiscountAndTax.toFixed(2));

    // 1. Valor à vista (10% de desconto sobre o valor final)
    const priceVista = parseFloat((priceAfterDiscountAndTax * 0.90).toFixed(2));

    // 2. Valor parcelado (lojista paga juros)
    let priceLojista = priceAfterDiscountAndTax;
    const lojistaInstallments = service.default_installments_lojista || 1;
    const lojistaRate = rates?.find(r => r.installments === lojistaInstallments)?.merchant_pays_rate || 0;
    if (lojistaRate > 0) {
      priceLojista = parseFloat((priceAfterDiscountAndTax / (1 - lojistaRate)).toFixed(2));
    }

    // 3. Valor parcelado (cliente paga juros)
    let priceCliente = priceAfterDiscountAndTax;
    const clienteInstallments = service.default_installments_cliente || 1;
    const clienteRate = rates?.find(r => r.installments === clienteInstallments)?.client_pays_rate || 0;
    if (clienteRate > 0) {
      priceCliente = parseFloat((priceAfterDiscountAndTax * (1 + clienteRate)).toFixed(2));
    }

    let finalPrice = 0;
    switch (service.default_payment_option) {
      case 'vista':
        finalPrice = priceVista;
        break;
      case 'lojista':
        finalPrice = priceLojista;
        break;
      case 'cliente':
        finalPrice = priceCliente;
        break;
      default:
        finalPrice = priceAfterDiscountAndTax; // Fallback
    }
    finalPrice = parseFloat(finalPrice.toFixed(2));

    const profit = parseFloat((finalPrice - cost).toFixed(2));

    return {
      priceAfterDiscountAndTax,
      priceVista,
      priceLojista,
      priceCliente,
      finalPrice,
      profit,
    };
  };

  // Add/Edit service mutation (to 'products' table)
  const upsertServiceMutation = useMutation<void, Error, Partial<ServiceItem>>({
    mutationFn: async (newService) => {
      const { finalPrice } = calculateMetrics(newService, installmentRates);
      const serviceToSave = { ...newService, final_price: finalPrice };

      if (newService.id) {
        const { error } = await supabase.from('products').update(serviceToSave).eq('id', newService.id);
        if (error) throw error;
      } else {
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
    upsertServiceMutation.mutate(formData);
  };

  const filteredServices = services?.filter(service => {
    const matchesSearch = searchTerm === '' ||
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'Todas' || service.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const { priceAfterDiscountAndTax, priceVista, priceLojista, priceCliente, finalPrice, profit } = calculateMetrics(formData, installmentRates);

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
            placeholder="Buscar serviço por nome ou descrição..."
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
                <TableHead className="text-muted-foreground">NOME</TableHead>
                <TableHead className="text-muted-foreground">CATEGORIA</TableHead>
                <TableHead className="text-muted-foreground">PREÇO BASE</TableHead>
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
                  const { finalPrice: rowFinalPrice, profit: rowProfit } = calculateMetrics(service, installmentRates);
                  const defaultOptionText = service.default_payment_option === 'vista' ? 'À Vista' :
                                            service.default_payment_option === 'lojista' ? `Lojista (${service.default_installments_lojista}x)` :
                                            service.default_payment_option === 'cliente' ? `Cliente (${service.default_installments_cliente}x)` : 'N/A';
                  return (
                    <TableRow key={service.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10">
                      <TableCell className="font-medium text-foreground py-4">{service.name}</TableCell>
                      <TableCell className="text-muted-foreground py-4">{service.category}</TableCell>
                      <TableCell className="text-foreground py-4">R$ {service.price?.toFixed(2)}</TableCell>
                      <TableCell className="text-foreground py-4">{service.tax_percentage}%</TableCell>
                      <TableCell className="text-foreground py-4">{service.discount_percentage}%</TableCell>
                      <TableCell className="text-muted-foreground py-4">{defaultOptionText}</TableCell>
                      <TableCell className="text-foreground py-4">R$ {rowFinalPrice?.toFixed(2)}</TableCell>
                      <TableCell className={`font-bold py-4 ${rowProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        R$ {rowProfit.toFixed(2)}
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
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    Nenhum serviço encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog para Adicionar/Editar Serviço */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                {editingService ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Preencha os detalhes do serviço.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleFormChange}
                  className="col-span-3 bg-background border-border text-foreground"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Categoria</Label>
                <Select
                  name="category"
                  value={formData.category || 'Web'}
                  onValueChange={(value) => handleSelectChange('category', value as ServiceItem['category'])}
                >
                  <SelectTrigger className="col-span-3 bg-background border-border text-foreground">
                    <SelectValue placeholder="Selecione a Categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {serviceCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleFormChange}
                  className="col-span-3 bg-background border-border text-foreground"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="initial_delivery_days" className="text-right">Prazo Inicial (dias)</Label>
                <Input
                  id="initial_delivery_days"
                  name="initial_delivery_days"
                  type="number"
                  value={formData.initial_delivery_days || 0}
                  onChange={handleFormChange}
                  className="col-span-3 bg-background border-border text-foreground"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost" className="text-right">Custo (R$)</Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost || 0}
                  onChange={handleFormChange}
                  className="col-span-3 bg-background border-border text-foreground"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Preço Base (R$)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price || 0}
                  onChange={handleFormChange}
                  className="col-span-3 bg-background border-border text-foreground"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discount_percentage" className="text-right">Desconto (%)</Label>
                <Input
                  id="discount_percentage"
                  name="discount_percentage"
                  type="number"
                  step="0.01"
                  value={formData.discount_percentage || 0}
                  onChange={handleFormChange}
                  className="col-span-3 bg-background border-border text-foreground"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tax_percentage" className="text-right">Imposto (%)</Label>
                <Input
                  id="tax_percentage"
                  name="tax_percentage"
                  type="number"
                  step="0.01"
                  value={formData.tax_percentage || 0}
                  onChange={handleFormChange}
                  className="col-span-3 bg-background border-border text-foreground"
                />
              </div>

              {/* Opções de Pagamento Padrão */}
              <div className="col-span-4 mt-4">
                <h3 className="text-xl font-bold text-primary mb-4">Opções de Pagamento Padrão</h3>
                <RadioGroup
                  value={formData.default_payment_option || 'vista'}
                  onValueChange={(value: 'vista' | 'lojista' | 'cliente') => handleSelectChange('default_payment_option', value)}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vista" id="option-vista" />
                    <Label htmlFor="option-vista">À Vista (10% OFF)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lojista" id="option-lojista" />
                    <Label htmlFor="option-lojista">Lojista Paga Juros</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cliente" id="option-cliente" />
                    <Label htmlFor="option-cliente">Cliente Paga Juros</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.default_payment_option === 'lojista' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="installments-lojista" className="text-right">Parcelas (Lojista)</Label>
                  <Select
                    name="default_installments_lojista"
                    value={String(formData.default_installments_lojista || 1)}
                    onValueChange={(value) => handleSelectChange('default_installments_lojista', parseInt(value))}
                  >
                    <SelectTrigger className="col-span-3 bg-background border-border text-foreground">
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="installments-cliente" className="text-right">Parcelas (Cliente)</Label>
                  <Select
                    name="default_installments_cliente"
                    value={String(formData.default_installments_cliente || 1)}
                    onValueChange={(value) => handleSelectChange('default_installments_cliente', parseInt(value))}
                  >
                    <SelectTrigger className="col-span-3 bg-background border-border text-foreground">
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

              {/* Valores Calculados */}
              <div className="col-span-4 mt-4 pt-4 border-t border-border">
                <h3 className="text-xl font-bold text-primary mb-4">Valores Calculados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Preço após Desc. e Imposto</Label>
                    <Input value={`R$ ${priceAfterDiscountAndTax.toFixed(2)}`} readOnly className="bg-muted/50 border-border text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Preço À Vista (10% OFF)</Label>
                    <Input value={`R$ ${priceVista.toFixed(2)}`} readOnly className="bg-muted/50 border-border text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Preço Parcelado (Lojista)</Label>
                    <Input value={`R$ ${priceLojista.toFixed(2)}`} readOnly className="bg-muted/50 border-border text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Preço Parcelado (Cliente)</Label>
                    <Input value={`R$ ${priceCliente.toFixed(2)}`} readOnly className="bg-muted/50 border-border text-foreground" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4 mt-4 pt-4 border-t border-border">
                <Label className="text-right font-bold">VALOR FINAL (R$)</Label>
                <Input
                  value={finalPrice.toFixed(2)}
                  readOnly
                  className="col-span-3 bg-muted/50 border-border text-foreground font-bold text-lg"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">LUCRO (R$)</Label>
                <Input
                  value={profit.toFixed(2)}
                  readOnly
                  className={`col-span-3 bg-muted/50 border-border font-bold text-lg ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}
                />
              </div>
              <DialogFooter>
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