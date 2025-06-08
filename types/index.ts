export interface User {
  id: string;
  email: string;
  anonymousId: string;
  isAnonymous: boolean;
  role: 'user' | 'employer' | 'counselor' | 'admin';
  name?: string;
  preferences?: UserPreferences;
  companyConnection?: {
    token: string;
    verified: boolean;
    benefits: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  notifications?: {
    email?: boolean;
    push?: boolean;
    moodReminders?: boolean;
    appointmentReminders?: boolean;
  };
  privacy?: {
    shareAnonymousData?: boolean;
    allowAnalytics?: boolean;
  };
  wellness?: {
    dailyMoodTracking?: boolean;
    weeklyReports?: boolean;
    preferredSessionType?: 'video' | 'audio' | 'chat';
  };
  theme?: 'light' | 'dark' | 'system';
  language?: string;
}

export interface MoodEntry {
  id: string;
  userId: string;
  mood: number; // 1-5 scale
  notes?: string;
  date: string;
  createdAt: string;
}

export interface WellnessResource {
  id: string;
  title: string;
  description: string;
  type: 'meditation' | 'breathing' | 'journal' | 'video' | 'article' | 'exercise';
  duration?: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  content?: {
    url?: string;
    instructions?: string[];
    steps?: string[];
  };
  tags: string[];
  imageUrl?: string;
  isPopular?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Counselor {
  id: string;
  name: string;
  specialties: string[];
  bio: string;
  rating: number;
  experience: number;
  pricePerSession: number;
  availability: {
    [key: string]: string[]; // day: time slots
  };
  image?: string;
  credentials: string[];
}

export interface Appointment {
  id: string;
  userId: string;
  counselorId: string;
  userAnonymousId: string;
  scheduledDate: string;
  duration: number;
  type: 'video' | 'audio' | 'chat';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'counselor' | 'ai';
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: string;
  isRead: boolean;
  isEncrypted: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  counselorId?: string;
  type: 'ai' | 'counselor';
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface AIChat {
  id: string;
  userId: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    riskLevel?: 'low' | 'medium' | 'high' | 'crisis';
  }[];
  context: {
    mood: number;
    recentTopics: string[];
    riskFactors: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface AnonymousUsageRecord {
  id: string;
  companyTokenId: string;
  serviceType: string;
  sessionDate: string;
  creditsUsed: number;
  value: number;
  metadata?: Record<string, any>;
}

export interface CompanyAnalytics {
  companyToken: string;
  totalUsers: number;
  activeSessions: number;
  moodTrends: {
    average: number;
    trend: 'up' | 'down' | 'stable';
    data: { date: string; value: number }[];
  };
  utilization: {
    aiChat: number;
    therapy: number;
    resources: number;
  };
  demographics: {
    ageGroups: { range: string; count: number }[];
    riskLevels: { level: string; percentage: number }[];
  };
}

export interface WellnessInsights {
  userId: string;
  moodAverage: number;
  moodTrend: 'improving' | 'declining' | 'stable';
  streakDays: number;
  totalSessions: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  nextAppointment?: {
    date: string;
    counselor: string;
  };
}