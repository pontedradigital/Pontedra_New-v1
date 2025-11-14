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
import {
  Tag,
  CalendarDays,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  HardHat,
  Package,
  FileText,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces para dados aninhados (replicadas para garantir tipagem no popup)
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

interface ProjectDisplayData {
  id: string;
  project_id: string;
  client_id: string | null;
  budget_id: string | null;
  contract_type: 'monthly' | 'one-time';
  start_date: string;
  end_date: string | null;
  price_agreed: number;
  is_paid: boolean;
  payment_due_date: string | null;
  products: ServiceItem | null;
  packages: PackageItem | null;
  budgets: Budget | null;
  totalDeliveryDays: number;
  estimatedDeliveryDate: string; // Already formatted
  items: { name: string; type: 'service' | 'package' }[];
}

interface ProjectDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectDisplayData | null;
}

const ProjectDetailsPopup: React.FC<ProjectDetailsPopupProps> = ({ isOpen, onClose, project }) => {
  if (!project) return null;

  const getContractTypeBadgeVariant = (type: ProjectDisplayData['contract_type']) => {
    return type === 'one-time' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white';
  };

  const getPaymentStatusBadgeVariant = (isPaid: boolean) => {
    return isPaid ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Tag className="w-6 h-6" />
            Projeto #{project.project_id}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Detalhes completos do projeto contratado.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-150px)] pr-4 custom-scrollbar">
          <div className="space-y-6 py-4">
            {/* Informações Básicas do Projeto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><FileText className="w-4 h-4" /> Tipo de Contrato</p>
                <Badge className={getContractTypeBadgeVariant(project.contract_type)}>
                  {project.contract_type === 'one-time' ? 'Serviço Único' : 'Pacote Mensal'}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Preço Acordado</p>
                <p className="font-semibold text-foreground">R$ {project.price_agreed.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Data de Início</p>
                <p className="font-semibold text-foreground">{format(parseISO(project.start_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Prazo Estimado</p>
                <p className="font-semibold text-foreground">{project.totalDeliveryDays} dias úteis</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Data de Entrega Estimada</p>
                <p className="font-semibold text-foreground">{project.estimatedDeliveryDate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Status de Pagamento</p>
                <Badge className={getPaymentStatusBadgeVariant(project.is_paid)}>
                  {project.is_paid ? 'Pago' : 'Pendente'}
                </Badge>
                {!project.is_paid && project.payment_due_date && (
                  <p className="text-xs text-muted-foreground mt-1">Vencimento: {format(parseISO(project.payment_due_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                )}
              </div>
            </div>

            {/* Informações do Orçamento Vinculado (se houver) */}
            {project.budgets && (
              <div className="pt-4 border-t border-border">
                <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2"><FileText className="w-5 h-5" /> Orçamento Vinculado</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Cliente</p>
                    <p className="font-semibold text-foreground">{project.budgets.client_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4" /> E-mail</p>
                    <p className="font-semibold text-foreground">{project.budgets.client_email || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4" /> Telefone</p>
                    <p className="font-semibold text-foreground">{project.budgets.client_phone || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> Valor Total do Orçamento</p>
                    <p className="font-semibold text-foreground">R$ {project.budgets.total_amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Itens Contratados */}
            {project.items && project.items.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2"><HardHat className="w-5 h-5" /> Itens Contratados</h3>
                <ul className="space-y-2">
                  {project.items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-foreground">
                      {item.type === 'service' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Package className="w-4 h-4 text-purple-500" />}
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detalhes do Serviço/Pacote Principal (se não houver orçamento vinculado ou para clareza) */}
            {project.products && !project.budgets && (
              <div className="pt-4 border-t border-border">
                <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2"><HardHat className="w-5 h-5" /> Detalhes do Serviço Principal</h3>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nome do Serviço</p>
                  <p className="font-semibold text-foreground">{project.products.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Preço Final</p>
                  <p className="font-semibold text-foreground">R$ {project.products.final_price.toFixed(2)}</p>
                </div>
              </div>
            )}

            {project.packages && !project.budgets && (
              <div className="pt-4 border-t border-border">
                <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2"><Package className="w-5 h-5" /> Detalhes do Pacote Principal</h3>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nome do Pacote</p>
                  <p className="font-semibold text-foreground">{project.packages.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Preço Mensal</p>
                  <p className="font-semibold text-foreground">R$ {project.packages.price.toFixed(2)}</p>
                </div>
                {project.packages.package_services && project.packages.package_services.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground mb-1">Serviços no Pacote:</p>
                    <ul className="list-disc list-inside text-foreground text-sm">
                      {project.packages.package_services.map(ps => (
                        <li key={ps.products.id}>{ps.products.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsPopup;