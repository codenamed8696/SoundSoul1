export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'counselor' | 'employer';
  organization_id: number | null;
  counselor_id: number | null;
}

export interface Organization { /* ... */ }
export interface Appointment { /* ... */ }
export interface GeneratedReport { /* ... */ }
export interface CompanyAnalytics { /* ... */ }
export interface UserInsights { /* ... */ }
export interface CounselorDashboardStats { /* ... */ }
export interface RecentActivity { /* ... */ }
export interface ClientDetails { /* ... */ }

// --- NEWLY ADDED ---
export type MessageSenderType = 'client' | 'counselor' | 'system';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string; // Can be client's user_id or counselor's user_id
  sender_type: MessageSenderType;
  content: string;
  timestamp: string;
  risk_level?: 'low' | 'medium' | 'high';
}

export interface Conversation {
  id: string;
  client_id: string; // The anonymous client ID
  counselor_id: string;
  last_message: string;
  timestamp: string;
  unread: boolean;
  risk_level: 'low' | 'medium' | 'high';
  priority: 'normal' | 'high' | 'urgent';
}