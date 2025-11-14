import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Tag,
  Link as LinkIcon,
  Globe,
  CalendarDays,
  MapPin,
  Info, // Adicionado o ícone Info
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadItem {
  id: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  assunto: string | null;
  mensagem: string | null;
  origem: string | null;
  url_captura: string | null;
  ip_address: string | null;
  created_at: string;
}

interface LeadDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadItem | null;
}

const LeadDetailsPopup: React.FC<LeadDetailsPopupProps> = ({ isOpen, onClose, lead }) => {
  if (!lead) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <User className="w-6 h-6" />
            Detalhes do Lead: {lead.nome || 'N/A'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Informações completas sobre o lead capturado.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-150px)] pr-4 custom-scrollbar">
          <div className="space-y-6 py-4">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Nome</p>
                <p className="font-semibold text-foreground">{lead.nome || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4" /> E-mail</p>
                <p className="font-semibold text-foreground">{lead.email || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4" /> Telefone</p>
                <p className="font-semibold text-foreground">{formatPhoneNumber(lead.telefone)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Tag className="w-4 h-4" /> Origem</p>
                <p className="font-semibold text-foreground">{lead.origem || 'N/A'}</p>
              </div>
            </div>

            {/* Assunto e Mensagem */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Mensagem</h3>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Assunto</p>
                <p className="font-semibold text-foreground">{lead.assunto || 'N/A'}</p>
              </div>
              <div className="space-y-1 mt-4">
                <p className="text-sm text-muted-foreground">Conteúdo</p>
                <p className="text-foreground leading-relaxed">{lead.mensagem || 'N/A'}</p>
              </div>
            </div>

            {/* Detalhes Técnicos */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2"><Info className="w-5 h-5" /> Detalhes Técnicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><LinkIcon className="w-4 h-4" /> URL de Captura</p>
                  <a href={lead.url_captura || '#'} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline break-all">
                    {lead.url_captura || 'N/A'}
                  </a>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4" /> Endereço IP</p>
                  <p className="font-semibold text-foreground">{lead.ip_address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Data de Criação */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Criado em</p>
              <p className="font-semibold text-foreground">{format(parseISO(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailsPopup;