import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DefaultTaxSettingCard from '@/components/dashboard/master/DefaultTaxSettingCard';
import InstallmentRatesSettingCard from '@/components/dashboard/master/InstallmentRatesSettingCard';
import AnnualPackageDiscountSettingCard from '@/components/dashboard/master/AnnualPackageDiscountSettingCard';
import { DollarSign } from 'lucide-react'; // Ícone para a página

export default function FinancialPage() {
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
          <DollarSign className="w-10 h-10 text-[#57e389]" />
          <h1 className="text-4xl font-bold text-foreground">Financeiro</h1>
        </div>
        {profile && (
          <p className="text-lg text-[#9ba8b5]">
            Olá, <span className="font-semibold text-white">{profile.first_name}</span>! Esta é a sua central financeira.
            {profile.client_id && <span className="block text-sm text-muted-foreground mt-1">ID do Cliente: {profile.client_id}</span>}
          </p>
        )}
        <p className="mt-4 text-[#9ba8b5]">
          Nesta página, você terá acesso a um resumo financeiro, fluxo de caixa, contas a pagar e a receber, e outras ferramentas de gestão financeira.
        </p>

        <DefaultTaxSettingCard />

        <InstallmentRatesSettingCard />

        <AnnualPackageDiscountSettingCard />

        {/* Outras seções financeiras podem ser adicionadas aqui */}
        <div className="bg-card border-border shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Visão Geral</h2>
          <p className="text-muted-foreground">
            Em breve, gráficos e tabelas com o fluxo de caixa, receitas e despesas.
          </p>
        </div>

      </motion.div>
    </DashboardLayout>
  );
}