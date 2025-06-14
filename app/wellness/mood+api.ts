import { createClient } from '@supabase/supabase-js';
import { validateSession } from '@/utils/authStore';

// Create a server-side Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authorization token required' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const token = authHeader.substring(7);
    const user = await validateSession(token);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { mood, notes } = await request.json();
    if (typeof mood !== 'number' || mood < 1 || mood > 5) {
      return new Response(JSON.stringify({ error: 'Mood must be a number between 1 and 5' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Use Supabase Admin Client to insert into the real database
    const { data: moodEntry, error } = await supabaseAdmin
      .from('mood_entries')
      .insert({ user_id: user.id, mood_score: mood, notes: notes })
      .select()
      .single();

    if (error) throw error;
    
    return new Response(JSON.stringify({ moodEntry, success: true, message: 'Mood entry created successfully' }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Create mood entry error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authorization token required' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const token = authHeader.substring(7);
    const user = await validateSession(token);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Use Supabase Admin Client to fetch from the real database
    const { data: moodEntries, error, count } = await supabaseAdmin
      .from('mood_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    
    return new Response(JSON.stringify({ moodEntries, total: count, limit, offset, success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Get mood entries error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}