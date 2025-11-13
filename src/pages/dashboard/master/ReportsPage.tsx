import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ReportsPage() {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-0"
      >
        <h1 className="text-4xl font-bold text-[#57e389] mb-6">Relatórios</h1>
        {profile && (
          <p className="text-lg text-[#9ba8b5]">
            Olá, <span className="font-semibold text-white">{profile.nome}</span>! Visualize os relatórios e métricas da plataforma aqui.
          </p>
        )}
        <p className="mt-4 text-[#9ba8b5]">
          Esta página fornecerá insights detalhados sobre o desempenho da plataforma, atividades dos usuários e muito mais.
        </p>
      </motion.div>
    </DashboardLayout>
  );
}