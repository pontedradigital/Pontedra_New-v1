import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, CalendarDays, MessageSquare, FileText, ArrowRight, CircleDot } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface Appointment {
  id: string;
  start_time: string;
  client_name: string | null;
  created_at: string;
}

interface Lead {
  id: string;
  nome: string | null;
  origem: string | null;
  is_read: boolean;
  created_at: string;
}

interface Budget {
  id: string;
  proposal_number: string;
  client_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  created_at: string;
}

type LatestUpdateItem = {
  type: 'appointment' | 'lead' | 'budget';
  id: string;
  title: string;
  description: string;
  date: string;
  link: string;
  is_read?: boolean; // Para leads
};

export default function LatestUpdatesCard() {
  // Fetch latest appointments
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[], Error>({
    queryKey: ['latestAppointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, start_time, client_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  // Fetch latest leads
  const { data: leads, isLoading: isLoadingLeads } = useQuery<Lead[], Error>({
    queryKey: ['latestLeads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_contato')
        .select('id, nome, origem, is_read, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  // Fetch latest budgets
  const { data: budgets, isLoading: isLoadingBudgets } = useQuery<Budget[], Error>({
    queryKey: ['latestBudgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('id, proposal_number, client_name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const latestUpdates = React.useMemo(() => {
    const updates: LatestUpdateItem[] = [];

    appointments?.forEach(app => {
      updates.push({
        type: 'appointment',
        id: app.id,
        title: `Novo Agendamento: ${app.client_name || 'Cliente Desconhecido'}`,
        description: `Em ${format(parseISO(app.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
        date: app.created_at,
        link: '/dashboard/appointments',
      });
    });

    leads?.forEach(lead => {
      updates.push({
        type: 'lead',
        id: lead.id,
        title: `Novo Lead: ${lead.nome || 'Anônimo'}`,
        description: `Origem: ${lead.origem || 'N/A'}`,
        date: lead.created_at,
        link: '/dashboard/leads',
        is_read: lead.is_read,
      });
    });

    budgets?.forEach(budget => {
      updates.push({
        type: 'budget',
        id: budget.id,
        title: `Novo Orçamento: #${budget.proposal_number}`,
        description: `Cliente: ${budget.client_name} - Status: ${budget.status}`,
        date: budget.created_at,
        link: '/dashboard/budgets',
      });
    });

    return updates.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).slice(0, 5);
  }, [appointments, leads, budgets]);

  if (isLoadingAppointments || isLoadingLeads || isLoadingBudgets) {
    return (
      <Card className="bg-card border-border shadow-lg rounded-xl col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Últimas Novidades
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" /> Carregando novidades...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-lg rounded-xl col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" /> Últimas Novidades
        </CardTitle>
      </CardHeader>
      <CardContent>
        {latestUpdates.length > 0 ? (
          <div className="space-y-4">
            {latestUpdates.map((update) => (
              <Link to={update.link} key={update.id} className="block group">
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                  {update.type === 'appointment' && <CalendarDays className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                  {update.type === 'lead' && <MessageSquare className={`w-5 h-5 ${update.is_read ? 'text-green-500' : 'text-yellow-500'} flex-shrink-0`} />}
                  {update.type === 'budget' && <FileText className="w-5 h-5 text-purple-500 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                      {update.title}
                      {update.type === 'lead' && !update.is_read && <CircleDot className="w-3 h-3 text-yellow-500" />}
                    </p>
                    <p className="text-sm text-muted-foreground">{update.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(parseISO(update.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">Nenhuma novidade recente.</p>
        )}
      </CardContent>
    </Card>
  );
}