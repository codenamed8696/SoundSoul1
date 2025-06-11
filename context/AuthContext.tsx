import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any;
  initialized: boolean;
  signIn: (email, password) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log("AuthContext: Setting up auth state listener.");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log(`AuthContext: onAuthStateChange event fired - ${_event}`);
      setSession(session);
      setUser(session?.user ?? null);
      setProfile(null);

      if (session?.user) {
        console.log("AuthContext: Session found, fetching profile...");
        try {
          const { data: userProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error("AuthContext: Error fetching profile.", error);
          } else {
            console.log("AuthContext: Profile fetched successfully.", userProfile);
            setProfile(userProfile);
          }
        } catch (e) {
            console.error("AuthContext: Exception while fetching profile.", e);
        }
      } else {
         console.log("AuthContext: No session, clearing profile.");
      }
      
      console.log("AuthContext: Initialization complete.");
      setInitialized(true);
    });

    return () => {
      console.log("AuthContext: Unsubscribing from auth state listener.");
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    console.log("AuthContext: Attempting to sign in...");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if(error) {
        console.error("AuthContext: sign in failed.", error.message);
    } else {
        console.log("AuthContext: sign in successful.");
    }
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = { session, user, profile, initialized, signIn, signOut };

  return (
    <AuthContext.Provider value={value}>
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