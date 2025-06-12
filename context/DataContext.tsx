import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';
import { 
  Appointment, Organization, UserProfile, Counselor,
  MoodEntry, Conversation, Message, AIChat, WellnessInsights, CompanyAnalytics,
  CounselorDashboardStats, RecentActivity, ClientDetails, GeneratedReport
} from '@/types';

// Helper function to simulate network delay for mock data
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// This is the complete interface combining all features
interface DataContextType {
  loading: Record<string, boolean>;
  // User Features
  moodEntries: MoodEntry[];
  addMoodEntry: (mood: number, notes?: string) => void;
  counselors: Counselor[]; 
  bookAppointment: (counselorId: string, date: string) => Promise<string>;
  aiChats: AIChat[];
  sendAIMessage: (message: string) => Promise<void>;
  getUserInsights: () => WellnessInsights | null;
  
  // Counselor Features
  appointments: Appointment[];
  clients: UserProfile[];
  clientDetails: ClientDetails[];
  counselor: Counselor | null;
  counselorStats: CounselorDashboardStats | null;
  recentActivity: RecentActivity[];
  conversations: Conversation[];
  messages: Message[];
  createAppointment: (details: Partial<Appointment>) => Promise<boolean>;
  updateAppointment: (appointmentId: number, updates: Partial<Appointment>) => Promise<boolean>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<boolean>;
  updateCounselorDetails: (updates: Partial<Counselor>) => Promise<boolean>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;

  // Employer Features
  organization: Organization | null;
  companyAnalytics: CompanyAnalytics | null;
  recentReports: GeneratedReport[];

