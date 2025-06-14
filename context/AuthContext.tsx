import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { Profile } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- This function handles fetching the profile and self-healing if it's missing ---
    const getProfileForUser = async (currentUser: User) => {
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      // THE FIX: If the profile is not found (PGRST116), call the database function
      // to create it, and then try fetching it again.
      if (error && error.code === 'PGRST116') {
        console.warn('Profile not found, attempting to create one...');
        const { error: rpcError } = await supabase.rpc('handle_new_user');
        
        if (rpcError) {
          console.error('Failed to create profile via RPC:', rpcError);
          // If we can't even create the profile, sign out to prevent a stuck state.
          await supabase.auth.signOut();
          return null;
        }

        // Try fetching the profile one more time after creation.
        const { data: newlyCreatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        return newlyCreatedProfile;
      }
      
      if (error) {
        console.error("AuthContext: Unhandled error fetching profile.", error);
        return null;
      }

      return userProfile;
    };

    // --- Main Auth Logic ---
    const setupAuth = async () => {
      setLoading(true);
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      const currentUser = initialSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const fetchedProfile = await getProfileForUser(currentUser);
        setProfile(fetchedProfile);
      }
      setLoading(false);
    };

    setupAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setLoading(true);
        setSession(newSession);
        const newCurrentUser = newSession?.user ?? null;
        setUser(newCurrentUser);

        if (newCurrentUser) {
          const fetchedProfile = await getProfileForUser(newCurrentUser);
          setProfile(fetchedProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    profile,
    loading,
    signOut: () => supabase.auth.signOut(),
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