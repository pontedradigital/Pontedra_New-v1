import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ClientHome() {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-0"
      >
        <h1 className="text-4xl font-bold text-[#57e389] mb-6">Bem-vindo, Cliente!</h1>
        {profile && (
          <p className="text-lg text-[#9ba8b5]">
            Você está logado como <span className="font-semibold text-white">{profile.nome} {profile.sobrenome}</span>.
          </p>
        )}
        <p className="mt-4 text-[#9ba8b5]">
          Esta é a página inicial do seu dashboard de Cliente. Aqui você poderá ver seus próximos agendamentos, insights e benefícios exclusivos.
        </p>
      </motion.div>
    </DashboardLayout>
  );
}