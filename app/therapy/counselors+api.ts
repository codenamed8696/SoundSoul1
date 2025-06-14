import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../../supabase/functions/_shared/cors.ts';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);

export async function GET(request: Request) {
  try {
    //
    // DEBUGGING STEP: We are simplifying the query completely.
    // This query will fetch ALL counselors with a status of 'active'.
    // It does not join with any other tables.
    //
    const { data: counselors, error } = await supabaseAdmin
      .from('counselors')
      .select('*') // Select all columns from the counselors table
      .eq('status', 'active'); // Filter by status

    if (error) {
      throw error;
    }
    
    // We will log the result on the server to see what the database returns.
    console.log('Fetched counselors (raw):', counselors);

    // Note: The frontend might look strange because we are not fetching the profile names,
    // but this is a temporary step to see if we can get any data at all.
    return new Response(JSON.stringify({ counselors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching counselors (raw):', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}