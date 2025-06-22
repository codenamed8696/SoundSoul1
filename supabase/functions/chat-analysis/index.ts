import { serve } from 'https/deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MODERATE_RISK_KEYWORDS = [
  'anxious', 'depressed', 'hopeless', 'overwhelmed', 'stressed',
  'lonely', 'grief', 'worthless', 'empty', 'hurting'
];

const HIGH_RISK_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'self-harm', 'want to die',
  'no reason to live', 'goodbye world', 'harm myself'
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Lazily initialize the client inside the handler
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { record } = await req.json();
    
    if (!record || !record.content || !record.conversation_id) {
        return new Response(JSON.stringify({ error: 'Invalid record provided' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    if (record.role !== 'user') {
      return new Response(JSON.stringify({ message: 'OK: Not a user message, skipping analysis.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    const messageContent = record.content.toLowerCase();
    const conversationId = record.conversation_id;

    let newStatus = 'normal';

    if (HIGH_RISK_KEYWORDS.some(keyword => messageContent.includes(keyword))) {
      newStatus = 'risky';
    } else if (MODERATE_RISK_KEYWORDS.some(keyword => messageContent.includes(keyword))) {
      newStatus = 'moderate';
    }

    if (newStatus !== 'normal') {
      const { data, error } = await supabaseAdmin
        .from('ai_conversations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', conversationId)
        .select('status')
        .single();

      if (error) throw error; // Let the catch block handle it
      console.log(`Conversation ${conversationId} updated to status: ${data.status}`);
    }

    return new Response(JSON.stringify({ success: true, newStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error in chat-analysis function:', err.message);
    return new Response(JSON.stringify({ error: err.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});