import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from 'npm:@google/generative-ai';

console.log(`Function "ai-chat" up and running!`)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query: messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('No message history provided.')
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in the function's secrets.");
    }
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Format the history for the Gemini API, taking all messages except the very last one (the new user prompt)
    let historyForGemini = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    //
    // THE FIX: Check if the history starts with a message from the model.
    // If it does, remove it to comply with the API's rules.
    //
    if (historyForGemini.length > 0 && historyForGemini[0].role === 'model') {
        historyForGemini.shift(); // Removes the first element from the array
    }

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({
        history: historyForGemini, // Use the corrected history
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ]
    });

    const result = await chat.sendMessage(lastMessage);
    const response = result.response;
    const reply = response.text();

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in ai-chat function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})