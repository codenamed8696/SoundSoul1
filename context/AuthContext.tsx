import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { Profile } from '../types';

// The interface for the context, providing all necessary values and functions.
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email, password) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  signUp: (email, password, name) => Promise<{ error: any | null }>;
  signInAnonymously: () => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // The app starts in a loading state until the initial session check is complete.
  const [loading, setLoading] = useState(true);

  // This is the "self-healing" function that creates a profile if it's missing.
  const getProfileForUser = useCallback(async (currentUser: User) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();

    if (error && error.code === 'PGRST116') {
      console.warn('Profile not found, creating one...');
      const { error: rpcError } = await supabase.rpc('handle_new_user');
      if (rpcError) {
        console.error('Fatal error creating profile, signing out.', rpcError);
        await supabase.auth.signOut();
        return null;
      }
      const { data: newProfile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
      return newProfile;
    }
    return data;
  }, []);

  // This single useEffect hook is the only place that manages auth state changes.
  useEffect(() => {
    // On startup, check for an existing session.
    const bootstrapAuth = async () => {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
            const initialProfile = await getProfileForUser(initialSession.user);
            setProfile(initialProfile);
        }
        setLoading(false);
    };
    
    bootstrapAuth();

    // The onAuthStateChange listener is the single source of truth for all subsequent auth events.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setProfile(null); // Clear old profile on any auth change
        if (newSession?.user) {
            const userProfile = await getProfileForUser(newSession.user);
            setProfile(userProfile);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [getProfileForUser]);

  // All functions simply call Supabase. The listener above handles the results.
  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };
  
  const signUp = async (email, password, name) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    return { error };
  };
  
  const signInAnonymously = async () => {
    const { error } = await supabase.auth.signInAnonymously();
    return { error };
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signIn,
    signOut,
    signUp,
    signInAnonymously,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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