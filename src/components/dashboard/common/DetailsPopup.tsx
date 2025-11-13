import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DollarSign, Percent, CalendarDays, Package, HardHat, Info, Tag, CheckCircle, XCircle } from 'lucide-react';

// Tipos de dados para Serviços (do products table)
interface ServiceItem {
  id: string;
  sku: string;
  name: string;
  category: 'Web' | 'Sistemas' | 'Marketing' | 'Design' | 'Completo';
  description: string | null;
  initial_delivery_days: number | null;
  cost: number | null;
  price: number; // Preço base (valor inicial antes de qualquer ajuste de pagamento)
  discount_percentage: number | null;
  tax_percentage: number | null;
  default_payment_option: 'vista' | 'lojista' | 'cliente';
  default_installments_lojista: number | null;
  default_installments_cliente: number | null;
  final_price: number | null; // Este campo no DB armazena o valor que o cliente paga
  created_at: string;
  updated_at: string;
}

// Tipos de dados para Pacotes
interface PackageItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number; // Preço mensal final calculado (já com o desconto do pacote)
  discount_percentage: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  services_in_package?: ServiceItem[]; // Serviços incluídos no pacote
  sum_of_services_price?: number; // Soma dos preços dos serviços sem desconto do pacote
  annual_price_with_discount?: number; // Valor anual com desconto
  monthly_price_from_annual?: number; // Valor mensal do pacote anual
}

type DetailedItem = ServiceItem | PackageItem;

interface DetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  data: DetailedItem | null;
}

const DetailsPopup: React.FC<DetailsPopupProps> = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  const isService = (item: DetailedItem): item is ServiceItem => {
    return (item as ServiceItem).category !== undefined;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            {isService(data) ? <HardHat className="w-6 h-6" /> : <Package className="w-6 h-6" />}
            {data.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Detalhes completos de {isService(data) ? 'serviço' : 'pacote'}.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-150px)] pr-4 custom-scrollbar">
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Tag className="w-4 h-4" /> SKU</p>
                <p className="font-semibold text-foreground">{data.sku}</p>
              </div>
              {isService(data) && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><Info className="w-4 h-4" /> Categoria</p>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{data.category}</Badge>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2"><Info className="w-4 h-4" /> Descrição</p>
              <p className="text-foreground leading-relaxed">{data.description || 'N/A'}</p>
            </div>

            {isService(data) ? (
              // Detalhes específicos para Serviço
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Preço Base</p>
                    <p className="font-semibold text-foreground">R$ {data.price?.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Custo</p>
                    <p className="font-semibold text-foreground">R$ {data.cost?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Percent className="w-4 h-4" /> Desconto</p>
                    <p className="font-semibold text-foreground">{data.discount_percentage?.toFixed(2) || '0.00'}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Percent className="w-4 h-4" /> Imposto</p>
                    <p className="font-semibold text-foreground">{data.tax_percentage?.toFixed(2) || '0.00'}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Prazo Inicial</p>
                    <p className="font-semibold text-foreground">{data.initial_delivery_days || 'N/A'} dias</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Opção de Pagamento Padrão</p>
                    <p className="font-semibold text-foreground capitalize">
                      {data.default_payment_option === 'vista' ? 'À Vista' :
                       data.default_payment_option === 'lojista' ? `Lojista (${data.default_installments_lojista}x)` :
                       data.default_payment_option === 'cliente' ? `Cliente (${data.default_installments_cliente}x)` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 pt-4 border-t border-border">
                  <p className="text-lg font-bold text-primary flex items-center gap-2"><DollarSign className="w-5 h-5" /> Preço Final para Cliente</p>
                  <p className="text-2xl font-bold text-foreground">R$ {data.final_price?.toFixed(2)}</p>
                </div>
              </>
            ) : (
              // Detalhes específicos para Pacote
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Percent className="w-4 h-4" /> Desconto do Pacote</p>
                    <p className="font-semibold text-foreground">{data.discount_percentage?.toFixed(2) || '0.00'}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Info className="w-4 h-4" /> Status</p>
                    <Badge className={data.is_active ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}>
                      {data.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Valor Total dos Serviços (Sem Desc.)</p>
                    <p className="font-semibold text-foreground">R$ {data.sum_of_services_price?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Valor Mensal (Com Desc. do Pacote)</p>
                    <p className="font-semibold text-foreground">R$ {data.price?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Valor Anual (Com Desc. Anual)</p>
                    <p className="font-semibold text-foreground">R$ {data.annual_price_with_discount?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Valor Mensal (Pacote Anual)</p>
                    <p className="font-semibold text-foreground">R$ {data.monthly_price_from_annual?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>

                {data.services_in_package && data.services_in_package.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2"><HardHat className="w-5 h-5" /> Serviços Incluídos</h3>
                    <ul className="space-y-2">
                      {data.services_in_package.map(service => (
                        <li key={service.id} className="flex items-center gap-2 text-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {service.name} (<span className="text-muted-foreground">{service.sku}</span>) - R$ {service.final_price?.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DetailsPopup;