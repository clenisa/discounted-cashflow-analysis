import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const createUnavailableAuthError = (action: string) => {
    const message = `Supabase authentication is unavailable. Unable to ${action}.`;
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn(message);
    }
    const error = new Error(message) as AuthError;
    error.name = 'AuthUnavailableError';
    return { error };
  };

  useEffect(() => {
    const client = supabase;

    if (!isSupabaseConfigured || !client) {
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await client.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) {
      return createUnavailableAuthError('sign in');
    }
    const { error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) {
      return createUnavailableAuthError('sign up');
    }
    const { error } = await client.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) {
      return createUnavailableAuthError('sign out');
    }
    const { error } = await client.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) {
      return createUnavailableAuthError('reset password');
    }
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
