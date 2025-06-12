import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any;
  initialized: boolean;
  signIn: (email, password) => Promise<any>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>; // Expose fetchProfile to be called from other contexts
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchProfile = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      try {
        // This query now explicitly defines the relationship to avoid ambiguity
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('*, counselors!fk_counselors_profile_id(*)') 
          .eq('id', currentUser.id)
          .single();
        
        if (error) throw error;
        
        // This restructures the profile object for easier access throughout the app
        const profileData = {
          ...userProfile,
          // Use the `counselor_id` from the profiles table itself
          counselor_id: userProfile.counselor_id,
          // Keep the full counselor object if it exists
          counselor: Array.isArray(userProfile.counselors) ? userProfile.counselors[0] : userProfile.counselors || null,
        };
        delete profileData.counselors; // Clean up the temporary array

        setProfile(profileData);

      } catch (e) {
        console.error("AuthContext: Error fetching profile.", e);
        setProfile(null);
      }
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if(session) {
        await fetchProfile();
      }
      setInitialized(true);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        await fetchProfile();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = { session, user, profile, initialized, signIn, signOut, fetchProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};