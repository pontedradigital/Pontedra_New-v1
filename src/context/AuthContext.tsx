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
  const [loading, setLoading] = useState(true); // Start as true, indicating we are checking auth state
  const navigate = useNavigate();

  // Function to fetch user profile
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
      setLoading(true); // Ensure loading is true at the start of processing any session change
      try {
        setUser(session?.user || null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null); // Clear profile if no user
        }
      } catch (err) {
        console.error("AuthContext: Unexpected error in handleAuthSession:", err);
        toast.error("Erro inesperado ao processar sessão de autenticação.");
        setProfile(null);
      } finally {
        console.log("AuthContext: handleAuthSession finished. Setting loading to false.");
        setLoading(false); // Crucial: ensure loading is always set to false here
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("AuthContext: Initial getSession result:", session);
      handleAuthSession(session);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthContext: onAuthStateChange event:", event, "session:", session);
      // Only re-process the session if it's a significant event
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
        handleAuthSession(session);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Navigation effect
  useEffect(() => {
    console.log("AuthContext: Navigation Effect - loading:", loading, "user:", !!user, "profile:", !!profile, "currentPath:", window.location.pathname);
    if (!loading && user && profile) {
      const currentPath = window.location.pathname;
      // Only navigate if not already on a dashboard route
      if (!currentPath.startsWith('/dashboard')) {
        console.log("AuthContext: Navigating to dashboard based on role:", profile.role);
        if (profile.role === "master") {
          navigate("/dashboard/master");
        } else if (profile.role === "client") {
          navigate("/dashboard/client");
        } else { // Default to prospect
          navigate("/dashboard/prospect");
        }
      } else {
        console.log("AuthContext: Already on a dashboard route, no navigation needed.");
      }
    } else if (!loading && !user) {
      const currentPath = window.location.pathname;
      // If not loading and no user, and currently on a dashboard route, redirect to login
      if (currentPath.startsWith('/dashboard')) {
        console.log("AuthContext: No user and on dashboard route, redirecting to login.");
        navigate('/login');
      }
    }
  }, [loading, user, profile, navigate]);

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

  const register = async (email: string, password: string, nome: string, sobrenome: string): Promise<boolean> => {
    console.log("AuthContext: Attempting registration for:", email);
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

  const logout = async () => {
    console.log("AuthContext: Attempting logout.");
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("AuthContext: Logout failed:", error.message);
      toast.error(error.message);
    } else {
      console.log("AuthContext: Logout successful, waiting for onAuthStateChange.");
      toast.success("Logout realizado com sucesso!");
      navigate('/login'); // Navigate immediately after successful logout
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