import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BarChart as BarChartIcon, CalendarDays, Loader2, Users, DollarSign, FileText, Briefcase, LineChart as LineChartIcon, Download as DownloadIcon } from 'lucide-react'; // Adicionado DownloadIcon
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button'; // Importar Button
import { format, getMonth, getYear, setMonth, setYear, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Import new report cards
import ClientReportsCard from '@/components/dashboard/master/reports/ClientReportsCard';
import AppointmentsReportsCard from '@/components/dashboard/master/reports/AppointmentsReportsCard';
import ProjectsReportsCard from '@/components/dashboard/master/reports/ProjectsReportsCard';
import BudgetsReportsCard from '@/components/dashboard/master/reports/BudgetsReportsCard';
import FinancialReportsCard from '@/components/dashboard/master/reports/FinancialReportsCard';

// Import new monthly charts
import ClientMonthlyChart from '@/components/dashboard/master/reports/ClientMonthlyChart';
import AppointmentsMonthlyChart from '@/components/dashboard/master/reports/AppointmentsMonthlyChart';
import ProjectsMonthlyChart from '@/components/dashboard/master/reports/ProjectsMonthlyChart';
import BudgetsMonthlyChart from '@/components/dashboard/master/reports/BudgetsMonthlyChart';
import MonthlyFinancialCharts from '@/components/dashboard/master/MonthlyFinancialCharts'; // Reutilizando o componente existente

// Import the new DownloadReportsDialog
import DownloadReportsDialog from '@/components/dashboard/master/reports/DownloadReportsDialog';

export default function ReportsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedChartType, setSelectedChartType] = useState<'line' | 'bar'>('line');
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false); // State for the download dialog

  // Generate month options
  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const date = setMonth(new Date(), i);
    return { value: i, label: format(date, 'MMMM', { locale: ptBR }) };
  }), []);

  // Generate year options (current year and past 2 years)
  const currentYear = getYear(new Date());
  const yearOptions = useMemo(() => Array.from({ length: 3 }, (_, i) => {
    const year = currentYear - i;
    return { value: year, label: String(year) };
  }), [currentYear]);

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-[#9ba8b5]">
          <Loader2 className="w-8 h-8 animate-spin mr-3" /> Carregando relatórios...
        </div>
      </DashboardLayout>
    );
  }

  if (profile?.role !== 'master') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-destructive">
          Você não tem permissão para acessar esta página.
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <BarChartIcon className="w-10 h-10 text-[#57e389]" />
            <h1 className="text-4xl font-bold text-foreground">Relatórios</h1>
          </div>
          <Button onClick={() => setIsDownloadDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md">
            <DownloadIcon className="mr-2 h-4 w-4" /> Baixar Dados
          </Button>
        </div>
        <p className="text-lg text-[#9ba8b5]">
          Olá, <span className="font-semibold text-white">{profile?.first_name}</span>! Visualize os relatórios e métricas da plataforma aqui.
        </p>

        {/* Seletores de Mês, Ano e Tipo de Gráfico */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 space-y-2">
            <Label htmlFor="select-month">Mês</Label>
            <Select
              value={getMonth(selectedDate).toString()}
              onValueChange={(value) => setSelectedDate(prev => setMonth(prev, parseInt(value)))}
            >
              <SelectTrigger id="select-month" className="w-full bg-card border-border text-foreground">
                <SelectValue placeholder="Selecione o Mês" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                {monthOptions.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="select-year">Ano</Label>
            <Select
              value={getYear(selectedDate).toString()}
              onValueChange={(value) => setSelectedDate(prev => setYear(prev, parseInt(value)))}
            >
              <SelectTrigger id="select-year" className="w-full bg-card border-border text-foreground">
                <SelectValue placeholder="Selecione o Ano" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                {yearOptions.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="select-chart-type">Tipo de Gráfico</Label>
            <Select
              value={selectedChartType}
              onValueChange={(value: 'line' | 'bar') => setSelectedChartType(value)}
            >
              <SelectTrigger id="select-chart-type" className="w-full bg-card border-border text-foreground">
                <SelectValue placeholder="Selecione o Tipo" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="line">
                  <div className="flex items-center gap-2">
                    <LineChartIcon className="w-4 h-4" /> Linha
                  </div>
                </SelectItem>
                <SelectItem value="bar">
                  <div className="flex items-center gap-2">
                    <BarChartIcon className="w-4 h-4" /> Barra
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Relatórios de Clientes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" /> Relatório de Clientes
          </h2>
          <ClientReportsCard selectedDate={selectedDate} />
          <ClientMonthlyChart selectedDate={selectedDate} chartType={selectedChartType} />
        </section>

        {/* Relatórios de Agendamentos */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-green-500" /> Relatório de Agendamentos
          </h2>
          <AppointmentsReportsCard selectedDate={selectedDate} />
          <AppointmentsMonthlyChart selectedDate={selectedDate} chartType={selectedChartType} />
        </section>

        {/* Relatórios de Projetos */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-purple-500" /> Relatório de Projetos
          </h2>
          <ProjectsReportsCard selectedDate={selectedDate} />
          <ProjectsMonthlyChart selectedDate={selectedDate} chartType={selectedChartType} />
        </section>

        {/* Relatórios de Orçamentos */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-500" /> Relatório de Orçamentos
          </h2>
          <BudgetsReportsCard selectedDate={selectedDate} />
          <BudgetsMonthlyChart selectedDate={selectedDate} chartType={selectedChartType} />
        </section>

        {/* Relatórios Financeiros */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-red-500" /> Relatório Financeiro
          </h2>
          <FinancialReportsCard selectedDate={selectedDate} />
          {/* MonthlyFinancialCharts já está configurado para os últimos 12 meses */}
          <MonthlyFinancialCharts data={[]} isLoading={false} /> {/* Será preenchido pela query interna */}
        </section>
      </motion.div>

      <DownloadReportsDialog
        isOpen={isDownloadDialogOpen}
        onClose={() => setIsDownloadDialogOpen(false)}
        selectedDate={selectedDate}
      />
    </DashboardLayout>
  );
}