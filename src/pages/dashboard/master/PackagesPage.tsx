import React, { useState, useMemo } from 'react'; // Adicionado useMemo
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
import { PlusCircle, Edit, Trash2, Loader2, Package, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area'; // Importar ScrollArea

// Tipos de dados para Pacotes
interface PackageItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number; // Preço mensal do pacote
  is_active: boolean;
  created_at: string;
  updated_at: string;
  services_in_package?: ServiceItem[]; // Serviços associados ao pacote
}

// Tipos de dados para Serviços (do products table)
interface ServiceItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  final_price: number; // O preço final que o cliente paga pelo serviço individual
  is_active: boolean; // Adicionado para filtragem client-side
}

export default function PackagesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null);
  const [formData, setFormData] = useState<Partial<PackageItem>>({});
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch packages with their associated service_ids
  const { data: packagesData, isLoading, isError, error } = useQuery<any[], Error>({ // Use 'any[]' temporariamente para dados brutos
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          package_services(
            service_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch all available services (from 'products' table)
  const { data: availableServices, isLoading: isLoadingServices } = useQuery<ServiceItem[], Error>({
    queryKey: ['availableServices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, sku, name, description, final_price, is_active')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Combine packagesData with availableServices on the client side
  const packages = useMemo(() => {
    if (!packagesData || !availableServices) return [];

    return packagesData.map(pkg => {
      const servicesInPackage = pkg.package_services
        .map((ps: { service_id: string }) => availableServices.find(s => s.id === ps.service_id))
        .filter(Boolean) as ServiceItem[]; // Filter out undefined and cast

      return {
        ...pkg,
        services_in_package: servicesInPackage,
      };
    });
  }, [packagesData, availableServices]);

  // Filtrar serviços ativos no lado do cliente
  const activeAvailableServices = availableServices?.filter(service => service.is_active) || [];

  // Calculate total price of selected services
  const calculateTotalServicesPrice = () => {
    if (!activeAvailableServices) return 0;
    return selectedServiceIds.reduce((total, serviceId) => {
      const service = activeAvailableServices.find(s => s.id === serviceId);
      return total + (service?.final_price || 0);
    }, 0);
  };

  // Add/Edit package mutation
  const upsertPackageMutation = useMutation<void, Error, { packageData: Partial<PackageItem>; serviceIds: string[] }>({
    mutationFn: async ({ packageData, serviceIds }) => {
      let currentPackageId = packageData.id;

      // 1. Upsert the package itself
      if (packageData.id) {
        const { error } = await supabase.from('packages').update(packageData).eq('id', packageData.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('packages').insert(packageData).select('id').single();
        if (error) throw error;
        currentPackageId = data.id;
      }

      // 2. Update package_services (delete existing, insert new ones)
      if (currentPackageId) {
        // Delete existing associations
        const { error: deleteError } = await supabase.from('package_services').delete().eq('package_id', currentPackageId);
        if (deleteError) throw deleteError;

        // Insert new associations
        if (serviceIds.length > 0) {
          const newAssociations = serviceIds.map(service_id => ({
            package_id: currentPackageId,
            service_id: service_id,
          }));
          const { error: insertError } = await supabase.from('package_services').insert(newAssociations);
          if (insertError) throw insertError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success(editingPackage ? 'Pacote atualizado com sucesso!' : 'Pacote adicionado com sucesso!');
      setIsDialogOpen(false);
      setEditingPackage(null);
      setFormData({});
      setSelectedServiceIds([]);
    },
    onError: (err) => {
      toast.error(`Erro ao salvar pacote: ${err.message}`);
    },
  });

  // Delete package mutation
  const deletePackageMutation = useMutation<void, Error, string>({
    mutationFn: async (packageId) => {
      const { error } = await supabase.from('packages').delete().eq('id', packageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Pacote excluído com sucesso!');
    },
    onError: (err) => {
      toast.error(`Erro ao excluir pacote: ${err.message}`);
    },
  });

  const handleOpenDialog = (pkg?: PackageItem) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData(pkg);
      setSelectedServiceIds(pkg.services_in_package?.map(s => s.id) || []);
    } else {
      setEditingPackage(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        is_active: true,
        sku: '', // Será gerado automaticamente
      });
      setSelectedServiceIds([]);
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

  const handleServiceSelection = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertPackageMutation.mutate({ packageData: formData, serviceIds: selectedServiceIds });
  };

  const filteredPackages = packages?.filter(pkg => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pkg.name.toLowerCase().includes(searchLower) ||
      pkg.description?.toLowerCase().includes(searchLower) ||
      pkg.sku.toLowerCase().includes(searchLower) ||
      pkg.services_in_package?.some(s => s.name.toLowerCase().includes(searchLower))
    );
  });

  if (isLoading || isLoadingServices) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-[#9ba8b5]">
          <Loader2 className="w-8 h-8 animate-spin mr-3" /> Carregando pacotes e serviços...
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-destructive">
          Erro ao carregar pacotes: {error?.message}
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
          <h1 className="text-4xl font-bold text-[#57e389]">Gerenciar Pacotes</h1>
          <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Pacote
          </Button>
        </div>
        <p className="text-lg text-[#9ba8b5]">
          Crie e gerencie pacotes de serviços, combinando ofertas para seus clientes.
        </p>

        {/* Filtro de Busca */}
        <div className="mb-6">
          <Input
            placeholder="Buscar pacote por nome, descrição, SKU ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Tabela de Pacotes */}
        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead className="text-muted-foreground">SKU</TableHead>
                <TableHead className="text-muted-foreground">NOME</TableHead>
                <TableHead className="text-muted-foreground">DESCRIÇÃO</TableHead>
                <TableHead className="text-muted-foreground">SERVIÇOS INCLUÍDOS</TableHead>
                <TableHead className="text-muted-foreground">PREÇO MENSAL</TableHead>
                <TableHead className="text-muted-foreground">STATUS</TableHead>
                <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackages && filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <TableRow key={pkg.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10">
                    <TableCell className="font-medium text-foreground py-4">{pkg.sku}</TableCell>
                    <TableCell className="font-medium text-foreground py-4">{pkg.name}</TableCell>
                    <TableCell className="text-muted-foreground py-4 max-w-[200px] truncate">
                      {pkg.description || 'N/A'}
                    </TableCell>
                    <TableCell className="py-4">
                      {pkg.services_in_package && pkg.services_in_package.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {pkg.services_in_package.map(service => (
                            <Badge key={service.id} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                              {service.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Nenhum serviço</span>
                      )}
                    </TableCell>
                    <TableCell className="text-foreground py-4">R$ {pkg.price?.toFixed(2)}</TableCell>
                    <TableCell className="py-4">
                      <Badge className={pkg.is_active ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}>
                        {pkg.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(pkg)} className="text-primary hover:text-primary/80">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deletePackageMutation.mutate(pkg.id)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum pacote encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog para Adicionar/Editar Pacote */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                {editingPackage ? 'Editar Pacote' : 'Adicionar Novo Pacote'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Preencha os detalhes do pacote e selecione os serviços incluídos.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-left">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={editingPackage?.sku || 'Gerado Automaticamente'}
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
                <Label htmlFor="price" className="text-left">Preço Mensal (R$)</Label>
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
                <Label htmlFor="is_active" className="text-left">Status</Label>
                <Select
                  name="is_active"
                  value={String(formData.is_active)}
                  onValueChange={(value) => handleFormChange({ target: { name: 'is_active', value: value === 'true', type: 'checkbox' } } as React.ChangeEvent<HTMLInputElement>)}
                >
                  <SelectTrigger className="w-full bg-background border-border text-foreground">
                    <SelectValue placeholder="Status do Pacote" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lista de Serviços Disponíveis */}
              <div className="md:col-span-2 mt-4 pt-4 border-t border-border">
                <h3 className="text-xl font-bold text-primary mb-4">Serviços Incluídos no Pacote</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Selecione os serviços que farão parte deste pacote.
                </p>
                <ScrollArea className="h-60 w-full rounded-md border border-border p-4 bg-background">
                  <div className="grid grid-cols-1 gap-3">
                    {activeAvailableServices.map(service => ( // Usando serviços ativos filtrados
                      <div key={service.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`service-${service.id}`}
                            checked={selectedServiceIds.includes(service.id)}
                            onChange={() => handleServiceSelection(service.id)}
                            className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                          />
                          <Label htmlFor={`service-${service.id}`} className="text-foreground cursor-pointer">
                            {service.name} <span className="text-muted-foreground text-sm">({service.sku})</span>
                          </Label>
                        </div>
                        <span className="text-primary font-semibold">R$ {service.final_price?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="mt-4 flex justify-between items-center text-lg font-bold text-foreground">
                  <span>Soma dos Serviços Selecionados:</span>
                  <span className="text-primary">R$ {calculateTotalServicesPrice().toFixed(2)}</span>
                </div>
              </div>

              {/* Informações de Pagamento (apenas display) */}
              <div className="md:col-span-2 mt-4 pt-4 border-t border-border">
                <h3 className="text-xl font-bold text-primary mb-4">Informações de Pagamento</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">Cobrança Mensal:</span> Cartão de Crédito (1x), Boleto ou Pix.
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Cobrança Anual:</span> Cartão de Crédito (até 12x), Boleto à vista ou Pix à vista.
                  </p>
                  <p className="text-sm italic">
                    O preço do pacote é o valor mensal. Para cobrança anual, o valor será {formData.price ? `R$ ${(formData.price * 12).toFixed(2)}` : 'R$ 0.00'}.
                  </p>
                </div>
              </div>

              <DialogFooter className="md:col-span-2 mt-6">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-background border-border text-foreground hover:bg-muted">
                  Cancelar
                </Button>
                <Button type="submit" disabled={upsertPackageMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {upsertPackageMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingPackage ? 'Salvar Alterações' : 'Adicionar Pacote'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}