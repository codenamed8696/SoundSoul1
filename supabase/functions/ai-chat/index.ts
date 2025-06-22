import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai'
import { corsHeaders } from '../_shared/cors.ts'

const systemPrompt = `You are a friendly and supportive mental wellness assistant for an app called SoundSoul. You are not a licensed therapist. Your goal is to provide helpful, encouraging, and safe conversation. If a user expresses thoughts of self-harm, suicide, or crisis, you must immediately direct them to seek professional help and provide a helpline number. Do not give medical advice. Be empathetic and kind.`

serve(async (req) => {
  // This is required for web clients to call the function
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

    if (!GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY environment variable.")
    }
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid 'messages' payload.")
    }
    
    // The Gemini API expects roles 'user' and 'model'
    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    // Use a direct fetch call to the non-streaming endpoint
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemPrompt }]
        }
      })
    })

    if (!res.ok) {
      const errorBody = await res.json()
      throw new Error(errorBody.error.message || 'Failed to fetch response from Gemini API.')
    }

    const responseJson = await res.json()

    // **THE CRITICAL FIX IS HERE**:
    // We now correctly and safely extract the text from the complex response object.
    const text = responseJson?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that. Please try again."

    // Return the extracted text in a simple, predictable JSON object.
    return new Response(
      JSON.stringify({ reply: text }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('CRITICAL ERROR in ai-chat function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})