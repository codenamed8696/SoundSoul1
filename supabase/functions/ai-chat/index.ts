import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';

// --- Crisis Detection Keywords ---
// This list should be expanded and refined based on clinical guidance.
const crisisKeywords = [
  'kill myself', 'suicide', 'end my life', 'want to die', 'no reason to live',
  'self-harm', 'cutting myself', 'hurt myself', 'overdose'
];

// --- Pre-defined Safety Response ---
const crisisResponse = "I'm very concerned by what you've shared. It's incredibly brave of you to talk about this, and I want you to know that your safety is the most important thing. Help is available, and you don't have to go through this alone. Please consider reaching out to a crisis hotline immediately. You can call or text 988 in the US and Canada, or 111 in the UK. They are available 24/7, free, and confidential.";

serve(async (req) => {
  // This is needed to handle CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- 1. Get User Input and API Key ---
    const { query } = await req.json();
    // Get the Gemini API Key from your Supabase Project's Environment Variables
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not set in environment variables.');
    }
    
    if (!query) {
      throw new Error('No query provided.');
    }

    // --- 2. Perform Crisis Detection Check ---
    const lowerCaseQuery = query.toLowerCase();
    const isCrisis = crisisKeywords.some(keyword => lowerCaseQuery.includes(keyword));

    if (isCrisis) {
      // --- IMPORTANT: If a crisis is detected ---
      // 1. Log this event for human review (this is a critical step for your HITL process)
      //    In a real app, you would insert into a 'crisis_alerts' table.
      console.warn(`Crisis keyword detected for query: "${query}"`);

      // 2. Return the pre-defined safety response immediately.
      return new Response(JSON.stringify({ response: crisisResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // --- 3. If Safe, Call the Gemini API ---
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // This is a basic prompt. You should refine this to give the AI its persona.
    const prompt = `You are a caring and empathetic AI Wellness Companion. A user has shared the following with you. Respond in a supportive and helpful manner. User's message: "${query}"`;
    
    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const text = aiResponse.text();

    // --- 4. Return the AI's Response ---
    return new Response(JSON.stringify({ response: text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});