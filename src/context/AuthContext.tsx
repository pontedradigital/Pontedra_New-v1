import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  first_name: string | null; // Renomeado de 'nome'
  last_name: string | null;  // Renomeado de 'sobrenome'
  telefone: string | null;
  role: 'prospect' | 'client' | 'master';
  status: 'ativo' | 'inativo';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, first_name: string, last_name: string) => Promise<boolean>; // Atualizado para first_name, last_name
  updateProfile: (updates: Partial<UserProfile & { email?: string }>) => Promise<boolean>; // Nova função
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
  }, [profile]); // Added profile to dependency array to make sure the `if (!profile || profile.id !== session.user.id)` check works correctly.

  useEffect(() => {
    console.log("AuthContext: Navigation Effect - loading:", loading, "user:", !!user, "profile:", !!profile, "currentPath:", window.location.pathname);
    if (!loading) {
      if (user && profile) {
        const currentPath = window.location.pathname;
        const expectedDashboardPrefix = `/dashboard/${profile.role}`;
        
        // If not on any dashboard route, or on a dashboard route but not the one matching the role, navigate.
        // This prevents unnecessary re-navigations if already on a valid sub-route like /dashboard/master/packages
        if (!currentPath.startsWith('/dashboard') || !currentPath.startsWith(expectedDashboardPrefix)) {
          console.log(`AuthContext: Navigating to ${expectedDashboardPrefix} based on role: ${profile.role}`);
          navigate(expectedDashboardPrefix);
        } else {
          console.log("AuthContext: Already on a valid dashboard route for this role, no navigation needed.");
        }
      } else if (!user) {
        const currentPath = window.location.pathname;
        // If on any dashboard route (except login/cadastro pages themselves), redirect to login.
        if (currentPath.startsWith('/dashboard') && !['/login', '/cadastro'].includes(currentPath)) {
          console.log("AuthContext: No user and on dashboard route, redirecting to login.");
          navigate('/login');
        }
      }
    }
  }, [loading, user, profile, navigate]); // Dependencies are correct here.

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

  const register = async (email: string, password: string, first_name: string, last_name: string): Promise<boolean> => {
    console.log("AuthContext: Attempting registration for:", email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name, // Usando first_name
          last_name,  // Usando last_name
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
      navigate('/login');
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