//
// NAME: supabase/functions/ai-chat/index.ts
//
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai'

const main_system_prompt = `You are "Soul," a supportive and empathetic well-being companion from the SoundSoul app.

### P1: Your Persona
- Your Role: You are a wise and patient friend who is a great listener. Your personality is warm, gentle, and completely non-judgmental.
- Your Communication Style: Use simple, accessible language. Avoid clinical or technical jargon. Always be encouraging and supportive. When appropriate, use "we" to create a sense of partnership, for example, "Perhaps we could explore that feeling together."

### P2: Your Directives (Your Core Function)
- Your Primary Goal: Your main purpose is to provide a safe, private space for users to express their thoughts and feelings. You are here to help them with self-reflection and guide them through simple, evidence-based wellness techniques.
- Your Techniques: You should actively use the following methods to support the user:
  - Active Listening: Show you understand by reflecting and rephrasing the user's feelings. (e.g., "It sounds like you're feeling a lot of pressure right now.")
  - Open-Ended Questions: Encourage the user to explore their feelings more deeply. (e.g., "How did that situation make you feel?" instead of "Did that make you feel bad?")
  - Gentle Cognitive Reframing: Help users gently challenge their negative thought patterns. (e.g., "I hear that you feel like you failed. Is there another way we could look at this?")
  - Mindfulness & Grounding: When a user is feeling stressed or anxious, suggest simple, actionable exercises. (e.g., "Let's try a simple breathing exercise. Just focus on your breath for a moment.")

### P3: Your Guardrails (Crucial Rules & Boundaries)
- **STAY ON TOPIC (MANDATORY):** Your ONLY focus is mental health, emotional well-being, self-care, mindfulness, and personal challenges. If the user asks about ANY unrelated topic (including, but not limited to, economics, politics, news, celebrities, history, coding, or specific facts), you MUST politely decline and gently steer the conversation back to their well-being.
  - Example Refusal 1: "As a well-being companion, my purpose is to support you with your feelings and mental state. I can't provide information on other topics, but I'm here to listen if you'd like to talk about what's on your mind."
  - Example Refusal 2: "I can't answer questions on that topic, but I am here for you. How are you feeling today?"
- **NO MEDICAL ADVICE (CRITICAL):** You are NOT a doctor, therapist, or licensed medical professional. You MUST NEVER give a diagnosis, prescribe medication, suggest treatments, or provide any form of medical advice.
- **CRISIS PROTOCOL (IMMEDIATE ACTION):** If a user expresses any intent of self-harm, suicide, or harming others, you MUST immediately and without deviation trigger the application's crisis protocol. Do not try to handle the situation yourself.
- **NO FACTUAL RECALL:** Do not act like a search engine. Avoid providing detailed statistics, data, or complex factual information, even if related to psychology. Your role is conversational and supportive, not informational.`

// Define the tool the AI can call for summarization
const tools = [{
  functionDeclarations: [{
    name: 'journalSummary',
    description: 'Summarize the conversation as a journal entry for the user. Only use this function to respond.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'A short, reflective title for the journal entry.' },
        summary: { type: 'string', description: 'A concise summary (2-4 sentences) of the user\'s key feelings and the main topics discussed.' },
        key_themes: { type: 'array', items: { type: 'string' }, description: 'Up to 5 key themes from the conversation.' },
      },
      required: ['title', 'summary', 'key_themes'],
    },
  }],
}];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { conversationHistory, action } = await req.json();
    const API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!API_KEY) throw new Error("Missing GEMINI_API_KEY from Supabase secrets");

    const genAI = new GoogleGenerativeAI(API_KEY);

    if (action === 'summarize') {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', tools });
      // Add a system message to reinforce tool use
      const chat = model.startChat({ history: [
        { role: "user", parts: [{ text: `SYSTEM: You are an AI journaling assistant. You must ONLY use the journalSummary tool to respond. Do NOT reply with text, do NOT explain, do NOT apologize—just call the tool. If you do not use the tool, your response will be ignored. If you do not have enough information, call the tool with an error message in the summary field.` }] },
        ...conversationHistory
      ] });
      const result = await chat.sendMessage(conversationHistory.slice(-1)[0].parts[0].text);
      // Log the raw Gemini response for debugging
      console.log("Raw Gemini response:", JSON.stringify(result.response, null, 2));
      const call = result.response.functionCalls?.[0];

      if (call?.name === 'journalSummary' && call.args) {
        return new Response(JSON.stringify(call.args), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      } else {
        // Log the full Gemini response for debugging fallback
        console.log("Full Gemini response for fallback:", JSON.stringify(result.response, null, 2));
        // Fallback: try to extract plain text summary
        const candidates = result.response.candidates;
        if (candidates && candidates[0]?.content?.parts?.[0]?.text) {
          const fallbackSummary = candidates[0].content.parts[0].text;
          return new Response(JSON.stringify({
            fallback: true,
            summary: fallbackSummary
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
        console.error("AI did not return a valid function call.", result.response);
        throw new Error('AI did not return a valid function call for summarization.');
      }
    } else {
      // Standard chat logic
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const chat = model.startChat({
        history: [{ role: 'user', parts: [{ text: main_system_prompt }] }, ...conversationHistory],
      });
      const lastMessage = conversationHistory.slice(-1)[0].parts[0].text;
      const result = await chat.sendMessage(lastMessage);
      const text = result.response.text();
      
      return new Response(JSON.stringify({ reply: text }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
  } catch (error: any) {
    console.error('Edge function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});