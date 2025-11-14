import React, { useState, useMemo, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarIcon, PlusCircle, Edit, Trash2, Loader2, Clock, CalendarDays, Info, XCircle, Save } from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isBefore, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar'; // Shadcn Calendar
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

// Interfaces para as novas tabelas
interface MasterAvailability {
  id: string;
  master_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // HH:mm:ss
  end_time: string;   // HH:mm:ss
  created_at: string;
  updated_at: string;
}

interface MasterException {
  id: string;
  master_id: string;
  exception_date: string; // YYYY-MM-DD
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  created_at: string;
  updated_at: string;
}

const daysOfWeek = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

export default function AvailabilityPage() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<MasterAvailability | null>(null);
  const [availabilityFormData, setAvailabilityFormData] = useState<Partial<MasterAvailability>>({});

  const [isExceptionDialogOpen, setIsExceptionDialogOpen] = useState(false);
  const [editingException, setEditingException] = useState<MasterException | null>(null);
  const [exceptionFormData, setExceptionFormData] = useState<Partial<MasterException>>({});
  const [selectedExceptionDate, setSelectedExceptionDate] = useState<Date | undefined>(undefined);

  // Fetch Master Availability
  const { data: availability, isLoading: isLoadingAvailability, isError: isAvailabilityError, error: availabilityError } = useQuery<MasterAvailability[], Error>({
    queryKey: ['masterAvailability', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('master_availability')
        .select('*')
        .eq('master_id', user.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && profile?.role === 'master',
  });

  // Fetch Master Exceptions
  const { data: exceptions, isLoading: isLoadingExceptions, isError: isExceptionsError, error: exceptionsError } = useQuery<MasterException[], Error>({
    queryKey: ['masterExceptions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('master_exceptions')
        .select('*')
        .eq('master_id', user.id)
        .order('exception_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && profile?.role === 'master',
  });

  // Mutations for Master Availability
  const upsertAvailabilityMutation = useMutation<void, Error, Partial<MasterAvailability>>({
    mutationFn: async (newAvailability) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");
      const dataToSave = { ...newAvailability, master_id: user.id };

      if (newAvailability.id) {
        const { error } = await supabase.from('master_availability').update(dataToSave).eq('id', newAvailability.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('master_availability').insert(dataToSave);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterAvailability', user?.id] });
      toast.success(editingAvailability ? 'Disponibilidade atualizada!' : 'Disponibilidade adicionada!');
      setIsAvailabilityDialogOpen(false);
      setEditingAvailability(null);
      setAvailabilityFormData({});
    },
    onError: (err) => {
      toast.error(`Erro ao salvar disponibilidade: ${err.message}`);
    },
  });

  const deleteAvailabilityMutation = useMutation<void, Error, string>({
    mutationFn: async (availabilityId) => {
      const { error } = await supabase.from('master_availability').delete().eq('id', availabilityId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterAvailability', user?.id] });
      toast.success('Disponibilidade excluída!');
    },
    onError: (err) => {
      toast.error(`Erro ao excluir disponibilidade: ${err.message}`);
    },
  });

  // Mutations for Master Exceptions
  const upsertExceptionMutation = useMutation<void, Error, Partial<MasterException>>({
    mutationFn: async (newException) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");
      const dataToSave = { ...newException, master_id: user.id };

      if (newException.id) {
        const { error } = await supabase.from('master_exceptions').update(dataToSave).eq('id', newException.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('master_exceptions').insert(dataToSave);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterExceptions', user?.id] });
      toast.success(editingException ? 'Exceção atualizada!' : 'Exceção adicionada!');
      setIsExceptionDialogOpen(false);
      setEditingException(null);
      setExceptionFormData({});
      setSelectedExceptionDate(undefined);
    },
    onError: (err) => {
      toast.error(`Erro ao salvar exceção: ${err.message}`);
    },
  });

  const deleteExceptionMutation = useMutation<void, Error, string>({
    mutationFn: async (exceptionId) => {
      const { error } = await supabase.from('master_exceptions').delete().eq('id', exceptionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterExceptions', user?.id] });
      toast.success('Exceção excluída!');
    },
    onError: (err) => {
      toast.error(`Erro ao excluir exceção: ${err.message}`);
    },
  });

  // Handlers for Availability Dialog
  const handleOpenAvailabilityDialog = (item?: MasterAvailability) => {
    if (item) {
      setEditingAvailability(item);
      setAvailabilityFormData(item);
    } else {
      setEditingAvailability(null);
      setAvailabilityFormData({
        day_of_week: 1, // Default to Monday
        start_time: '09:00',
        end_time: '17:00',
      });
    }
    setIsAvailabilityDialogOpen(true);
  };

  const handleAvailabilityFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAvailabilityFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvailabilitySelectChange = (name: string, value: string | number) => {
    setAvailabilityFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvailabilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertAvailabilityMutation.mutate(availabilityFormData);
  };

  // Handlers for Exception Dialog
  const handleOpenExceptionDialog = (item?: MasterException) => {
    if (item) {
      setEditingException(item);
      setExceptionFormData(item);
      setSelectedExceptionDate(parseISO(item.exception_date));
    } else {
      setEditingException(null);
      setExceptionFormData({
        exception_date: format(new Date(), 'yyyy-MM-dd'),
        is_available: false, // Default to blocked
        start_time: null,
        end_time: null,
        reason: '',
      });
      setSelectedExceptionDate(new Date());
    }
    setIsExceptionDialogOpen(true);
  };

  const handleExceptionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setExceptionFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleExceptionSelectChange = (name: string, value: string | boolean) => {
    setExceptionFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExceptionDateSelect = (date: Date | undefined) => {
    setSelectedExceptionDate(date);
    setExceptionFormData(prev => ({
      ...prev,
      exception_date: date ? format(date, 'yyyy-MM-dd') : '',
    }));
  };

  const handleExceptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exceptionFormData.exception_date) {
      toast.error("A data da exceção é obrigatória.");
      return;
    }
    upsertExceptionMutation.mutate(exceptionFormData);
  };

  if (profile?.role !== 'master') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-destructive">
          Você não tem permissão para acessar esta página.
        </div>
      </DashboardLayout>
    );
  }

  if (isLoadingAvailability || isLoadingExceptions) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-[#9ba8b5]">
          <Loader2 className="w-8 h-8 animate-spin mr-3" /> Carregando configurações de disponibilidade...
        </div>
      </DashboardLayout>
    );
  }

  if (isAvailabilityError || isExceptionsError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-destructive">
          Erro ao carregar dados: {availabilityError?.message || exceptionsError?.message}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex items-center gap-4 mb-8">
          <CalendarDays className="w-10 h-10 text-[#57e389]" />
          <h1 className="text-4xl font-bold text-foreground">Gerenciar Disponibilidade</h1>
        </div>
        <p className="text-lg text-[#9ba8b5]">
          Olá, <span className="font-semibold text-white">{profile?.first_name}</span>! Configure seus horários de atendimento e exceções para agendamentos.
        </p>

        {/* Seção de Disponibilidade Recorrente */}
        <div className="bg-card border border-border rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-500" /> Horários Recorrentes
            </h2>
            <Button onClick={() => handleOpenAvailabilityDialog()} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Horário
            </Button>
          </div>
          <p className="text-muted-foreground mb-4">
            Defina os dias da semana e os intervalos de tempo em que você está disponível regularmente para agendamentos.
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead className="text-muted-foreground">DIA DA SEMANA</TableHead>
                  <TableHead className="text-muted-foreground">INÍCIO</TableHead>
                  <TableHead className="text-muted-foreground">FIM</TableHead>
                  <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availability && availability.length > 0 ? (
                  availability.map((item) => (
                    <TableRow key={item.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10">
                      <TableCell className="font-medium text-foreground py-4">
                        {daysOfWeek.find(d => d.value === item.day_of_week)?.label}
                      </TableCell>
                      <TableCell className="text-foreground py-4">{item.start_time.substring(0, 5)}</TableCell>
                      <TableCell className="text-foreground py-4">{item.end_time.substring(0, 5)}</TableCell>
                      <TableCell className="text-right py-4">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenAvailabilityDialog(item)} className="text-primary hover:text-primary/80">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteAvailabilityMutation.mutate(item.id)} className="text-destructive hover:text-destructive/80">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhum horário recorrente configurado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Seção de Exceções de Data */}
        <div className="bg-card border border-border rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-yellow-500" /> Exceções de Data
            </h2>
            <Button onClick={() => handleOpenExceptionDialog()} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Exceção
            </Button>
          </div>
          <p className="text-muted-foreground mb-4">
            Adicione datas específicas em que sua disponibilidade difere dos horários recorrentes (ex: feriados, dias de folga, eventos).
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead className="text-muted-foreground">DATA</TableHead>
                  <TableHead className="text-muted-foreground">DISPONÍVEL?</TableHead>
                  <TableHead className="text-muted-foreground">HORÁRIO</TableHead>
                  <TableHead className="text-muted-foreground">RAZÃO</TableHead>
                  <TableHead className="text-muted-foreground text-right">AÇÕES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exceptions && exceptions.length > 0 ? (
                  exceptions.map((item) => (
                    <TableRow key={item.id} className="border-b border-border/50 last:border-b-0 hover:bg-muted/10">
                      <TableCell className="font-medium text-foreground py-4">
                        {format(parseISO(item.exception_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={item.is_available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                          {item.is_available ? 'Sim' : 'Não'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground py-4">
                        {item.start_time && item.end_time ? `${item.start_time.substring(0, 5)} - ${item.end_time.substring(0, 5)}` : 'Dia Todo'}
                      </TableCell>
                      <TableCell className="text-muted-foreground py-4">{item.reason || 'N/A'}</TableCell>
                      <TableCell className="text-right py-4">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenExceptionDialog(item)} className="text-primary hover:text-primary/80">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteExceptionMutation.mutate(item.id)} className="text-destructive hover:text-destructive/80">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhuma exceção de data configurada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Dialog para Adicionar/Editar Disponibilidade Recorrente */}
        <Dialog open={isAvailabilityDialogOpen} onOpenChange={setIsAvailabilityDialogOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                {editingAvailability ? 'Editar Horário Recorrente' : 'Adicionar Novo Horário Recorrente'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Defina o dia da semana e o intervalo de tempo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAvailabilitySubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="day_of_week">Dia da Semana *</Label>
                <Select
                  name="day_of_week"
                  value={String(availabilityFormData.day_of_week)}
                  onValueChange={(value) => handleAvailabilitySelectChange('day_of_week', parseInt(value))}
                  required
                >
                  <SelectTrigger className="w-full bg-background border-border text-foreground">
                    <SelectValue placeholder="Selecione o Dia" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {daysOfWeek.map(day => (
                      <SelectItem key={day.value} value={String(day.value)}>{day.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Hora de Início *</Label>
                  <Input
                    id="start_time"
                    name="start_time"
                    type="time"
                    value={availabilityFormData.start_time || ''}
                    onChange={handleAvailabilityFormChange}
                    className="bg-background border-border text-foreground"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Hora de Fim *</Label>
                  <Input
                    id="end_time"
                    name="end_time"
                    type="time"
                    value={availabilityFormData.end_time || ''}
                    onChange={handleAvailabilityFormChange}
                    className="bg-background border-border text-foreground"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsAvailabilityDialogOpen(false)} className="bg-background border-border text-foreground hover:bg-muted">
                  <XCircle className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button type="submit" disabled={upsertAvailabilityMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {upsertAvailabilityMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para Adicionar/Editar Exceção de Data */}
        <Dialog open={isExceptionDialogOpen} onOpenChange={setIsExceptionDialogOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-card border-border text-foreground rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                {editingException ? 'Editar Exceção de Data' : 'Adicionar Nova Exceção de Data'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Defina uma data específica e sua disponibilidade para ela.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleExceptionSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="exception_date">Data da Exceção *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background border-border text-foreground",
                        !selectedExceptionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedExceptionDate ? format(selectedExceptionDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover border-border text-popover-foreground">
                    <Calendar
                      mode="single"
                      selected={selectedExceptionDate}
                      onSelect={handleExceptionDateSelect}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_available">Disponível neste dia? *</Label>
                <Select
                  name="is_available"
                  value={String(exceptionFormData.is_available)}
                  onValueChange={(value) => handleExceptionSelectChange('is_available', value === 'true')}
                  required
                >
                  <SelectTrigger className="w-full bg-background border-border text-foreground">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="true">Sim (Disponível)</SelectItem>
                    <SelectItem value="false">Não (Bloqueado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {exceptionFormData.is_available && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exception_start_time">Hora de Início (Opcional)</Label>
                    <Input
                      id="exception_start_time"
                      name="start_time"
                      type="time"
                      value={exceptionFormData.start_time || ''}
                      onChange={handleExceptionFormChange}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exception_end_time">Hora de Fim (Opcional)</Label>
                    <Input
                      id="exception_end_time"
                      name="end_time"
                      type="time"
                      value={exceptionFormData.end_time || ''}
                      onChange={handleExceptionFormChange}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="reason">Razão (Opcional)</Label>
                <Input
                  id="reason"
                  name="reason"
                  type="text"
                  value={exceptionFormData.reason || ''}
                  onChange={handleExceptionFormChange}
                  className="bg-background border-border text-foreground"
                  placeholder="Ex: Feriado, Consulta Médica"
                />
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsExceptionDialogOpen(false)} className="bg-background border-border text-foreground hover:bg-muted">
                  <XCircle className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button type="submit" disabled={upsertExceptionMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {upsertExceptionMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}