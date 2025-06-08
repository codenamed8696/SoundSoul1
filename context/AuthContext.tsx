import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/types';
import { router } from 'expo-router';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name?: string) => Promise<boolean>;
  signInAnonymously: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchUserProfile(session.user);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser | null) => {
    if (!supabaseUser) {
      setUser(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) throw error;
      
      if (data) {
        const appUser: User = {
          id: data.id,
          anonymousId: `user-${data.id.slice(0, 8)}`,
          email: supabaseUser.email || '',
          name: data.full_name,
          role: data.role,
          counselor_id: data.counselor_id || null, // Fetches the numeric counselor ID
          isAnonymous: !!supabaseUser.is_anonymous,
          preferences: data.preferences || {},
          companyConnection: data.company_connection || null,
        };
        setUser(appUser);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Sign in error:', error.message);
      return false;
    }
    return true;
  };

  const signUp = async (email: string, password: string, name?: string): Promise<boolean> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name || 'Wellness User' } },
    });
    if (error) {
      console.error('Sign up error:', error.message);
      return false;
    }
    return true;
  };

  const signInAnonymously = async (): Promise<boolean> => {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('Anonymous sign in error:', error.message);
      return false;
    }
    return true;
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setTimeout(() => router.replace('/(auth)/welcome'), 0);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInAnonymously, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}