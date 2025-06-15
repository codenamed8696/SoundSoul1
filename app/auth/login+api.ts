// app/api/login+api.ts
import { createClient } from '@supabase/supabase-js';
import { ExpoRequest, ExpoResponse } from 'expo-router/server';

// These should be in your environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: ExpoRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return ExpoResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return ExpoResponse.json({ error: error.message }, { status: 401 });
    }

    // On success, the client's onAuthStateChange listener will handle the session
    return ExpoResponse.json({
        user: data.user,
        session: data.session,
        success: true
    });

  } catch (error) {
    console.error('Login API error:', error);
    return ExpoResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
    );
  }
}