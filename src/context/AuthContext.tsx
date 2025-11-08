import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import api from "@/services/api"; // Importar a instância do axios configurada

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

export const AuthProvider = ({ children }: { ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar usuário e token do localStorage ao iniciar a aplicação
  useEffect(() => {
    const loadUserFromLocalStorage = () => {
      try {
        const storedToken = localStorage.getItem("pontedra_token");
        const storedUser = localStorage.getItem("pontedra_user");

        if (storedToken && storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          // Configurar o token no cabeçalho padrão do axios para futuras requisições
          api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        // Limpar dados inválidos
        localStorage.removeItem("pontedra_token");
        localStorage.removeItem("pontedra_user");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromLocalStorage();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Endpoint de login (ajuste conforme sua API)
      const LOGIN_ENDPOINT = "/auth/login"; 
      const response = await api.post(LOGIN_ENDPOINT, { email, password });

      const { token, user: loggedInUser } = response.data;

      if (!token || !loggedInUser) {
        throw new Error("Token ou dados do usuário não recebidos do servidor.");
      }

      // Salvar token e usuário no localStorage
      localStorage.setItem("pontedra_token", token);
      localStorage.setItem("pontedra_user", JSON.stringify(loggedInUser));

      // Atualizar estado do contexto
      setUser(loggedInUser);
      setIsAuthenticated(true);
      
      // Configurar o token no cabeçalho padrão do axios para futuras requisições
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast.success("Login realizado com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Erro no login:", error);
      const errorMessage = error.response?.data?.message || "Erro ao autenticar. Verifique suas credenciais.";
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Limpar localStorage
    localStorage.removeItem("pontedra_token");
    localStorage.removeItem("pontedra_user");

    // Limpar estado do contexto
    setUser(null);
    setIsAuthenticated(false);
    
    // Remover token do cabeçalho padrão do axios
    delete api.defaults.headers.common["Authorization"];

    toast.info("Você foi desconectado.");
  };

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