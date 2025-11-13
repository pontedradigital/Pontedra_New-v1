import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom'; // Correção aqui

interface UserProfile {
  id: string;
  nome: string | null;
  sobrenome: string | null;
  telefone: string | null;
  role: 'prospect' | 'client' | 'master';
  status: 'ativo' | 'inativo';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, nome: string, sobrenome: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // Começa como true, indicando que estamos verificando o estado de autenticação
  const navigate = useNavigate();

  // Função para buscar o perfil do usuário
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Erro ao buscar perfil:", error.message, error.details, error.hint);
      toast.error(`Erro ao carregar perfil do usuário: ${error.message}`);
      setProfile(null);
    } else if (data) {
      setProfile(data as UserProfile);
    } else {
      // Caso não encontre perfil, mas sem erro explícito do Supabase (improvável com .single())
      console.warn("Nenhum dado de perfil encontrado para o usuário, mas nenhum erro reportado pelo Supabase. Definindo perfil como null.");
      setProfile(null);
    }
  };

  useEffect(() => {
    // Esta função irá lidar com a definição do usuário, busca do perfil e, finalmente, a definição de loading para false
    const handleAuthSession = async (session: Session | null) => {
      setLoading(true); // Sempre define loading como true ao processar um novo estado de sessão
      try {
        setUser(session?.user || null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null); // Limpa o perfil se não houver usuário
        }
      } catch (err) {
        console.error("Erro inesperado em handleAuthSession:", err);
        toast.error("Erro inesperado ao processar sessão de autenticação.");
        setProfile(null); // Garante que o perfil seja limpo em caso de erro
      } finally {
        setLoading(false); // O estado de autenticação e o perfil estão agora resolvidos
      }
    };

    // Escuta as mudanças no estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      await handleAuthSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Array de dependências vazio significa que isso é executado uma vez na montagem

  // NOVO useEffect para navegação após o perfil ser carregado
  useEffect(() => {
    // Só navega se não estiver carregando, se houver um usuário e um perfil
    if (!loading && user && profile) {
      // Verifica se a rota atual não é uma rota de dashboard para evitar redirecionamentos desnecessários
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/dashboard')) {
        if (profile.role === "master") {
          navigate("/dashboard/master");
        } else if (profile.role === "client") {
          navigate("/dashboard/client");
        } else { // Default para prospect
          navigate("/dashboard/prospect");
        }
      }
    } else if (!loading && !user) {
      // Se não estiver carregando e não houver usuário (deslogado),
      // e a rota atual for uma rota de dashboard, redireciona para o login.
      // Isso complementa o ProtectedRoute para casos onde o usuário desloga.
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/dashboard')) {
        navigate('/login');
      }
    }
  }, [loading, user, profile, navigate]); // Dependências para este efeito

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false); // Garante que loading seja false se o login falhar
      return false;
    }
    toast.success("Login realizado com sucesso!");
    return true;
  };

  const register = async (email: string, password: string, nome: string, sobrenome: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
          sobrenome,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false); // Se o registro falhar, garante que o loading global seja false
      return false;
    }
    if (data.user) {
      toast.success("Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.");
      return true;
    }
    setLoading(false); // Fallback se data.user for null, mas sem erro
    return false;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(error.message);
      setLoading(false); // Se o logout falhar, garante que o loading global seja false
    } else {
      toast.success("Logout realizado com sucesso!");
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};