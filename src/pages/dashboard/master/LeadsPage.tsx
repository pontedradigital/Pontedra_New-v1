import React, { useState, useMemo } from 'react';
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
import {
  Users,
  Loader2,
  Trash2,
  Eye,
  Mail,
  Phone,
  MessageSquare,
  Tag,
  Search,
  RefreshCw,
  CheckCircle, // Adicionado para o ícone de lido
  CircleDot, // Adicionado para o ícone de não lido
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LeadDetailsPopup from '@/components/dashboard/master/LeadDetailsPopup';
import { Badge } from '@/components/ui/badge'; // Importar Badge

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
  is_read: boolean; // NOVO: Adicionado status de leitura
}

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailsPopupOpen, setIsDetailsPopupOpen] = useState(false);
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<LeadItem | null>(null);

  // Fetch leads from 'site_contato' table
  const { data: leads, isLoading, isError, error, refetch } = useQuery<LeadItem[], Error>({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_contato')
        .select('*') // Seleciona todos os campos, incluindo is_read
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Mutation to delete a lead
  const deleteLeadMutation = useMutation<void, Error, string>({
    mutationFn: async (leadId) => {
      const { error } = await supabase.from('site_contato').delete().eq('id', leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead excluído com sucesso!');
    },
    onError: (err) => {
      toast.error(`Erro ao excluir lead: ${err.message}`);
    },
  });

  // NOVO: Mutation to mark a lead as read
  const markLeadAsReadMutation = useMutation<void, Error, string>({
    mutationFn: async (leadId) => {
      const { error } = await supabase
        .from('site_contato')
        .update({ is_read: true })
        .eq('id', leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] }); // Invalida para atualizar a lista
    },
    onError: (err) => {
      console.error("Erro ao marcar lead como lido:", err);
      // Não exibe toast de erro para o usuário, pois é uma ação de fundo
    },
  });

  const handleRowClick = (lead: LeadItem) => {
    setSelectedLeadForDetails(lead);
    setIsDetailsPopupOpen(true);
    // Se o lead não foi lido, marca como lido
    if (!lead.is_read) {
      markLeadAsReadMutation.mutate(lead.id);
    }
  };

  const handleRefreshLeads = () => {
    refetch();
    toast.info("Atualizando lista de leads...");
  };

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

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    const searchLower = searchTerm.toLowerCase();
    return leads.filter(lead =>
      lead.nome?.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.telefone?.toLowerCase().includes(searchLower) ||
      lead.assunto?.toLowerCase().includes(searchLower) ||
      lead.mensagem?.toLowerCase().includes(searchLower) ||
      lead.origem?.toLowerCase().includes(searchLower)
    );
  }, [leads, searchTerm]);

  const popupLeads = useMemo(() => filteredLeads.filter(lead => lead.origem === 'Popup de Captura'), [filteredLeads]);
  const formLeads = useMemo(() => filteredLeads.filter(lead => lead.origem === 'Formulário de Contato do Site'), [filteredLeads]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-[#9ba8b5]">
          <Loader2 className="w-8 h-8 animate-spin mr-3" /> Carregando leads...
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-destructive">
          Erro ao carregar leads: {error?.message}
        </div>
      </DashboardLayout>
    );
  }

  const renderLeadsTable = (leadsToRender: LeadItem[], title: string) => (
    <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden mb-8">
      <h2 className="text-2xl font-bold text-foreground p-6 border-b border-border flex items-center gap-3">
        <Tag className="w-6 h-6 text-primary" /> {title} ({leadsToRender.length})
      </h2>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/20">
            <TableHead className="text-muted-foreground">NOME</TableHead>
            <TableHead className="text-muted-foreground">CONTATO</TableHead>
            <TableHead className="text-muted-foreground">ASSUNTO</TableHead>
            <TableHead className="text-muted-foreground">DATA</TableHead>
            <TableHead className="text-muted-foreground">STATUS</TableHead> {/* NOVO: Coluna Status */}
            <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leadsToRender.length > 0 ? (
            leadsToRender.map((lead) => (
              <TableRow key={lead.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10 cursor-pointer" onClick={() => handleRowClick(lead)}>
                <TableCell className="font-medium text-foreground py-4">
                  {lead.nome || 'N/A'}
                </TableCell>
                <TableCell className="text-muted-foreground py-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {lead.email || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4" /> {formatPhoneNumber(lead.telefone)}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground py-4 max-w-[250px] truncate">
                  {lead.assunto || 'N/A'}
                </TableCell>
                <TableCell className="text-muted-foreground py-4">
                  {format(parseISO(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </TableCell>
                <TableCell className="py-4"> {/* NOVO: Célula de Status */}
                  <Badge className={lead.is_read ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'}>
                    {lead.is_read ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <CircleDot className="h-3 w-3 mr-1" />
                    )}
                    {lead.is_read ? 'Mensagem Lida' : 'Não Lida'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-4">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleRowClick(lead); }} className="text-blue-500 hover:text-blue-600">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteLeadMutation.mutate(lead.id); }} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8"> {/* Colspan ajustado */}
                Nenhum lead encontrado nesta categoria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Users className="w-10 h-10 text-[#57e389]" />
            <h1 className="text-4xl font-bold text-foreground">Gerenciar Leads</h1>
          </div>
          <Button onClick={handleRefreshLeads} className="bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md">
            <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
          </Button>
        </div>
        <p className="text-lg text-[#9ba8b5]">
          Visualize e gerencie todos os leads capturados através do seu site.
        </p>

        {/* Filtro de Busca */}
        <div className="mb-6">
          <Input
            placeholder="Buscar leads por nome, e-mail, telefone, assunto ou mensagem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-lg bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Seção de Leads do Pop-up */}
        {renderLeadsTable(popupLeads, 'Leads do Pop-up')}

        {/* Seção de Leads do Formulário */}
        {renderLeadsTable(formLeads, 'Leads do Formulário de Contato')}

        {/* Pop-up de Detalhes do Lead */}
        <LeadDetailsPopup
          isOpen={isDetailsPopupOpen}
          onClose={() => setIsDetailsPopupOpen(false)}
          lead={selectedLeadForDetails}
        />
      </motion.div>
    </DashboardLayout>
  );
}