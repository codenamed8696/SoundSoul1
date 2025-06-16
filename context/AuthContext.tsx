import { supabase } from './supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Profile } from '../types';

// The context type no longer includes signInWithGoogle or signInWithApple
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email, password) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  signUp: (email, password, name) => Promise<{ error: any | null }>;
  signInAnonymously: () => Promise<{ error: any | null }>;
  updateUserRole: (role: 'user' | 'counselor' | 'employer') => Promise<{ error: any | null }>;
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
          setLoading(true);
          await getProfileForUser(newSession.user);
          setLoading(false);
        } else {
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
    setProfile(null);
  };

  const signUp = async (email, password, name) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { 
        data: { 
          full_name: name 
        } 
      } 
    });
    return { error };
  };
  
  const signInAnonymously = async () => {
    const { error } = await supabase.auth.signInAnonymously();
    return { error };
  };

  const updateUserRole = async (role: 'user' | 'counselor' | 'employer') => {
    if (!user) {
      return { error: { message: "No user is currently signed in." } };
    }
    const { error } = await supabase
      .from('profiles')
      .update({ role: role })
      .eq('id', user.id);
    
    if (!error) {
      await getProfileForUser(user);
    }

    return { error };
  };
  
  // The context value now only includes the methods we are actually using.
  const value = { 
    session, 
    user, 
    profile, 
    loading, 
    signIn, 
    signOut, 
    signUp, 
    signInAnonymously, 
    updateUserRole 
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