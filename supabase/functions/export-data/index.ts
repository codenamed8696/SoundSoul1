// In supabase/functions/export-data/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No Authorization header')
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    if (userError || !user) throw new Error('Invalid user')

    const userId = user.id

    // Fetch all data
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()
    const { data: journal_entries } = await supabase.from('journal_entries').select('*').eq('user_id', userId)
    const { data: mood_entries } = await supabase.from('mood_entries').select('*').eq('user_id', userId)

    const exportData = { profile, journal_entries, mood_entries }

    // Placeholder: log the data (replace with email logic in production)
    console.log('User data export:', JSON.stringify(exportData, null, 2))

    return new Response(JSON.stringify({ success: true, message: 'Data export initiated.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})