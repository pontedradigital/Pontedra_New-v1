import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom'; // Importar useLocation

interface UserProfile {
  id: string;
  client_id: string | null; // NOVO: Adicionado client_id
  first_name: string | null;
  last_name: string | null;
  telefone: string | null;
  role: 'prospect' | 'client' | 'master';
  status: 'ativo' | 'inativo';
  company_organization: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_cep: string | null;
  date_of_birth: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, first_name: string, last_name: string, optional_data?: Partial<Omit<UserProfile, 'id' | 'client_id' | 'role' | 'status' | 'created_at'>>) => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile & { email?: string }>) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Usar useLocation para o caminho atual

  const fetchProfile = async (userId: string) => {
    console.log("AuthContext: Attempting to fetch profile for userId:", userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("AuthContext: Error fetching profile:", error.message, error.details, error.hint);
      toast.error(`Erro ao carregar perfil do usuário: ${error.message}`);
      setProfile(null);
    } else if (data) {
      console.log("AuthContext: Profile fetched successfully:", data);
      setProfile(data as UserProfile);
    } else {
      console.warn("AuthContext: No profile data found for user, setting profile to null.");
      setProfile(null);
    }
  };

  useEffect(() => {
    const handleAuthSession = async (session: Session | null) => {
      console.log("AuthContext: handleAuthSession triggered. Current session:", session);
      setLoading(true);
      try {
        setUser(session?.user || null);
        if (session?.user) {
          // Only fetch profile if user is new or profile is not yet loaded for this user
          if (!profile || profile.id !== session.user.id) {
            await fetchProfile(session.user.id);
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("AuthContext: Unexpected error in handleAuthSession:", err);
        toast.error("Erro inesperado ao processar sessão de autenticação.");
        setProfile(null);
      } finally {
        console.log("AuthContext: handleAuthSession finished. Setting loading to false.");
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("AuthContext: Initial getSession result:", session);
      handleAuthSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthContext: onAuthStateChange event:", event, "session:", session);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
        handleAuthSession(session);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [profile]);

  useEffect(() => {
    console.log("AuthContext: Navigation Effect - loading:", loading, "user:", !!user, "profile:", !!profile, "currentPath:", location.pathname);
    if (!loading) {
      const currentPath = location.pathname;

      if (user && profile) {
        // Se o usuário está logado e tem perfil, e está nas páginas de login/cadastro, redireciona para o dashboard
        if (currentPath === '/login' || currentPath === '/cadastro') {
          const expectedDashboardHome = `/dashboard/${profile.role}`;
          console.log(`AuthContext: User authenticated, redirecting from ${currentPath} to ${expectedDashboardHome}`);
          navigate(expectedDashboardHome, { replace: true });
        }
      } else if (!user) {
        // Se o usuário NÃO está logado, e está em uma rota de dashboard, redireciona para o login
        if (currentPath.startsWith('/dashboard')) {
          console.log(`AuthContext: User not authenticated, redirecting from ${currentPath} to /login`);
          navigate('/login', { replace: true });
        }
      }
    }
  }, [loading, user, profile, navigate, location.pathname]); // Adicionado location.pathname às dependências

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("AuthContext: Attempting login for:", email);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("AuthContext: Login failed:", error.message);
      toast.error(error.message);
      return false;
    }
    console.log("AuthContext: Login successful, waiting for onAuthStateChange.");
    toast.success("Login realizado com sucesso!");
    return true;
  };

  const register = async (email: string, password: string, first_name: string, last_name: string, optional_data?: Partial<Omit<UserProfile, 'id' | 'client_id' | 'role' | 'status' | 'created_at'>>): Promise<boolean> => {
    console.log("AuthContext: Attempting registration for:", email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          ...optional_data, // Passa os dados opcionais para user_metadata
        },
      },
    });

    if (error) {
      console.error("AuthContext: Registration failed:", error.message);
      toast.error(error.message);
      return false;
    }
    if (data.user) {
      console.log("AuthContext: Registration successful, user:", data.user.id);
      toast.success("Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.");
      return true;
    }
    console.warn("AuthContext: Registration completed, but no user data returned.");
    return false;
  };

  const updateProfile = async (updates: Partial<UserProfile & { email?: string }>): Promise<boolean> => {
    if (!user) {
      toast.error("Você precisa estar logado para atualizar o perfil.");
      return false;
    }

    setLoading(true);
    try {
      // Update auth.users table for email
      if (updates.email && updates.email !== user.email) {
        const { error: userUpdateError } = await supabase.auth.updateUser({ email: updates.email });
        if (userUpdateError) {
          throw new Error(`Erro ao atualizar e-mail: ${userUpdateError.message}`);
        }
        toast.success("E-mail atualizado com sucesso! Verifique sua caixa de entrada para confirmar o novo e-mail.");
      }

      // Update public.profiles table for other fields
      const profileUpdates: Partial<UserProfile> = {};
      if (updates.first_name !== undefined) profileUpdates.first_name = updates.first_name;
      if (updates.last_name !== undefined) profileUpdates.last_name = updates.last_name;
      if (updates.telefone !== undefined) profileUpdates.telefone = updates.telefone;
      if (updates.company_organization !== undefined) profileUpdates.company_organization = updates.company_organization;
      if (updates.address_street !== undefined) profileUpdates.address_street = updates.address_street;
      if (updates.address_number !== undefined) profileUpdates.address_number = updates.address_number;
      if (updates.address_complement !== undefined) profileUpdates.address_complement = updates.address_complement;
      if (updates.address_neighborhood !== undefined) profileUpdates.address_neighborhood = updates.address_neighborhood;
      if (updates.address_city !== undefined) profileUpdates.address_city = updates.address_city;
      if (updates.address_state !== undefined) profileUpdates.address_state = updates.address_state;
      if (updates.address_cep !== undefined) profileUpdates.address_cep = updates.address_cep;
      if (updates.date_of_birth !== undefined) profileUpdates.date_of_birth = updates.date_of_birth;

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user.id);

        if (profileUpdateError) {
          throw new Error(`Erro ao atualizar perfil: ${profileUpdateError.message}`);
        }
        toast.success("Perfil atualizado com sucesso!");
        await fetchProfile(user.id); // Re-fetch profile to update context state
      }
      return true;
    } catch (error: any) {
      console.error("AuthContext: Error updating profile:", error.message);
      toast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log("AuthContext: Attempting logout.");
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("AuthContext: Logout failed:", error.message);
      toast.error(error.message);
    } else {
      console.log("AuthContext: Logout successful, waiting for onAuthStateChange.");
      toast.success("Logout realizado com sucesso!");
      // Removido navigate('/login') daqui, o useEffect já lida com isso.
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, updateProfile, logout }}>
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