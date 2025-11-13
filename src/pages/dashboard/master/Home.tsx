import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function MasterHome() {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-0"
      >
        <h1 className="text-4xl font-bold text-[#57e389] mb-6">Bem-vindo, Master!</h1>
        {profile && (
          <p className="text-lg text-[#9ba8b5]">
            Você está logado como <span className="font-semibold text-white">{profile.nome} {profile.sobrenome}</span> com o papel de <span className="font-semibold text-[#57e389]">{profile.role}</span>.
          </p>
        )}
        <p className="mt-4 text-[#9ba8b5]">
          Esta é a página inicial do seu dashboard Master. Em breve, você verá um resumo das informações mais importantes da plataforma, atividades recentes, e muito mais!
        </p>
      </motion.div>
    </DashboardLayout>
  );
}