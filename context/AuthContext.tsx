//
// NAME: context/AuthContext.tsx
//
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '../types';

// The context interface is updated to include the new loading state.
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  authLoading: boolean; // THE FIX: New state to track initial auth check.
  signIn: (email, password) => Promise<any>;
  signUp: (email, password, fullName) => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // THE FIX: Initialize authLoading to true. It will be set to false
  // only after the initial check with Supabase is complete.
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // This effect hook runs once on app startup to check the auth state.
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // If a user session exists, fetch their profile.
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profileError) throw profileError;
          setProfile(userProfile);
        }
      } catch (error) {
        console.error("Error fetching initial session:", error);
      } finally {
        // THE FIX: Critical step. Set loading to false regardless of
        // whether a user was found or not. This signals that the initial
        // check is done.
        setAuthLoading(false);
      }
    };

    fetchSession();

    // Listen for changes in authentication state (e.g., user signs in/out).
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: userProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (error) console.error("Error fetching profile on auth change:", error);
          setProfile(userProfile);
        } else {
          // Clear profile on sign out
          setProfile(null);
        }
        // Also set loading to false here to handle sign-in/sign-out events.
        setAuthLoading(false);
      }
    );

    return () => {
      // Cleanup the listener when the component unmounts.
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // --- No changes to your existing signIn, signUp, or signOut functions ---

  const value = {
    user,
    session,
    profile,
    authLoading, // THE FIX: Expose the new loading state through the context.
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { user: null, session: null, error };
        
        if(data.user) {
            const { error: profileError } = await supabase.from('profiles').insert({
                id: data.user.id,
                full_name: fullName,
                role: 'user' // Default role as discussed
            });
            if(profileError) return { user: data.user, session: data.session, error: profileError };
        }
        return { user: data.user, session: data.session, error: null };
    },
    signOut: () => supabase.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}