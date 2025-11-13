import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button'; // Importando o componente Button

export default function ProspectHome() {
  const { profile, logout } = useAuth(); // Obtendo a função logout do AuthContext

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 bg-[#0D1B2A] min-h-screen text-white"
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

      <div className="mt-8">
        <Button 
          onClick={logout} 
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Sair
        </Button>
      </div>
    </motion.div>
  );
}