import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarDays, Clock, User, Mail, Phone, ArrowRight } from 'lucide-react';
import { format, parseISO, isFuture, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface Appointment {
  id: string;
  client_id: string;
  master_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  client_name: string | null;
  client_email: string | null;
  client_phone?: string; // Adicionado para exibir o telefone do cliente
}

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  telefone: string | null;
  email: string;
}

export default function UpcomingAppointmentsCard() {
  // Fetch all client profiles to enrich appointment data
  const { data: allClientProfiles, isLoading: isLoadingClientProfiles } = useQuery<UserProfile[], Error>({
    queryKey: ['allClientProfilesForUpcomingAppointments'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, telefone, role');
      if (profilesError) throw profilesError;

      const userIds = profiles.map(p => p.id);
      const { data: emailsMap, error: emailError } = await supabase.functions.invoke('get-user-emails', {
        body: { userIds },
      });
      if (emailError) throw emailError;

      return profiles.map(p => ({
        ...p,
        email: (emailsMap as Record<string, string>)?.[p.id] || 'N/A',
      }));
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch upcoming appointments
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[], Error>({
    queryKey: ['upcomingAppointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          client_id,
          master_id,
          start_time,
          end_time,
          status,
          client_name,
          client_email
        `)
        .gte('start_time', new Date().toISOString()) // Only future appointments
        .order('start_time', { ascending: true })
        .limit(5); // Limit to 5 upcoming appointments
      if (error) throw error;
      return data;
    },
  });

  const enrichedAppointments = React.useMemo(() => {
    if (!appointments || !allClientProfiles) return [];
    return appointments.map(app => {
      const clientProfile = allClientProfiles.find(p => p.id === app.client_id);
      return {
        ...app,
        client_name: app.client_name || (clientProfile ? `${clientProfile.first_name || ''} ${clientProfile.last_name || ''}`.trim() : 'N/A'),
        client_email: app.client_email || clientProfile?.email || 'N/A',
        client_phone: clientProfile?.telefone || 'N/A',
      };
    });
  }, [appointments, allClientProfiles]);

  const formatRelativeDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  if (isLoadingAppointments || isLoadingClientProfiles) {
    return (
      <Card className="bg-card border-border shadow-lg rounded-xl col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" /> Próximos Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" /> Carregando agendamentos...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-lg rounded-xl col-span-full lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" /> Próximos Agendamentos
        </CardTitle>
        <Link to="/dashboard/appointments">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            Ver Todos <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {enrichedAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead className="text-muted-foreground">CLIENTE</TableHead>
                  <TableHead className="text-muted-foreground">DATA</TableHead>
                  <TableHead className="text-muted-foreground">HORÁRIO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrichedAppointments.map((app) => (
                  <TableRow key={app.id} className="border-b border-border/50 last:border-b-0">
                    <TableCell className="font-medium text-foreground py-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {app.client_name}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {app.client_email}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" /> {formatRelativeDate(app.start_time)}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" /> {format(parseISO(app.start_time), 'HH:mm', { locale: ptBR })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">Nenhum agendamento futuro.</p>
        )}
      </CardContent>
    </Card>
  );
}