  // General Fetching
  fetchAppointments: () => Promise<void>;
  fetchCounselorDetails: () => Promise<void>;
  getCompanyAnalytics: () => Promise<void>;
  fetchClientsForCounselor: () => Promise<void>;
  fetchOrganization: () => Promise<void>;
  fetchRecentReports: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEMO_COUNSELORS: Counselor[] = [
  { id: 1, profile_id: 'uuid-1', name: 'Dr. Sarah Chen', specialties: ['Anxiety', 'Depression', 'CBT'], bio: 'Licensed clinical psychologist with 10+ years of experience.', rating: 4.9, experience: 10, image: 'url' },
  { id: 2, profile_id: 'uuid-2', name: 'Dr. Michael Rodriguez', specialties: ['Trauma', 'PTSD'], bio: 'Trauma specialist with expertise in EMDR.', rating: 4.8, experience: 8, image: 'url' }
];

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, profile, fetchProfile } = useAuth();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [clientDetails, setClientDetails] = useState<ClientDetails[]>([]);
  const [counselor, setCounselor] = useState<Counselor | null>(null);
  const [counselorStats, setCounselorStats] = useState<CounselorDashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [counselors] = useState<Counselor[]>(DEMO_COUNSELORS);
  const [aiChats, setAiChats] = useState<AIChat[]>([]);
  const [companyAnalytics, setCompanyAnalytics] = useState<CompanyAnalytics | null>(null);
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);

  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // --- REAL DATABASE FUNCTIONS ---

  const fetchAppointments = async () => { /* ... */ };
  const createAppointment = async (details: Partial<Appointment>): Promise<boolean> => { /* ... */ return true; };
  const updateAppointment = async (appointmentId: number, updates: Partial<Appointment>): Promise<boolean> => { /* ... */ return true; };
  const fetchCounselorDetails = async () => { /* ... */ };
  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<boolean> => { /* ... */ return true; };
  const updateCounselorDetails = async (updates: Partial<Counselor>): Promise<boolean> => { /* ... */ return true; };
  const fetchOrganization = async () => { /* ... */ };
  const fetchRecentReports = async () => { /* ... */ };
  
  // --- MOCK & ORIGINAL FUNCTIONS ---
  
  const addMoodEntry = (mood: number, notes?: string) => {
     const newEntry: MoodEntry = { id: `mood-${Date.now()}`, userId: user!.id, mood, notes, date: new Date().toISOString() };
     setMoodEntries(prev => [newEntry, ...prev]);
  };

  const bookAppointment = async (counselorId: string, date: string): Promise<string> => {
    const appointment: Appointment = { id: Math.random(), userId: user!.id, counselorId, scheduledDate: date, status: 'confirmed', type: 'video', duration: 60 };
    setAppointments(prev => [...prev, appointment]);
    return appointment.id.toString();
  };

  const sendAIMessage = async (message: string): Promise<void> => {
    const riskKeywords = { crisis: ['suicide', 'kill myself'], high: ['self-harm', 'cutting'], medium: ['depressed', 'anxious'] };
    let riskLevel: 'low' | 'medium' | 'high' | 'crisis' = 'low';
    const lowerMessage = message.toLowerCase();
    if (riskKeywords.crisis.some(keyword => lowerMessage.includes(keyword))) { riskLevel = 'crisis'; }
    else if (riskKeywords.high.some(keyword => lowerMessage.includes(keyword))) { riskLevel = 'high'; }
    else if (riskKeywords.medium.some(keyword => lowerMessage.includes(keyword))) { riskLevel = 'medium'; }
    
    let aiResponse = "Thank you for sharing. How can I help?";
    if (riskLevel === 'crisis') { aiResponse = "I'm very concerned. Please call 988 immediately. Your safety is most important."; }
    else if (riskLevel === 'high') { aiResponse = "It sounds like you're in a lot of pain. I strongly recommend connecting with a human counselor."; }
    
    setAiChats(prev => [{ id: 'main-chat', messages: [...(prev[0]?.messages || []), { role: 'user', content: message, timestamp: new Date().toISOString(), riskLevel }, { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }] }]);
  };

  const getUserInsights = (): WellnessInsights | null => {
    if (!user) return null;
    const avg = moodEntries.length > 0 ? moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length : 3;
    return { moodAverage: avg, moodTrend: 'stable', totalSessions: 5, riskLevel: 'low', recommendations: ['Practice mindfulness for 10 minutes.'] };
  };

  const getCompanyAnalytics = async () => { /* ... (mock implementation) ... */ };
  const getCounselorDashboardStats = async () => { /* ... (mock implementation) ... */ };
  const fetchClientDetails = async () => { /* ... (mock implementation) ... */ };
  const fetchConversations = async () => { /* ... (mock implementation) ... */ };
  const fetchMessages = async (id: string) => { /* ... (mock implementation) ... */ };
  const sendMessage = async (id: string, content: string) => { /* ... (mock implementation) ... */ return true; };
  const getRecentActivity = async () => { /* ... (mock implementation) ... */ };
  const fetchClientsForCounselor = async () => { /* ... (mock implementation) ... */ };

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'employer') {
        fetchOrganization();
        getCompanyAnalytics();
        fetchRecentReports();
      } else if (profile.role === 'counselor') {
        fetchAppointments();
        fetchCounselorDetails();
        getCounselorDashboardStats();
        getRecentActivity();
        fetchClientDetails();
        fetchClientsForCounselor();
        fetchConversations();
      } else if (profile.role === 'user') {
        fetchAppointments();
        // You would also fetch user-specific data here, like mood entries
      }
    }
  }, [user, profile]);

  return (
    <DataContext.Provider value={{
      loading, appointments, organization, clients, clientDetails, counselor, counselorStats, recentActivity,
      conversations, messages, moodEntries, counselors, aiChats, companyAnalytics, recentReports,
      fetchAppointments, getCompanyAnalytics, createAppointment, updateAppointment, bookAppointment,
      fetchClientDetails, fetchClientsForCounselor, getCounselorDashboardStats, getRecentActivity,
      fetchConversations, fetchMessages, sendMessage, addMoodEntry, sendAIMessage, getUserInsights,
      updateCounselorDetails, updateUserProfile, fetchCounselorDetails, fetchOrganization, fetchRecentReports
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
}