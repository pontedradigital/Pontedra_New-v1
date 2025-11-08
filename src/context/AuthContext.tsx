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

  // No localStorage usage for session persistence, purely in-memory for demo
  useEffect(() => {
    // Simulate a quick check if a user was "previously logged in" for a fresh load
    // In a real app, this would be an API call to validate a token
    setTimeout(() => {
      setIsLoading(false);
    }, 100); 
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const loggedInUser = await loginService(email, password);
    setIsLoading(false);
    if (loggedInUser) {
      setUser(loggedInUser);
      toast.success("Login realizado com sucesso!");
      return true;
    } else {
      toast.error("Credenciais inválidas.");
      return false;
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