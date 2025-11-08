import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loginService } from "@/services/auth";
import { toast } from "sonner";

export interface User {
  email: string;
  role: "master" | "client";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate a quick check if a user was "previously logged in" for a fresh load
  // Em um app real, isso seria uma chamada de API para validar um token existente
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const loggedInUser = await loginService(email, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        toast.success("Login realizado com sucesso!");
        return true;
      } else {
        // loginService retornou null, significa credenciais inválidas
        toast.error("Credenciais inválidas. Verifique seu e-mail e senha.");
        return false;
      }
    } catch (error: any) {
      // Captura erros de rede ou outros erros rejeitados pelo loginService
      toast.error(error.message || "Ocorreu um erro inesperado ao tentar fazer login.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    toast.info("Você foi desconectado.");
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};