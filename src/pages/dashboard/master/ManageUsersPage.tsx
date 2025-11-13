import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ManageUsersPage() {
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-0"
      >
        <h1 className="text-4xl font-bold text-[#57e389] mb-6">Gerenciar Usuários</h1>
        {profile && (
          <p className="text-lg text-[#9ba8b5]">
            Olá, <span className="font-semibold text-white">{profile.nome}</span>! Como <span className="font-semibold text-[#57e389] capitalize">{profile.role}</span>, você tem acesso total ao gerenciamento de usuários.
          </p>
        )}
        <p className="mt-4 text-[#9ba8b5]">
          Aqui você poderá adicionar, editar e remover usuários, além de gerenciar seus papéis e permissões na plataforma.
        </p>
      </motion.div>
    </DashboardLayout>
  );
}