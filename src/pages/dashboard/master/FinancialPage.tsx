import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function FinancialPage() {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-0"
      >
        <h1 className="text-4xl font-bold text-[#57e389] mb-6">Financeiro</h1>
        {profile && (
          <p className="text-lg text-[#9ba8b5]">
            Olá, <span className="font-semibold text-white">{profile.nome}</span>! Esta é a sua central financeira.
          </p>
        )}
        <p className="mt-4 text-[#9ba8b5]">
          Nesta página, você terá acesso a um resumo financeiro, fluxo de caixa, contas a pagar e a receber, e outras ferramentas de gestão financeira.
        </p>
      </motion.div>
    </DashboardLayout>
  );
}