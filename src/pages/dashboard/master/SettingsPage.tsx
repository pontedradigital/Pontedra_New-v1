import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function SettingsPage() {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-0"
      >
        <h1 className="text-4xl font-bold text-[#57e389] mb-6">Configurações</h1>
        {profile && (
          <p className="text-lg text-[#9ba8b5]">
            Olá, <span className="font-semibold text-white">{profile.nome}</span>! Gerencie as configurações gerais da plataforma aqui.
          </p>
        )}
        <p className="mt-4 text-[#9ba8b5]">
          Nesta página, você poderá ajustar as configurações do sistema, integrações e outras opções administrativas.
        </p>
      </motion.div>
    </DashboardLayout>
  );
}