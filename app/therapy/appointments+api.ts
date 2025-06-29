// app/api/therapy/appointments+api.ts
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../../_shared/cors';
import { validateSession } from '../../utils/authStore'; // Preserving your auth utility

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error('Authorization token required');
    
    const token = authHeader.substring(7);
    const user = await validateSession(token);
    if (!user) throw new Error('Invalid or expired token');

    // Corrected query with explicit foreign key names for nested joins
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        counselor:counselors!appointments_counselor_id_fkey (
            id,
            profile:profiles!counselors_profile_id_fkey (
                full_name,
                avatar_url
            )
        )
      `)
      .eq('user_id', user.id)
      .order('appointment_time', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ appointments: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

// Your POST handler is preserved as it was correct
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error('Authorization token required');

    const token = authHeader.substring(7);
    const user = await validateSession(token);
    if (!user) throw new Error('Invalid or expired token');

    const { counselor_id, appointment_time, type, duration } = await request.json();
    if (!counselor_id || !appointment_time || !type) {
      throw new Error('Missing required fields for booking.');
    }

    const { data, error } = await supabaseAdmin
      .from('appointments')
      .insert({
        user_id: user.id,
        counselor_id,
        appointment_time,
        type,
        duration: duration || 60,
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, appointment: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    });
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}