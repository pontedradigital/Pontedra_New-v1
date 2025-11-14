import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ProspectHome() {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-0"
      >
        <h1 className="text-4xl font-bold text-[#57e389] mb-6">Olá, Prospect!</h1>
        {profile && (
          <p className="text-lg text-[#9ba8b5]">
            Você está logado como <span className="font-semibold text-white">{profile.first_name} {profile.last_name}</span>.
            {profile.client_id && <span className="block text-sm text-muted-foreground mt-1">ID do Cliente: {profile.client_id}</span>}
          </p>
        )}
        <p className="mt-4 text-[#9ba8b5]">
          Bem-vindo à sua área de degustação da plataforma Pontedra! Explore algumas funcionalidades e descubra como podemos impulsionar seu negócio.
        </p>
      </motion.div>
    </DashboardLayout>
  );
}