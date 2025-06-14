import { createClient } from '@supabase/supabase-js';
import { MoodEntry, WellnessInsights } from '@/types';

// These environment variables are required for server-side operations
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Supabase URL or Service Key is missing in environment variables.");
}

// Create a special server-side Supabase client using the service_role key
const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);

/**
 * Validates a JWT from a request header against Supabase.
 * @param token The JWT token string.
 * @returns The user object if the token is valid, otherwise null.
 */
export const validateSession = async (token: string) => {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error) {
    console.error('Token validation error:', error.message);
    return null;
  }
  return user;
};

/**
 * Calculates wellness insights for a given user by fetching their mood data.
 * @param userId The UUID of the user.
 * @returns An object containing wellness insights.
 */
export const calculateUserInsights = async (userId: string): Promise<WellnessInsights | null> => {
  try {
    const { data: recent_entries, error } = await supabaseAdmin
      .from('mood_entries')
      .select('mood_score, created_at, notes')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw new Error('Could not fetch mood data.');

    if (!recent_entries || recent_entries.length === 0) {
      return {
        mood_trend: 'stable',
        average_mood: 0,
        recent_entries: [],
        streakDays: 0,
        recommendations: ['Track your mood for a few days to unlock personalized insights.'],
      };
    }

    const totalScore = recent_entries.reduce((sum, entry) => sum + entry.mood_score, 0);
    const average_mood = parseFloat((totalScore / recent_entries.length).toFixed(1));
    
    // --- Trend Calculation ---
    let mood_trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recent_entries.length > 1) {
        const firstHalf = recent_entries.slice(Math.ceil(recent_entries.length / 2));
        const secondHalf = recent_entries.slice(0, Math.floor(recent_entries.length / 2));
        const firstHalfAvg = firstHalf.reduce((s, e) => s + e.mood_score, 0) / firstHalf.length || 0;
        const secondHalfAvg = secondHalf.reduce((s, e) => s + e.mood_score, 0) / secondHalf.length || 0;
        if (secondHalfAvg > firstHalfAvg) mood_trend = 'improving';
        if (secondHalfAvg < firstHalfAvg) mood_trend = 'declining';
    }

    // --- Streak Calculation ---
    let streakDays = 0;
    if (recent_entries.length > 0) {
      const uniqueDays = new Set(recent_entries.map(e => new Date(e.created_at).toDateString()));
      streakDays = uniqueDays.size; // Simplified streak, can be improved
    }
    
    // --- Recommendations ---
    const recommendations = [];
    if (average_mood < 3) recommendations.push('Consider a guided meditation for anxiety.');
    if (mood_trend === 'declining') recommendations.push('Try a journaling exercise to reflect on your feelings.');
    if (average_mood >= 4) recommendations.push('Great job maintaining a positive outlook! Keep it up.');
    if (recommendations.length === 0) recommendations.push("You're doing great, keep focusing on your wellbeing.");


    const insights: WellnessInsights = {
      mood_trend,
      average_mood,
      recent_entries: recent_entries as MoodEntry[],
      streakDays,
      recommendations,
    };
    
    return insights;

  } catch (err) {
    console.error("Error in calculateUserInsights:", err);
    return null;
  }
};