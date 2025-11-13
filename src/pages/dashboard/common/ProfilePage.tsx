import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ProfilePage() {
  const { user, profile } = useAuth();

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-0"
      >
        <h1 className="text-4xl font-bold text-[#57e389] mb-6">Meu Perfil</h1>
        {user && profile ? (
          <div className="space-y-4 text-[#9ba8b5]">
            <p><strong>Nome:</strong> <span className="text-white">{profile.nome} {profile.sobrenome}</span></p>
            <p><strong>E-mail:</strong> <span className="text-white">{user.email}</span></p>
            <p><strong>Papel:</strong> <span className="text-[#57e389] capitalize">{profile.role}</span></p>
            <p><strong>Status:</strong> <span className="text-white capitalize">{profile.status}</span></p>
            {profile.telefone && <p><strong>Telefone:</strong> <span className="text-white">{profile.telefone}</span></p>}
            <p className="mt-4">
              Esta é a página onde você pode visualizar e editar suas informações de perfil.
            </p>
          </div>
        ) : (
          <p className="text-lg text-[#9ba8b5]">Carregando informações do perfil...</p>
        )}
      </motion.div>
    </DashboardLayout>
  );
}