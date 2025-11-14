import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, Briefcase, CheckCircle, PlayCircle, XCircle } from 'lucide-react';
import ReportCard from './ReportCard';
import { format, startOfMonth, endOfMonth, subMonths, isPast, parseISO } from 'date-fns';

interface ProjectCount {
  contract_type: 'monthly' | 'one-time';
  count: number;
}

interface ClientContract {
  id: string;
  contract_type: 'monthly' | 'one-time';
  start_date: string;
  end_date: string | null;
  created_at: string;
}

interface ProjectsReportsCardProps {
  selectedDate: Date;
}

export default function ProjectsReportsCard({ selectedDate }: ProjectsReportsCardProps) {
  const currentMonthStart = startOfMonth(selectedDate);
  const currentMonthEnd = endOfMonth(selectedDate);
  const previousMonthStart = startOfMonth(subMonths(selectedDate, 1));
  const previousMonthEnd = endOfMonth(subMonths(selectedDate, 1));

  // Fetch all contracts for status calculation
  const { data: allContracts, isLoading: isLoadingAllContracts } = useQuery<ClientContract[], Error>({
    queryKey: ['allContractsForReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_contracts')
        .select('id, contract_type, start_date, end_date, created_at');
      if (error) throw error;
      return data;
    },
  });

  // Fetch new contracts created in the current month
  const { data: newCurrentMonthContracts, isLoading: isLoadingNewCurrentMonthContracts } = useQuery<ClientContract[], Error>({
    queryKey: ['newContractsReports', 'currentMonth', currentMonthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_contracts')
        .select('id, contract_type, start_date, end_date, created_at')
        .gte('created_at', currentMonthStart.toISOString())
        .lte('created_at', currentMonthEnd.toISOString());
      if (error) throw error;
      return data;
    },
  });

  // Fetch new contracts created in the previous month
  const { data: newPreviousMonthContracts, isLoading: isLoadingNewPreviousMonthContracts } = useQuery<ClientContract[], Error>({
    queryKey: ['newContractsReports', 'previousMonth', previousMonthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_contracts')
        .select('id, contract_type, start_date, end_date, created_at')
        .gte('created_at', previousMonthStart.toISOString())
        .lte('created_at', previousMonthEnd.toISOString());
      if (error) throw error;
      return data;
    },
  });

  const isLoading = isLoadingAllContracts || isLoadingNewCurrentMonthContracts || isLoadingNewPreviousMonthContracts;

  const processContracts = useCallback((contracts: ClientContract[] | undefined) => {
    if (!contracts) return { total: 0, active: 0, completed: 0 };
    
    let total = contracts.length;
    let active = 0;
    let completed = 0;
    const now = new Date();

    contracts.forEach(contract => {
      if (contract.contract_type === 'monthly') {
        // Monthly contracts are considered active unless explicitly cancelled (not tracked here)
        active++;
      } else { // 'one-time'
        if (contract.end_date && isPast(parseISO(contract.end_date))) {
          completed++;
        } else {
          active++;
        }
      }
    });
    return { total, active, completed };
  }, []);

  const currentMonthOverallData = useMemo(() => processContracts(allContracts), [allContracts, processContracts]);
  const previousMonthOverallData = useMemo(() => processContracts(allContracts), [allContracts, processContracts]); // Overall data doesn't change by month selection

  const currentMonthNewData = useMemo(() => newCurrentMonthContracts?.length || 0, [newCurrentMonthContracts]);
  const previousMonthNewData = useMemo(() => newPreviousMonthContracts?.length || 0, [newPreviousMonthContracts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ReportCard
        title="Total de Projetos"
        value={currentMonthOverallData.total}
        previousMonthValue={previousMonthOverallData.total}
        unit="projetos"
        icon={Briefcase}
        isLoading={isLoading}
      />
      <ReportCard
        title="Novos Projetos (Mês)"
        value={currentMonthNewData}
        previousMonthValue={previousMonthNewData}
        unit="projetos"
        icon={PlayCircle}
        isLoading={isLoading}
      />
      <ReportCard
        title="Projetos Ativos"
        value={currentMonthOverallData.active}
        previousMonthValue={previousMonthOverallData.active}
        unit="projetos"
        icon={CheckCircle}
        isLoading={isLoading}
      />
      <ReportCard
        title="Projetos Concluídos"
        value={currentMonthOverallData.completed}
        previousMonthValue={previousMonthOverallData.completed}
        unit="projetos"
        icon={XCircle}
        isLoading={isLoading}
      />
    </div>
  );
}