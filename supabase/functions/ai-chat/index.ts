import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

// This is the main handler for the Edge Function
serve(async (req) => {
  // This part is required for web clients to call the function
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    
    // The Gemini API requires a specific format. We'll transform our messages.
    // The history should not include the latest user message, which goes into "contents".
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const latestUserMessage = messages[messages.length - 1]?.content;

    // The body for the Gemini API call
    const requestBody = {
      contents: [
        ...history,
        {
          role: 'user',
          parts: [{ text: latestUserMessage }],
        }
      ],
      // This is the system instruction that defines the AI's personality
      systemInstruction: {
        role: 'model',
        parts: [{ text: `You are SoundSoul AI, a supportive and caring well-being companion. You are not a licensed therapist. Your goal is to offer general advice, provide a safe space for users to express their feelings, and suggest wellness techniques. If a user expresses signs of severe distress or crisis, you must gently guide them to seek professional help and provide a crisis hotline number. Do not give medical advice. Keep your responses concise, empathetic, and encouraging.` }]
      },
    };

    // We use the stream=true parameter to get real-time responses
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${GEMINI_API_KEY}`;
    
    // We use fetch to call the Gemini API
    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API error: ${res.statusText} - ${errorText}`);
    }

    // Return the streaming response directly to the app
    return new Response(res.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream; charset=utf-8',
      },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})