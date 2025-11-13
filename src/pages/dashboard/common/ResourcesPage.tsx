import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ResourcesPage() {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-0"
      >
        <h1 className="text-4xl font-bold text-[#57e389] mb-6">Recursos</h1>
        {profile && (
          <p className="text-lg text-[#9ba8b5]">
            Olá, <span className="font-semibold text-white">{profile.nome}</span>! Aqui você encontrará recursos úteis para o seu papel de <span className="font-semibold text-[#57e389] capitalize">{profile.role}</span>.
          </p>
        )}
        <p className="mt-4 text-[#9ba8b5]">
          Esta página será preenchida com tutoriais, guias, documentos e outras ferramentas para ajudar você a aproveitar ao máximo a plataforma Pontedra.
        </p>
      </motion.div>
    </DashboardLayout>
  );
}