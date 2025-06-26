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

const summarizer_system_prompt = `
  You are an expert summarization AI. Your ONLY task is to analyze the provided conversation history and generate a structured JSON object.
  You MUST respond with ONLY a valid JSON object containing a 'title' (string), a 'summary' (string), and 'key_themes' (an array of strings).
  DO NOT add any introductory text, conversation, or markdown formatting like ```json. Your entire output must be the raw JSON object itself.

  Example of your required output format:
  {
    "title": "A Reflective Title",
    "summary": "A concise summary of the conversation.",
    "key_themes": ["Theme 1", "Theme 2"]
  }
`;

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
  // 1. Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Edge Function invoked.");

    // 2. Extract request body
    const { history, action } = await req.json();
    console.log("Request received. Action:", action);
    console.log("Received history length:", history ? history.length : 'No history');

    if (!history || !action) {
      console.error("Missing history or action in the request body.");
      return new Response(JSON.stringify({ error: 'Missing history or action' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 3. Handle 'summarize' action
    if (action === 'summarize') {
        console.log("Executing 'summarize' action.");

        const userPrompt = `Please summarize the following conversation history into a JSON object as instructed:\n\n${JSON.stringify(history, null, 2)}`;

        const result = await model.generateContent([
            { role: 'user', parts: [{ text: summarizer_system_prompt }] },
            { role: 'model', parts: [{ text: "Okay, I am ready. Please provide the conversation history to be summarized into a JSON object." }] },
            { role: 'user', parts: [{ text: userPrompt }] }
        ]);

        const response = result.response;
        const summaryText = response.text();

        console.log("Received raw summary from Gemini:", summaryText);

        try {
            const parsedSummary = JSON.parse(summaryText);
            console.log("Successfully parsed summary JSON.");
            return new Response(JSON.stringify({ summary: parsedSummary }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        } catch (e) {
            console.error("Failed to parse summary text as JSON:", e);
            return new Response(JSON.stringify({ error: "AI returned invalid JSON", details: summaryText }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            });
        }
    }

    // 4. Handle 'chat' action (existing logic)
    if (action === 'chat') {
        console.log("Executing 'chat' action.");
        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: main_system_prompt }] },
                { role: 'model', parts: [{ text: "Okay, I am ready to help. What's on your mind?" }] },
                ...history
            ]
        });

        const lastMessage = history.pop();
        const result = await chat.sendMessage(lastMessage.parts[0].text);
        const response = result.response;
        const text = response.text();

        console.log("Received chat response from Gemini:", text);

        return new Response(JSON.stringify({ response: text }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    // 5. Handle unknown action
    console.error("Unknown action specified:", action);
    return new Response(JSON.stringify({ error: 'Unknown action' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
    });

  } catch (error) {
    // 6. Catch and log any unexpected errors
    console.error('Critical error in Edge Function:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});