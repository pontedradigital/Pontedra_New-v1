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
  CalendarDays,
  Clock,
  User,
  Mail,
  Phone,
  Info,
  Tag,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces para as tabelas (replicadas para garantir tipagem no popup)
interface Appointment {
  id: string;
  client_id: string;
  master_id: string;
  start_time: string; // TIMESTAMP WITH TIME ZONE
  end_time:   string;   // TIMESTAMP WITH TIME ZONE
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  created_at: string;
  client_name: string | null;
  client_email: string | null;
  master_email?: string;
  master_name?: string; // Adicionado para exibir o nome do master
  client_phone?: string; // Adicionado para exibir o telefone do cliente
}

interface AppointmentDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

const AppointmentDetailsPopup: React.FC<AppointmentDetailsPopupProps> = ({ isOpen, onClose, appointment }) => {
  if (!appointment) return null;

  const getStatusBadgeVariant = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'confirmed': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'cancelled': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'completed': return 'bg-blue-500 hover:bg-blue-600 text-white';
      default: return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <CalendarDays className="w-6 h-6" />
            Detalhes do Agendamento
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Informações completas sobre o agendamento.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-150px)] pr-4 custom-scrollbar">
          <div className="space-y-6 py-4">
            {/* Informações do Agendamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Tag className="w-4 h-4" /> ID do Agendamento</p>
                <p className="font-semibold text-foreground">{appointment.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Info className="w-4 h-4" /> Status</p>
                <Badge className={getStatusBadgeVariant(appointment.status)}>
                  {appointment.status === 'pending' ? 'Pendente' :
                   appointment.status === 'confirmed' ? 'Confirmado' :
                   appointment.status === 'cancelled' ? 'Cancelado' :
                   appointment.status === 'completed' ? 'Concluído' : 'Desconhecido'}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Data</p>
                <p className="font-semibold text-foreground">{format(parseISO(appointment.start_time), 'dd/MM/yyyy', { locale: ptBR })}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Horário</p>
                <p className="font-semibold text-foreground">{format(parseISO(appointment.start_time), 'HH:mm', { locale: ptBR })} - {format(parseISO(appointment.end_time), 'HH:mm', { locale: ptBR })}</p>
              </div>
            </div>

            {/* Informações do Cliente */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2"><User className="w-5 h-5" /> Detalhes do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Nome</p>
                  <p className="font-semibold text-foreground">{appointment.client_name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4" /> E-mail</p>
                  <p className="font-semibold text-foreground">{appointment.client_email || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4" /> Telefone</p>
                  <p className="font-semibold text-foreground">{appointment.client_phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Informações do Master */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2"><User className="w-5 h-5" /> Detalhes do Master</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Nome</p>
                  <p className="font-semibold text-foreground">{appointment.master_name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4" /> E-mail</p>
                  <p className="font-semibold text-foreground">{appointment.master_email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Notas */}
            {appointment.notes && (
              <div className="pt-4 border-t border-border">
                <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2"><Info className="w-5 h-5" /> Notas</h3>
                <p className="text-foreground leading-relaxed">{appointment.notes}</p>
              </div>
            )}

            {/* Data de Criação */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Criado em</p>
              <p className="font-semibold text-foreground">{format(parseISO(appointment.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsPopup;