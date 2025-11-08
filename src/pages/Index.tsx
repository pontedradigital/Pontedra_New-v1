import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/landing"); // Redireciona para a Landing Page se não estiver autenticado
      } else {
        if (user?.role === "master") {
          navigate("/dashboard/master");
        } else if (user?.role === "client") {
          navigate("/dashboard/cliente");
        } else {
          // Fallback for unknown roles or if user object is incomplete
          navigate("/landing"); // Redireciona para a Landing Page
        }
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Carregando...</h1>
          <p className="text-xl text-muted-foreground">Verificando sua sessão.</p>
        </div>
        <MadeWithDyad />
      </div>
    );
  }

  // This component will redirect, so this content should ideally not be seen.
  // It's a fallback in case of very fast redirects or issues.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Redirecionando...</h1>
        <p className="text-xl text-muted-foreground">Aguarde um momento.</p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;