import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Calculator } from 'lucide-react'; // Ícones para a página
import DefaultTaxSettingCard from '@/components/dashboard/master/DefaultTaxSettingCard';
import InstallmentRatesSettingCard from '@/components/dashboard/master/InstallmentRatesSettingCard';
import AnnualPackageDiscountSettingCard from '@/components/dashboard/master/AnnualPackageDiscountSettingCard';
import CurrencyConversionSettingsCard from '@/components/dashboard/master/CurrencyConversionSettingsCard';

export default function FinancialCalculatorsPage() { // Renomeado o componente
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
          <Calculator className="w-10 h-10 text-[#57e389]" />
          <h1 className="text-4xl font-bold text-foreground">Calculadoras Financeiras</h1> {/* Título ajustado */}
        </div>
        {profile && (
          <p className="text-lg text-[#9ba8b5]">
            Olá, <span className="font-semibold text-white">{profile.first_name}</span>! Ajuste as configurações que impactam os cálculos de preços, impostos e conversões de moeda.
            {profile.client_id && <span className="block text-sm text-muted-foreground mt-1">ID do Cliente: {profile.client_id}</span>}
          </p>
        )}
        <p className="mt-4 text-[#9ba8b5]">
          Aqui você pode configurar as taxas padrão para impostos, parcelamentos e conversão de moeda.
        </p>

        <DefaultTaxSettingCard />

        <InstallmentRatesSettingCard />

        <AnnualPackageDiscountSettingCard />

        <CurrencyConversionSettingsCard />

      </motion.div>
    </DashboardLayout>
  );
}