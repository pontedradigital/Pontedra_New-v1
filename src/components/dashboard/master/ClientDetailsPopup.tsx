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
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  CalendarDays,
  Clock,
  Info,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos de dados para o perfil do usuário (completo)
interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  telefone: string | null;
  role: 'prospect' | 'client' | 'master';
  status: 'ativo' | 'inativo';
  company_organization: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_cep: string | null;
  date_of_birth: string | null; // Formato 'YYYY-MM-DD'
  created_at: string;
  email: string;
}

interface ClientDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  client: UserProfile | null;
}

const ClientDetailsPopup: React.FC<ClientDetailsPopupProps> = ({ isOpen, onClose, client }) => {
  if (!client) return null;

  const formatPhoneNumber = (value: string | null) => {
    if (!value) return 'N/A';
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    }
    return value;
  };

  const formatCep = (value: string | null) => {
    if (!value) return 'N/A';
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
    }
    return value;
  };

  const getRoleBadgeVariant = (role: UserProfile['role']) => {
    switch (role) {
      case 'master': return 'bg-purple-500 hover:bg-purple-600 text-white';
      case 'client': return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'prospect': return 'bg-gray-500 hover:bg-gray-600 text-white';
      default: return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  const getStatusBadgeVariant = (status: UserProfile['status']) => {
    switch (status) {
      case 'ativo': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'inativo': return 'bg-red-500 hover:bg-red-600 text-white';
      default: return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <User className="w-6 h-6" />
            {client.first_name} {client.last_name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Detalhes completos do perfil do cliente.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-150px)] pr-4 custom-scrollbar">
          <div className="space-y-6 py-4">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4" /> E-mail</p>
                <p className="font-semibold text-foreground">{client.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4" /> Telefone</p>
                <p className="font-semibold text-foreground">{formatPhoneNumber(client.telefone)}</p>
              </div>
            </div>

            {/* Papel e Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Info className="w-4 h-4" /> Papel</p>
                <Badge className={getRoleBadgeVariant(client.role)}>{client.role}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Info className="w-4 h-4" /> Status</p>
                <Badge className={getStatusBadgeVariant(client.status)}>{client.status}</Badge>
              </div>
            </div>

            {/* Empresa/Organização */}
            {client.company_organization && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Building className="w-4 h-4" /> Empresa/Organização</p>
                <p className="font-semibold text-foreground">{client.company_organization}</p>
              </div>
            )}

            {/* Data de Nascimento */}
            {client.date_of_birth && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Data de Nascimento</p>
                <p className="font-semibold text-foreground">{format(parseISO(client.date_of_birth), 'dd/MM/yyyy', { locale: ptBR })}</p>
              </div>
            )}

            {/* Endereço */}
            {(client.address_street || client.address_city || client.address_cep) && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4" /> Endereço</p>
                <p className="font-semibold text-foreground">
                  {client.address_street}
                  {client.address_number && `, ${client.address_number}`}
                  {client.address_complement && ` - ${client.address_complement}`}
                  {client.address_neighborhood && ` - ${client.address_neighborhood}`}
                  {client.address_city && ` - ${client.address_city}`}
                  {client.address_state && `/${client.address_state}`}
                  {client.address_cep && ` - CEP: ${formatCep(client.address_cep)}`}
                </p>
              </div>
            )}

            {/* Data de Cadastro */}
            <div className="space-y-1 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Data de Cadastro</p>
              <p className="font-semibold text-foreground">{format(parseISO(client.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsPopup;