//
// NAME: supabase/functions/ai-chat/index.ts
//
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const systemPrompt = `You are a friendly and supportive mental wellness assistant for an app called SoundSoul. You are not a licensed therapist. Your goal is to provide helpful, encouraging, and safe conversation. If a user expresses thoughts of self-harm, suicide, or crisis, you must immediately and concisely recommend that they seek professional help and state that you can provide resources. Do not give medical advice. Be empathetic and kind.`

serve(async (req) => {
  if (req.method === 'OPTIONS') { return new Response('ok', { headers: corsHeaders }) }
  try {
    const { messages } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY');
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing API Key.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }
    const contents = messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const body = JSON.stringify({ contents, systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] } });
    let geminiRes, geminiData;
    try {
      geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      geminiData = await geminiRes.json();
      console.log('Gemini API response:', JSON.stringify(geminiData));
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);
      return new Response(JSON.stringify({ error: 'Failed to call Gemini API.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }
    if (!geminiRes.ok) {
      console.error('Gemini API error:', geminiData?.error?.message);
      return new Response(JSON.stringify({ error: geminiData?.error?.message || 'AI service failed.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('AI returned an empty or invalid response:', JSON.stringify(geminiData));
      return new Response(JSON.stringify({ error: 'AI returned an empty response.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }
    return new Response(JSON.stringify({ reply: text }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: error && error.message ? error.message : String(error) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
})