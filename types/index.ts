export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'counselor' | 'employer';
  organization_id: number | null;
  counselor_id: number | null;
  // Your original file might have more properties here, which are preserved.
}

export interface Organization {
  id: number;
  name: string;
  industry: string;
}

export interface GeneratedReport { 
  id: string;
  title: string;
  content: string;
  generated_at: string;
  user_id: string;
}

export interface CompanyAnalytics { 
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  userSatisfaction: number;
}

export interface UserInsights { 
  mood_average: number;
  sessions_completed: number;
  streak: number;
}

export interface CounselorDashboardStats { 
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  totalClients: number;
  averageRating: number;
  monthlyRevenue: number;
}

export interface RecentActivity { 
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user_id: string;
}

export interface ClientDetails { 
  id: string;
  name: string;
  email: string;
  last_session: string;
  total_sessions: number;
  risk_level: 'low' | 'medium' | 'high';
}

export interface WellnessResource { 
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  created_at: string;
}

export interface AIChat { 
  id: string;
  user_id: string;
  message: string;
  response: string;
  timestamp: string;
}

export type MessageSenderType = 'client' | 'counselor' | 'system';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: MessageSenderType;
  content: string;
  timestamp: string;
  risk_level?: 'low' | 'medium' | 'high';
}

export interface Conversation {
  id: string;
  client_id: string;
  counselor_id: string;
  last_message: string;
  timestamp: string;
unread: boolean;
  risk_level: 'low' | 'medium' | 'high';
  priority: 'normal' | 'high' | 'urgent';
}


// --- ADDED/UPDATED FOR THERAPY TAB FEATURE ---

// This now correctly includes the nested `profiles` object from your schema
export interface Counselor {
  id: number;
  profile_id: string;
  specialties: string[];
  profiles: UserProfile | null;
}

// This now correctly includes the nested `counselors` object
export interface Appointment {
  id: string;
  user_id: string;
  counselor_id: number;
  appointment_time: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  type: 'video' | 'phone' | 'chat';
  counselors: Counselor | null;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_score: number;
  notes: string | null;
  created_at: string;
}

export interface WellnessInsights {
  mood_average: number;
  sessions_completed: number;
  streak: number;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  key_themes: string[];
  mood_score_at_time: number | null;
  created_at: string;
}
