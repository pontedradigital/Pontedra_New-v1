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
import { PlusCircle, Edit, Trash2, Loader2, HardHat, DollarSign, Percent, CalendarDays } from 'lucide-react';

// Tipos de dados para Serviços (anteriormente Produtos)
interface ServiceItem {
  id: string;
  name: string;
  category: 'Web' | 'Sistemas' | 'Marketing' | 'Design' | 'Completo';
  description: string | null;
  initial_delivery_days: number | null;
  cost: number | null;
  price: number;
  discount_percentage: number | null;
  tax_percentage: number | null;
  final_price: number | null;
  created_at: string;
  updated_at: string;
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

  // Calculate final price for a service
  const calculateFinalPrice = (service: Partial<ServiceItem>): number => {
    let calculatedPrice = service.price || 0;
    if (service.discount_percentage) {
      calculatedPrice -= calculatedPrice * (service.discount_percentage / 100);
    }
    if (service.tax_percentage) {
      calculatedPrice += calculatedPrice * (service.tax_percentage / 100);
    }
    return parseFloat(calculatedPrice.toFixed(2));
  };

  // Add/Edit service mutation (to 'products' table)
  const upsertServiceMutation = useMutation<void, Error, Partial<ServiceItem>>({
    mutationFn: async (newService) => {
      const finalPrice = calculateFinalPrice(newService);
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
        tax_percentage: 0,
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-[#9ba8b5]">
          <Loader2 className="w-8 h-8 animate-spin mr-3" /> Carregando serviços...
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
                <TableHead className="text-muted-foreground">PREÇO</TableHead>
                <TableHead className="text-muted-foreground">DESCONTO</TableHead>
                <TableHead className="text-muted-foreground">IMPOSTO</TableHead>
                <TableHead className="text-muted-foreground">VALOR FINAL</TableHead>
                <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices && filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <TableRow key={service.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10">
                    <TableCell className="font-medium text-foreground py-4">{service.name}</TableCell>
                    <TableCell className="text-muted-foreground py-4">{service.category}</TableCell>
                    <TableCell className="text-foreground py-4">R$ {service.price?.toFixed(2)}</TableCell>
                    <TableCell className="text-foreground py-4">{service.discount_percentage}%</TableCell>
                    <TableCell className="text-foreground py-4">{service.tax_percentage}%</TableCell>
                    <TableCell className="text-foreground py-4">R$ {service.final_price?.toFixed(2)}</TableCell>
                    <TableCell className="text-right py-4">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(service)} className="text-primary hover:text-primary/80">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteServiceMutation.mutate(service.id)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
                <Label htmlFor="price" className="text-right">Preço de Venda (R$)</Label>
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold">Valor Final (R$)</Label>
                <Input
                  value={calculateFinalPrice(formData).toFixed(2)}
                  readOnly
                  className="col-span-3 bg-muted/50 border-border text-foreground font-bold"
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