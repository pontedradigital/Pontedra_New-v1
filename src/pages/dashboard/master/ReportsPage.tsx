import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BarChart, CalendarDays, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format, getMonth, getYear, setMonth, setYear, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Import new report cards
import ClientReportsCard from '@/components/dashboard/master/reports/ClientReportsCard';
import AppointmentsReportsCard from '@/components/dashboard/master/reports/AppointmentsReportsCard';
import ProjectsReportsCard from '@/components/dashboard/master/reports/ProjectsReportsCard';
import BudgetsReportsCard from '@/components/dashboard/master/reports/BudgetsReportsCard';
import FinancialReportsCard from '@/components/dashboard/master/reports/FinancialReportsCard';

export default function ReportsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

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
        <div className="flex items-center gap-4 mb-8">
          <BarChart className="w-10 h-10 text-[#57e389]" />
          <h1 className="text-4xl font-bold text-foreground">Relatórios</h1>
        </div>
        <p className="text-lg text-[#9ba8b5]">
          Olá, <span className="font-semibold text-white">{profile?.first_name}</span>! Visualize os relatórios e métricas da plataforma aqui.
        </p>

        {/* Seletores de Mês e Ano */}
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
        </div>

        {/* Relatórios de Clientes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" /> Relatório de Clientes
          </h2>
          <ClientReportsCard selectedDate={selectedDate} />
        </section>

        {/* Relatórios de Agendamentos */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-green-500" /> Relatório de Agendamentos
          </h2>
          <AppointmentsReportsCard selectedDate={selectedDate} />
        </section>

        {/* Relatórios de Projetos */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart className="w-6 h-6 text-purple-500" /> Relatório de Projetos
          </h2>
          <ProjectsReportsCard selectedDate={selectedDate} />
        </section>

        {/* Relatórios de Orçamentos */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart className="w-6 h-6 text-orange-500" /> Relatório de Orçamentos
          </h2>
          <BudgetsReportsCard selectedDate={selectedDate} />
        </section>

        {/* Relatórios Financeiros */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-red-500" /> Relatório Financeiro
          </h2>
          <FinancialReportsCard selectedDate={selectedDate} />
        </section>
      </motion.div>
    </DashboardLayout>
  );
}