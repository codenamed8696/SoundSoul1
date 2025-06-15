// app/api/therapy/counselors+api.ts
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../../_shared/cors'; // Assuming cors.ts is in a shared folder

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    // You should add session validation here for security
    
    const { data: counselors, error } = await supabaseAdmin
      .from('counselors')
      .select(`
        id,
        status,
        specialties,
        bio,
        profile:profiles!counselors_profile_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq('status', 'active');

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ counselors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Error fetching counselors:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}