import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, MessageSquare, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Lead {
  id: string;
  is_read: boolean;
}

interface Budget {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'converted';
}

export default function PendingActionsCard() {
  // Fetch unread leads count
  const { data: unreadLeads, isLoading: isLoadingUnreadLeads } = useQuery<Lead[], Error>({
    queryKey: ['unreadLeadsCount'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_contato')
        .select('id')
        .eq('is_read', false);
      if (error) throw error;
      return data;
    },
  });

  // Fetch pending budgets count
  const { data: pendingBudgets, isLoading: isLoadingPendingBudgets } = useQuery<Budget[], Error>({
    queryKey: ['pendingBudgetsCount'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('id')
        .eq('status', 'pending');
      if (error) throw error;
      return data;
    },
  });

  const unreadLeadsCount = unreadLeads?.length || 0;
  const pendingBudgetsCount = pendingBudgets?.length || 0;

  const isLoading = isLoadingUnreadLeads || isLoadingPendingBudgets;

  if (isLoading) {
    return (
      <Card className="bg-card border-border shadow-lg rounded-xl col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" /> Ações Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" /> Carregando ações...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-lg rounded-xl col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" /> Ações Pendentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {unreadLeadsCount > 0 && (
          <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-yellow-500" />
              <p className="text-foreground">
                <span className="font-bold">{unreadLeadsCount}</span> Lead(s) não lido(s)!
              </p>
            </div>
            <Link to="/dashboard/leads">
              <Button variant="ghost" size="sm" className="text-yellow-500 hover:text-yellow-600">
                Ver <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {pendingBudgetsCount > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-500" />
              <p className="text-foreground">
                <span className="font-bold">{pendingBudgetsCount}</span> Orçamento(s) pendente(s)!
              </p>
            </div>
            <Link to="/dashboard/budgets">
              <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
                Ver <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {unreadLeadsCount === 0 && pendingBudgetsCount === 0 && (
          <p className="text-muted-foreground text-center py-4">Nenhuma ação pendente no momento. Tudo em ordem!</p>
        )}
      </CardContent>
    </Card>
  );
}