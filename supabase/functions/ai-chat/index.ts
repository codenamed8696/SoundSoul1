import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';

// --- Crisis Detection Keywords ---
const crisisKeywords = [
  'kill myself', 'suicide', 'end my life', 'want to die', 'no reason to live',
  'self-harm', 'cutting myself', 'hurt myself', 'overdose'
];

// --- Pre-defined Safety Response ---
const crisisResponse = "I'm very concerned by what you've shared. It's incredibly brave of you to talk about this, and I want you to know that your safety is the most important thing. Help is available, and you don't have to go through this alone. Please consider reaching out to a crisis hotline immediately. You can call or text 988 in the US and Canada, or 111 in the UK. They are available 24/7, free, and confidential.";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not set in environment variables.');
    }
    
    if (!query) {
      throw new Error('No query provided.');
    }

    const lowerCaseQuery = query.toLowerCase();
    const isCrisis = crisisKeywords.some(keyword => lowerCaseQuery.includes(keyword));

    if (isCrisis) {
      console.warn(`Crisis keyword detected for query: "${query}"`);
      return new Response(JSON.stringify({ response: crisisResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // --- FIX: Use the new, more detailed prompt ---
    const prompt = `You are SoundSoul, a caring and empathetic AI Wellness Companion.
    Your primary purpose is to provide a safe and supportive space for users to express their feelings, explore their thoughts, and learn basic wellness techniques.
    Your tone should always be supportive, non-judgmental, and encouraging.

    **Your Boundaries:**
    - You are NOT a therapist, doctor, or financial advisor.
    - You MUST NOT provide medical advice, diagnoses, or treatment plans.
    - You MUST NOT provide financial, legal, or life-changing advice.
    - You MUST NOT write essays, code, or perform tasks outside the scope of wellness support.

    **Refusal Protocol:**
    If a user asks for something outside your scope, you MUST gently decline and steer the conversation back to wellness. Here are some examples of how to respond:
    - For tasks like writing an SOP: "As an AI Wellness Companion, my purpose is to support you with your feelings and well-being. I can't help with tasks like writing documents, but I am here to listen if you'd like to talk about anything on your mind."
    - For medical questions: "That's a really important question, but it falls outside my scope as an AI companion. For any medical concerns, it's always best to speak with a healthcare professional. I am here to support you emotionally."

    User's message: "${query}"`;
    
    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const text = aiResponse.text();

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