import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { DollarSign, LayoutDashboard } from 'lucide-react';

export default function FinancialOverviewPage() {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 max-w-3xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-8">
          <LayoutDashboard className="w-10 h-10 text-[#57e389]" />
          <h1 className="text-4xl font-bold text-foreground">Visão Geral Financeira</h1>
        </div>
        {profile && (
          <p className="text-lg text-[#9ba8b5]">
            Olá, <span className="font-semibold text-white">{profile.first_name}</span>! Aqui você encontrará um resumo completo das finanças da Pontedra.
            {profile.client_id && <span className="block text-sm text-muted-foreground mt-1">ID do Cliente: {profile.client_id}</span>}
          </p>
        )}
        <p className="mt-4 text-[#9ba8b5]">
          Esta página será preenchida com gráficos, indicadores e relatórios para uma visão clara do desempenho financeiro.
        </p>

        <div className="bg-card border-border shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Resumo Rápido</h2>
          <p className="text-muted-foreground">
            Em breve, dados em tempo real sobre receitas, despesas e lucro.
          </p>
        </div>

      </motion.div>
    </DashboardLayout>
  );
}