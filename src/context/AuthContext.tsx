import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
    }
  };

  useEffect(() => {
    // Esta função irá lidar com a definição do usuário, busca do perfil e, finalmente, a definição de loading para false
    const handleAuthSession = async (session: Session | null) => {
      setLoading(true); // Sempre define loading como true ao processar um novo estado de sessão
      setUser(session?.user || null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null); // Limpa o perfil se não houver usuário
      }
      setLoading(false); // O estado de autenticação e o perfil estão agora resolvidos
    };

    // Escuta as mudanças no estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      // Para qualquer evento que altere o usuário ou a sessão, reavalia e define loading como true temporariamente
      // até que o perfil seja buscado.
      // A sessão inicial também é tratada por este listener (evento 'INITIAL_SESSION').
      await handleAuthSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Array de dependências vazio significa que isso é executado uma vez na montagem

  const login = async (email: string, password: string): Promise<boolean> => {
    // O estado de carregamento local para o botão em Login.tsx irá lidar com seu próprio spinner.
    // O estado de carregamento global será gerenciado pelo listener onAuthStateChange.
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      // Se o login falhar, o listener onAuthStateChange não disparará um evento SIGNED_IN,
      // então precisamos garantir que o loading global seja false aqui.
      setLoading(false); // Garante que loading seja false se o login falhar
      return false;
    }
    toast.success("Login realizado com sucesso!");
    // O listener onAuthStateChange agora detectará o evento SIGNED_IN
    // e lidará com a busca do perfil e a definição do loading global para false.
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
      // O listener onAuthStateChange lidará com a definição de user, profile e loading para false
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
      // O listener onAuthStateChange detectará o evento SIGNED_OUT
      // e lidará com a definição de user/profile para null e loading global para false.
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