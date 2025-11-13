import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('prospect' | 'client' | 'master')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    // Pode renderizar um spinner de carregamento aqui
    return <div className="min-h-screen flex items-center justify-center bg-[#0D1B2A] text-white">Carregando...</div>;
  }

  if (!user) {
    // Não autenticado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Autenticado, mas sem o papel permitido, redireciona para uma página de acesso negado ou home
    toast.error("Você não tem permissão para acessar esta página.");
    return <Navigate to="/" replace />; // Ou para uma página de erro de permissão
  }

  return <>{children}</>;
};

export default ProtectedRoute;