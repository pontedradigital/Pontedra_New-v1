import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, Users, UserPlus, UserCheck, UserX } from 'lucide-react';
import ReportCard from './ReportCard';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface Profile {
  id: string;
  role: 'prospect' | 'client' | 'master';
  status: 'ativo' | 'inativo';
  created_at: string;
}

interface ClientReportsCardProps {
  selectedDate: Date;
}

export default function ClientReportsCard({ selectedDate }: ClientReportsCardProps) {
  const currentMonthStart = startOfMonth(selectedDate);
  const currentMonthEnd = endOfMonth(selectedDate);
  const previousMonthStart = startOfMonth(subMonths(selectedDate, 1));
  const previousMonthEnd = endOfMonth(subMonths(selectedDate, 1));

  // Fetch all profiles for overall counts (total, active, inactive)
  const { data: allProfiles, isLoading: isLoadingAllProfiles } = useQuery<Profile[], Error>({
    queryKey: ['clientReports', 'allProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, status, created_at')
        .in('role', ['client', 'prospect']); // Only interested in clients and prospects
      if (error) throw error;
      return data;
    },
  });

  // Fetch profiles created in the current month for 'new' counts
  const { data: currentMonthNewProfiles, isLoading: isLoadingCurrentMonthNewProfiles } = useQuery<Profile[], Error>({
    queryKey: ['clientReports', 'currentMonthNew', currentMonthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, status, created_at')
        .in('role', ['client', 'prospect'])
        .gte('created_at', currentMonthStart.toISOString())
        .lte('created_at', currentMonthEnd.toISOString());
      if (error) throw error;
      return data;
    },
  });

  // Fetch profiles created in the previous month for 'new' counts comparison
  const { data: previousMonthNewProfiles, isLoading: isLoadingPreviousMonthNewProfiles } = useQuery<Profile[], Error>({
    queryKey: ['clientReports', 'previousMonthNew', previousMonthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, status, created_at')
        .in('role', ['client', 'prospect'])
        .gte('created_at', previousMonthStart.toISOString())
        .lte('created_at', previousMonthEnd.toISOString());
      if (error) throw error;
      return data;
    },
  });

  const isLoading = isLoadingAllProfiles || isLoadingCurrentMonthNewProfiles || isLoadingPreviousMonthNewProfiles;

  const currentMonthData = useMemo(() => {
    const totalClients = allProfiles?.filter(p => p.role === 'client').length || 0;
    const totalProspects = allProfiles?.filter(p => p.role === 'prospect').length || 0;
    const newClients = currentMonthNewProfiles?.filter(p => p.role === 'client').length || 0;
    const newProspects = currentMonthNewProfiles?.filter(p => p.role === 'prospect').length || 0;
    const activeClients = allProfiles?.filter(p => p.role === 'client' && p.status === 'ativo').length || 0;
    const inactiveClients = allProfiles?.filter(p => p.role === 'client' && p.status === 'inativo').length || 0;
    return { totalClients, totalProspects, newClients, newProspects, activeClients, inactiveClients };
  }, [allProfiles, currentMonthNewProfiles]);

  const previousMonthData = useMemo(() => {
    // For comparison, we only care about 'new' counts from the previous month
    const newClients = previousMonthNewProfiles?.filter(p => p.role === 'client').length || 0;
    const newProspects = previousMonthNewProfiles?.filter(p => p.role === 'prospect').length || 0;
    // Total active/inactive for previous month would require a snapshot, so we'll use current totals for comparison base
    const totalClients = allProfiles?.filter(p => p.role === 'client').length || 0;
    const totalProspects = allProfiles?.filter(p => p.role === 'prospect').length || 0;
    const activeClients = allProfiles?.filter(p => p.role === 'client' && p.status === 'ativo').length || 0;
    const inactiveClients = allProfiles?.filter(p => p.role === 'client' && p.status === 'inativo').length || 0;
    return { totalClients, totalProspects, newClients, newProspects, activeClients, inactiveClients };
  }, [allProfiles, previousMonthNewProfiles]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ReportCard
        title="Total de Clientes"
        value={currentMonthData.totalClients}
        previousMonthValue={previousMonthData.totalClients}
        unit="clientes"
        icon={Users}
        isLoading={isLoading}
      />
      <ReportCard
        title="Novos Clientes"
        value={currentMonthData.newClients}
        previousMonthValue={previousMonthData.newClients}
        unit="clientes"
        icon={UserPlus}
        isLoading={isLoading}
      />
      <ReportCard
        title="Clientes Ativos"
        value={currentMonthData.activeClients}
        previousMonthValue={previousMonthData.activeClients}
        unit="clientes"
        icon={UserCheck}
        isLoading={isLoading}
      />
      <ReportCard
        title="Total de Prospects"
        value={currentMonthData.totalProspects}
        previousMonthValue={previousMonthData.totalProspects}
        unit="prospects"
        icon={Users}
        isLoading={isLoading}
      />
      <ReportCard
        title="Novos Prospects"
        value={currentMonthData.newProspects}
        previousMonthValue={previousMonthData.newProspects}
        unit="prospects"
        icon={UserPlus}
        isLoading={isLoading}
      />
      <ReportCard
        title="Clientes Inativos"
        value={currentMonthData.inactiveClients}
        previousMonthValue={previousMonthData.inactiveClients}
        unit="clientes"
        icon={UserX}
        isLoading={isLoading}
      />
    </div>
  );
}