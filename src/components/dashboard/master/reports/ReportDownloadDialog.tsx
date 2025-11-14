import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, subQuarters, subYears, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';

interface ReportDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date; // A data selecionada na ReportsPage
}

// Interfaces para os dados brutos
interface Profile { id: string; role: 'prospect' | 'client' | 'master'; status: 'ativo' | 'inativo'; created_at: string; }
interface Appointment { id: string; status: 'pending' | 'confirmed' | 'cancelled' | 'completed'; start_time: string; }
interface ClientContract { id: string; contract_type: 'monthly' | 'one-time'; start_date: string; end_date: string | null; created_at: string; }
interface Budget { id: string; status: 'pending' | 'approved' | 'rejected' | 'converted'; created_at: string; total_amount: number; }
interface Cost { id: string; value_brl: number; is_active: boolean; }
interface VariableCost { id: string; value: number; is_active: boolean; date: string; }

const ReportDownloadDialog: React.FC<ReportDownloadDialogProps> = ({ isOpen, onClose, selectedDate }) => {
  const [selectedDataCategories, setSelectedDataCategories] = useState<string[]>([]);
  const [reportType, setReportType] = useState<'monthly' | 'comparative'>('monthly');
  const [comparativePeriod, setComparativePeriod] = useState<'month' | 'bi-month' | 'quarter' | 'semi-annual' | 'annual'>('month');
  const [isDownloading, setIsDownloading] = useState(false);

  const dataOptions = [
    { id: 'clients', label: 'Clientes e Prospects' },
    { id: 'appointments', label: 'Agendamentos' },
    { id: 'projects', label: 'Projetos' },
    { id: 'budgets', label: 'Orçamentos' },
    { id: 'financial', label: 'Financeiro (Receita e Custos)' },
  ];

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedDataCategories(prev =>
      checked ? [...prev, id] : prev.filter(item => item !== id)
    );
  };

  const calculateDateRanges = (period: typeof comparativePeriod, baseDate: Date) => {
    let currentStart: Date;
    let currentEnd: Date;
    let previousStart: Date;
    let previousEnd: Date;

    switch (period) {
      case 'month':
        currentStart = startOfMonth(baseDate);
        currentEnd = endOfMonth(baseDate);
        previousStart = startOfMonth(subMonths(baseDate, 1));
        previousEnd = endOfMonth(subMonths(baseDate, 1));
        break;
      case 'bi-month':
        currentStart = startOfMonth(subMonths(baseDate, 1));
        currentEnd = endOfMonth(baseDate);
        previousStart = startOfMonth(subMonths(baseDate, 3));
        previousEnd = endOfMonth(subMonths(baseDate, 2));
        break;
      case 'quarter':
        currentStart = startOfMonth(subQuarters(baseDate, 0)); // Current quarter
        currentEnd = endOfMonth(baseDate);
        previousStart = startOfMonth(subQuarters(baseDate, 1)); // Previous quarter
        previousEnd = endOfMonth(subMonths(previousStart, 1)); // End of previous quarter
        break;
      case 'semi-annual':
        currentStart = startOfMonth(subMonths(baseDate, 5));
        currentEnd = endOfMonth(baseDate);
        previousStart = startOfMonth(subMonths(baseDate, 11));
        previousEnd = endOfMonth(subMonths(baseDate, 6));
        break;
      case 'annual':
        currentStart = startOfMonth(subYears(baseDate, 0));
        currentEnd = endOfMonth(baseDate);
        previousStart = startOfMonth(subYears(baseDate, 1));
        previousEnd = endOfMonth(subMonths(previousStart, 1));
        break;
      default:
        throw new Error('Período comparativo inválido');
    }
    return { currentStart, currentEnd, previousStart, previousEnd };
  };

  const fetchDataForPeriod = async (category: string, startDate: Date, endDate: Date) => {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    switch (category) {
      case 'clients':
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, role, status, created_at')
          .in('role', ['client', 'prospect'])
          .gte('created_at', startISO)
          .lte('created_at', endISO);
        if (profilesError) throw profilesError;
        return profiles as Profile[];
      case 'appointments':
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('id, status, start_time')
          .gte('start_time', startISO)
          .lte('start_time', endISO);
        if (appointmentsError) throw appointmentsError;
        return appointments as Appointment[];
      case 'projects':
        const { data: contracts, error: contractsError } = await supabase
          .from('client_contracts')
          .select('id, contract_type, start_date, end_date, created_at')
          .gte('created_at', startISO)
          .lte('created_at', endISO);
        if (contractsError) throw contractsError;
        return contracts as ClientContract[];
      case 'budgets':
        const { data: budgets, error: budgetsError } = await supabase
          .from('budgets')
          .select('id, status, created_at, total_amount')
          .gte('created_at', startISO)
          .lte('created_at', endISO);
        if (budgetsError) throw budgetsError;
        return budgets as Budget[];
      case 'financial':
        const { data: fixedCosts, error: fixedCostsError } = await supabase
          .from('costs')
          .select('value_brl')
          .eq('is_active', true);
        if (fixedCostsError) throw fixedCostsError;

        const { data: variableCosts, error: variableCostsError } = await supabase
          .from('variable_costs')
          .select('value')
          .eq('is_active', true)
          .gte('date', startISO)
          .lte('date', endISO);
        if (variableCostsError) throw variableCostsError;

        const { data: revenueBudgets, error: revenueBudgetsError } = await supabase
          .from('budgets')
          .select('total_amount')
          .eq('status', 'converted')
          .gte('created_at', startISO)
          .lte('created_at', endISO);
        if (revenueBudgetsError) throw revenueBudgetsError;

        const totalRevenue = revenueBudgets?.reduce((sum, b) => sum + b.total_amount, 0) || 0;
        const totalFixedCosts = fixedCosts?.reduce((sum, c) => sum + c.value_brl, 0) || 0;
        const totalVariableCosts = variableCosts?.reduce((sum, vc) => sum + vc.value, 0) || 0;
        const totalCosts = totalFixedCosts + totalVariableCosts;
        const profit = totalRevenue - totalCosts;

        return { revenue: totalRevenue, fixedCosts: totalFixedCosts, variableCosts: totalVariableCosts, totalCosts, profit };
      default:
        return [];
    }
  };

  const generateCsvContent = (data: Record<string, any>, type: 'monthly' | 'comparative', periodLabel: string) => {
    let csv = `Relatório Pontedra - ${type === 'monthly' ? 'Dados do Mês' : 'Dados Comparativos'} (${periodLabel})\n\n`;

    selectedDataCategories.forEach(category => {
      if (category === 'clients') {
        if (type === 'monthly') {
          const profiles = data.clients.current as Profile[];
          const totalClients = profiles.filter(p => p.role === 'client').length;
          const newClients = profiles.filter(p => p.role === 'client').length; // Assuming 'new' means created in this period
          const activeClients = profiles.filter(p => p.role === 'client' && p.status === 'ativo').length;
          const inactiveClients = profiles.filter(p => p.role === 'client' && p.status === 'inativo').length;
          const totalProspects = profiles.filter(p => p.role === 'prospect').length;
          const newProspects = profiles.filter(p => p.role === 'prospect').length;

          csv += `"Clientes e Prospects - ${periodLabel}"\n`;
          csv += `"Total de Clientes","Novos Clientes","Clientes Ativos","Clientes Inativos","Total de Prospects","Novos Prospects"\n`;
          csv += `"${totalClients}","${newClients}","${activeClients}","${inactiveClients}","${totalProspects}","${newProspects}"\n\n`;
        } else {
          const currentProfiles = data.clients.current as Profile[];
          const previousProfiles = data.clients.previous as Profile[];

          const currentTotalClients = currentProfiles.filter(p => p.role === 'client').length;
          const currentNewClients = currentProfiles.filter(p => p.role === 'client').length;
          const currentActiveClients = currentProfiles.filter(p => p.role === 'client' && p.status === 'ativo').length;
          const currentInactiveClients = currentProfiles.filter(p => p.role === 'client' && p.status === 'inativo').length;
          const currentTotalProspects = currentProfiles.filter(p => p.role === 'prospect').length;
          const currentNewProspects = currentProfiles.filter(p => p.role === 'prospect').length;

          const previousTotalClients = previousProfiles.filter(p => p.role === 'client').length;
          const previousNewClients = previousProfiles.filter(p => p.role === 'client').length;
          const previousActiveClients = previousProfiles.filter(p => p.role === 'client' && p.status === 'ativo').length;
          const previousInactiveClients = previousProfiles.filter(p => p.role === 'client' && p.status === 'inativo').length;
          const previousTotalProspects = previousProfiles.filter(p => p.role === 'prospect').length;
          const previousNewProspects = previousProfiles.filter(p => p.role === 'prospect').length;

          csv += `"Clientes e Prospects - Comparativo (${periodLabel})"\n`;
          csv += `"Período","Total de Clientes","Novos Clientes","Clientes Ativos","Clientes Inativos","Total de Prospects","Novos Prospects"\n`;
          csv += `"Atual","${currentTotalClients}","${currentNewClients}","${currentActiveClients}","${currentInactiveClients}","${currentTotalProspects}","${currentNewProspects}"\n`;
          csv += `"Anterior","${previousTotalClients}","${previousNewClients}","${previousActiveClients}","${previousInactiveClients}","${previousTotalProspects}","${previousNewProspects}"\n\n`;
        }
      } else if (category === 'appointments') {
        if (type === 'monthly') {
          const appointments = data.appointments.current as Appointment[];
          const total = appointments.length;
          const confirmed = appointments.filter(app => app.status === 'confirmed').length;
          const pending = appointments.filter(app => app.status === 'pending').length;
          const cancelled = appointments.filter(app => app.status === 'cancelled').length;
          const completed = appointments.filter(app => app.status === 'completed').length;

          csv += `"Agendamentos - ${periodLabel}"\n`;
          csv += `"Total de Agendamentos","Confirmados","Pendentes","Cancelados","Concluídos"\n`;
          csv += `"${total}","${confirmed}","${pending}","${cancelled}","${completed}"\n\n`;
        } else {
          const currentAppointments = data.appointments.current as Appointment[];
          const previousAppointments = data.appointments.previous as Appointment[];

          const currentTotal = currentAppointments.length;
          const currentConfirmed = currentAppointments.filter(app => app.status === 'confirmed').length;
          const currentPending = currentAppointments.filter(app => app.status === 'pending').length;
          const currentCancelled = currentAppointments.filter(app => app.status === 'cancelled').length;
          const currentCompleted = currentAppointments.filter(app => app.status === 'completed').length;

          const previousTotal = previousAppointments.length;
          const previousConfirmed = previousAppointments.filter(app => app.status === 'confirmed').length;
          const previousPending = previousAppointments.filter(app => app.status === 'pending').length;
          const previousCancelled = previousAppointments.filter(app => app.status === 'cancelled').length;
          const previousCompleted = previousAppointments.filter(app => app.status === 'completed').length;

          csv += `"Agendamentos - Comparativo (${periodLabel})"\n`;
          csv += `"Período","Total de Agendamentos","Confirmados","Pendentes","Cancelados","Concluídos"\n`;
          csv += `"Atual","${currentTotal}","${currentConfirmed}","${currentPending}","${currentCancelled}","${currentCompleted}"\n`;
          csv += `"Anterior","${previousTotal}","${previousConfirmed}","${previousPending}","${previousCancelled}","${previousCompleted}"\n\n`;
        }
      } else if (category === 'projects') {
        if (type === 'monthly') {
          const contracts = data.projects.current as ClientContract[];
          const total = contracts.length;
          let active = 0;
          let completed = 0;
          contracts.forEach(contract => {
            if (contract.contract_type === 'monthly') {
              active++;
            } else {
              if (contract.end_date && new Date(contract.end_date) < new Date()) {
                completed++;
              } else {
                active++;
              }
            }
          });

          csv += `"Projetos - ${periodLabel}"\n`;
          csv += `"Total de Projetos","Projetos Ativos","Projetos Concluídos"\n`;
          csv += `"${total}","${active}","${completed}"\n\n`;
        } else {
          const currentContracts = data.projects.current as ClientContract[];
          const previousContracts = data.projects.previous as ClientContract[];

          const currentTotal = currentContracts.length;
          let currentActive = 0;
          let currentCompleted = 0;
          currentContracts.forEach(contract => {
            if (contract.contract_type === 'monthly') {
              currentActive++;
            } else {
              if (contract.end_date && new Date(contract.end_date) < new Date()) {
                currentCompleted++;
              } else {
                currentActive++;
              }
            }
          });

          const previousTotal = previousContracts.length;
          let previousActive = 0;
          let previousCompleted = 0;
          previousContracts.forEach(contract => {
            if (contract.contract_type === 'monthly') {
              previousActive++;
            } else {
              if (contract.end_date && new Date(contract.end_date) < new Date()) {
                previousCompleted++;
              } else {
                previousActive++;
              }
            }
          });

          csv += `"Projetos - Comparativo (${periodLabel})"\n`;
          csv += `"Período","Total de Projetos","Projetos Ativos","Projetos Concluídos"\n`;
          csv += `"Atual","${currentTotal}","${currentActive}","${currentCompleted}"\n`;
          csv += `"Anterior","${previousTotal}","${previousActive}","${previousCompleted}"\n\n`;
        }
      } else if (category === 'budgets') {
        if (type === 'monthly') {
          const budgets = data.budgets.current as Budget[];
          const total = budgets.length;
          const pending = budgets.filter(b => b.status === 'pending').length;
          const approved = budgets.filter(b => b.status === 'approved').length;
          const rejected = budgets.filter(b => b.status === 'rejected').length;
          const converted = budgets.filter(b => b.status === 'converted').length;

          csv += `"Orçamentos - ${periodLabel}"\n`;
          csv += `"Total de Orçamentos","Pendentes","Aprovados","Rejeitados","Convertidos"\n`;
          csv += `"${total}","${pending}","${approved}","${rejected}","${converted}"\n\n`;
        } else {
          const currentBudgets = data.budgets.current as Budget[];
          const previousBudgets = data.budgets.previous as Budget[];

          const currentTotal = currentBudgets.length;
          const currentPending = currentBudgets.filter(b => b.status === 'pending').length;
          const currentApproved = currentBudgets.filter(b => b.status === 'approved').length;
          const currentRejected = currentBudgets.filter(b => b.status === 'rejected').length;
          const currentConverted = currentBudgets.filter(b => b.status === 'converted').length;

          const previousTotal = previousBudgets.length;
          const previousPending = previousBudgets.filter(b => b.status === 'pending').length;
          const previousApproved = previousBudgets.filter(b => b.status === 'approved').length;
          const previousRejected = previousBudgets.filter(b => b.status === 'rejected').length;
          const previousConverted = previousBudgets.filter(b => b.status === 'converted').length;

          csv += `"Orçamentos - Comparativo (${periodLabel})"\n`;
          csv += `"Período","Total de Orçamentos","Pendentes","Aprovados","Rejeitados","Convertidos"\n`;
          csv += `"Atual","${currentTotal}","${currentPending}","${currentApproved}","${currentRejected}","${currentConverted}"\n`;
          csv += `"Anterior","${previousTotal}","${previousPending}","${previousApproved}","${previousRejected}","${previousConverted}"\n\n`;
        }
      } else if (category === 'financial') {
        if (type === 'monthly') {
          const financial = data.financial.current as { revenue: number; fixedCosts: number; variableCosts: number; totalCosts: number; profit: number };
          csv += `"Financeiro - ${periodLabel}"\n`;
          csv += `"Receita Total","Custos Fixos","Custos Variáveis","Custos Totais","Lucro Líquido"\n`;
          csv += `"${financial.revenue.toFixed(2)}","${financial.fixedCosts.toFixed(2)}","${financial.variableCosts.toFixed(2)}","${financial.totalCosts.toFixed(2)}","${financial.profit.toFixed(2)}"\n\n`;
        } else {
          const currentFinancial = data.financial.current as { revenue: number; fixedCosts: number; variableCosts: number; totalCosts: number; profit: number };
          const previousFinancial = data.financial.previous as { revenue: number; fixedCosts: number; variableCosts: number; totalCosts: number; profit: number };

          csv += `"Financeiro - Comparativo (${periodLabel})"\n`;
          csv += `"Período","Receita Total","Custos Fixos","Custos Variáveis","Custos Totais","Lucro Líquido"\n`;
          csv += `"Atual","${currentFinancial.revenue.toFixed(2)}","${currentFinancial.fixedCosts.toFixed(2)}","${currentFinancial.variableCosts.toFixed(2)}","${currentFinancial.totalCosts.toFixed(2)}","${currentFinancial.profit.toFixed(2)}"\n`;
          csv += `"Anterior","${previousFinancial.revenue.toFixed(2)}","${previousFinancial.fixedCosts.toFixed(2)}","${previousFinancial.variableCosts.toFixed(2)}","${previousFinancial.totalCosts.toFixed(2)}","${previousFinancial.profit.toFixed(2)}"\n\n`;
        }
      }
    });

    return csv;
  };

  const handleDownload = async () => {
    if (selectedDataCategories.length === 0) {
      toast.error('Selecione pelo menos uma categoria de dados para download.');
      return;
    }

    setIsDownloading(true);
    try {
      const dataToDownload: Record<string, any> = {};
      let periodLabel = format(selectedDate, 'MMMM yyyy', { locale: ptBR });

      if (reportType === 'monthly') {
        const currentMonthStart = startOfMonth(selectedDate);
        const currentMonthEnd = endOfMonth(selectedDate);

        for (const category of selectedDataCategories) {
          dataToDownload[category] = {
            current: await fetchDataForPeriod(category, currentMonthStart, currentMonthEnd),
          };
        }
      } else { // comparative
        const { currentStart, currentEnd, previousStart, previousEnd } = calculateDateRanges(comparativePeriod, selectedDate);
        periodLabel = `${format(currentStart, 'MMM yyyy', { locale: ptBR })} - ${format(currentEnd, 'MMM yyyy', { locale: ptBR })}`;

        for (const category of selectedDataCategories) {
          dataToDownload[category] = {
            current: await fetchDataForPeriod(category, currentStart, currentEnd),
            previous: await fetchDataForPeriod(category, previousStart, previousEnd),
          };
        }
      }

      const csvContent = generateCsvContent(dataToDownload, reportType, periodLabel);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `relatorio_pontedra_${format(selectedDate, 'yyyyMMdd')}.csv`);
      toast.success('Relatório gerado e baixado com sucesso!');
      onClose();
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      toast.error(`Erro ao gerar relatório: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border text-foreground rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Download className="w-6 h-6" /> Baixar Relatórios
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Selecione os dados e o tipo de relatório que deseja baixar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Seleção de Dados */}
          <div>
            <Label className="text-lg font-semibold text-foreground mb-3 block">Dados a Incluir</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dataOptions.map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`data-${option.id}`}
                    checked={selectedDataCategories.includes(option.id)}
                    onCheckedChange={(checked: boolean) => handleCheckboxChange(option.id, checked)}
                  />
                  <Label htmlFor={`data-${option.id}`} className="text-foreground cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Tipo de Relatório */}
          <div>
            <Label className="text-lg font-semibold text-foreground mb-3 block">Tipo de Relatório</Label>
            <RadioGroup value={reportType} onValueChange={(value: 'monthly' | 'comparative') => setReportType(value)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="report-monthly" />
                <Label htmlFor="report-monthly">Dados do Mês Atual</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="comparative" id="report-comparative" />
                <Label htmlFor="report-comparative">Dados Comparativos</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Período Comparativo (se selecionado) */}
          {reportType === 'comparative' && (
            <div>
              <Label className="text-lg font-semibold text-foreground mb-3 block">Período Comparativo</Label>
              <Select value={comparativePeriod} onValueChange={(value: typeof comparativePeriod) => setComparativePeriod(value)}>
                <SelectTrigger className="w-full bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecione o Período" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="month">Mês (vs. Mês Anterior)</SelectItem>
                  <SelectItem value="bi-month">Bimestre (vs. Bimestre Anterior)</SelectItem>
                  <SelectItem value="quarter">Trimestre (vs. Trimestre Anterior)</SelectItem>
                  <SelectItem value="semi-annual">Semestre (vs. Semestre Anterior)</SelectItem>
                  <SelectItem value="annual">Anual (vs. Ano Anterior)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isDownloading} className="bg-background border-border text-foreground hover:bg-muted">
            Cancelar
          </Button>
          <Button onClick={handleDownload} disabled={isDownloading || selectedDataCategories.length === 0} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Baixar Relatório
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDownloadDialog;