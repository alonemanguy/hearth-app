import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type HelpLevel = 'basic' | 'guided' | 'detailed';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  helpLevel: HelpLevel;
  hasOnboarded: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setHelpLevel: (level: HelpLevel) => Promise<void>;
  completeOnboarding: (level: HelpLevel) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const setHelpLevel = async (level: HelpLevel) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { help_level: level },
    });
    if (!error && data.user) {
      setUser(data.user);
    }
  };

  const completeOnboarding = async (level: HelpLevel) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { help_level: level, has_onboarded: true },
    });
    if (!error && data.user) {
      setUser(data.user);
    }
  };

  const helpLevel: HelpLevel =
    (user?.user_metadata?.help_level as HelpLevel | undefined) ?? 'guided';
  const hasOnboarded = Boolean(user?.user_metadata?.has_onboarded);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        helpLevel,
        hasOnboarded,
        signUp,
        signIn,
        signOut,
        setHelpLevel,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}