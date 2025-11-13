import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout'; // Importando DashboardLayout

export default function ProspectHome() {
  const { profile } = useAuth(); // Não precisamos mais do logout aqui, ele está na sidebar

  return (
    <DashboardLayout> {/* Envolvendo o conteúdo com DashboardLayout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-0" {/* Removendo padding aqui, pois o layout já o gerencia */}
      >
        <h1 className="text-4xl font-bold text-[#57e389] mb-6">Olá, Prospect!</h1>
        {profile && (
          <p className="text-lg text-[#9ba8b5]">
            Você está logado como <span className="font-semibold text-white">{profile.nome} {profile.sobrenome}</span>.
          </p>
        )}
        <p className="mt-4 text-[#9ba8b5]">
          Bem-vindo à sua área de degustação da plataforma Pontedra! Explore algumas funcionalidades e descubra como podemos impulsionar seu negócio.
        </p>
        {/* Conteúdo futuro para degustação */}
      </motion.div>
    </DashboardLayout>
  );
}