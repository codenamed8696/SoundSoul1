import { supabase } from './supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Profile } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean; // This state is crucial for navigation
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
  const [loading, setLoading] = useState(true);

  const getProfileForUser = useCallback(async (currentUser: User) => {
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }
      
      if (data) {
        setProfile(data as Profile);
      }
    } catch (error) {
        console.error('Error fetching profile:', (error as Error).message);
    }
  }, []);
  
  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error.message);
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await getProfileForUser(session.user);
      }
      
      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // When a new session appears (e.g., after sign-in),
          // set loading to true while we fetch the new profile.
          setLoading(true);
          await getProfileForUser(newSession.user);
          setLoading(false);
        } else {
          // If the session is null (sign-out), clear the profile.
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [getProfileForUser]);


  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null); // Explicitly clear profile on sign out
  };

  const signUp = async (email, password, name) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    return { error };
  };
  
  const signInAnonymously = async () => {
    const { error } = await supabase.auth.signInAnonymously();
    return { error };
  };
  
  const value = { session, user, profile, loading, signIn, signOut, signUp, signInAnonymously };

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