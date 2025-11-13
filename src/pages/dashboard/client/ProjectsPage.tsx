import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ProjectsPage() {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-0"
      >
        <h1 className="text-4xl font-bold text-[#57e389] mb-6">Meus Projetos</h1>
        {profile && (
          <p className="text-lg text-[#9ba8b5]">
            Olá, <span className="font-semibold text-white">{profile.nome}</span>! Aqui você pode acompanhar o status dos seus projetos com a Pontedra.
          </p>
        )}
        <p className="mt-4 text-[#9ba8b5]">
          Em breve, você verá uma lista detalhada dos seus projetos, prazos, entregas e poderá interagir com nossa equipe.
        </p>
      </motion.div>
    </DashboardLayout>
  );
}