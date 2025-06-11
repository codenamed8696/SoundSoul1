import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Please check your .env file.");
  // In a real app, you might want to throw an error here to stop execution
}

// --- FIX: Create a dummy storage object for the server ---
// This object satisfies the Supabase client's requirements but does nothing.
const serverStorage = {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
};

// --- FIX: Conditionally choose the storage adapter based on the platform ---
// If the code is running on the web but in a server environment (where 'window' is undefined),
// use the dummy storage. Otherwise, use the real AsyncStorage.
const storageAdapter = Platform.OS === 'web' && typeof window === 'undefined' 
  ? serverStorage 
  : AsyncStorage;

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});