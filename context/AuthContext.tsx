import { supabase } from './supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Profile } from '../types';
import { Alert } from 'react-native';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email, password) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  signUp: (email, password, name) => Promise<{ error: any | null }>;
  signInAnonymously: () => Promise<{ error: any | null }>;
  updateUserRole: (role: 'user' | 'counselor' | 'employer') => Promise<{ error: any | null; }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const getProfileForUser = useCallback(async (currentUser: User) => {
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`*`)
        .eq('id', currentUser.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }
      if (data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      Alert.alert('Error fetching profile', (error as Error).message);
    }
  }, []);


  useEffect(() => {
    setLoading(true);
    const fetchInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
            await getProfileForUser(session.user);
        }
        setLoading(false);
    };

    fetchInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
            await getProfileForUser(newSession.user);
        } else {
            setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [getProfileForUser]);


  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signUp = async (email, password, name) => {
    const { data: authData, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) return { error };
    if (!authData.user) return { error: { message: "Signup failed." } };
    const { error: profileError } = await supabase.from('profiles').insert({ id: authData.user.id, full_name: name, role: 'user' });
    return { error: profileError };
  };
  
  const signInAnonymously = async () => {
    const { error } = await supabase.auth.signInAnonymously();
    return { error };
  };
  
  const updateUserRole = async (role) => {
    if (!user) return { error: { message: "No user signed in." } };
    const { error } = await supabase.from('profiles').update({ role }).eq('id', user.id);
    if (!error) await getProfileForUser(user);
    return { error };
  };
  
  const value = { session, user, profile, loading, signIn, signOut, signUp, signInAnonymously, updateUserRole };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};