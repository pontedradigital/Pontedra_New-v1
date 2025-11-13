import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Bot } from 'lucide-react'; // Ícone para a IA

export default function VedraAIPage() {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-0"
      >
        <h1 className="text-4xl font-bold text-[#57e389] mb-6 flex items-center gap-3">
          <Bot className="w-10 h-10" /> IA Atendimento <span className="text-white">(Vedra)</span>
        </h1>
        {profile && (
          <p className="text-lg text-[#9ba8b5]">
            Olá, <span className="font-semibold text-white">{profile.nome}</span>! Gerencie e configure a inteligência artificial de atendimento, Vedra.
          </p>
        )}
        <p className="mt-4 text-[#9ba8b5]">
          Nesta página, você poderá treinar a Vedra, configurar respostas automáticas, monitorar interações e otimizar o atendimento ao cliente.
        </p>
      </motion.div>
    </DashboardLayout>
  );
}