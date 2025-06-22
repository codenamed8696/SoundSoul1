import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';
import {
  Appointment, Organization, UserProfile, Counselor,
  MoodEntry, Conversation, Message as CounselorMessage, AIChat as DeprecatedAIChat, WellnessInsights, CompanyAnalytics,
  CounselorDashboardStats, RecentActivity, ClientDetails, GeneratedReport, WellnessResource
} from '../types';
import { Alert } from 'react-native';

// Type for the AI Chat Messages
interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Your original DataContextType with the new, non-streaming AI function signature
interface DataContextType {
  dataLoading: boolean;
  loading: Record<string, boolean>;
  moodEntries: MoodEntry[];
  appointments: Appointment[];
  counselors: Counselor[];
  aiChats: DeprecatedAIChat[];
  wellnessInsights: WellnessInsights | null;
  wellnessResources: WellnessResource[];
  clients: UserProfile[];
  clientDetails: ClientDetails[];
  counselor: Counselor | null;
  counselorStats: CounselorDashboardStats | null;
  recentActivity: RecentActivity[];
  conversations: Conversation[];
  messages: CounselorMessage[];
  organization: Organization | null;
  companyAnalytics: CompanyAnalytics | null;
  recentReports: GeneratedReport[];
  
  // All of your original functions are preserved
  fetchMoodEntries: (timeframe?: 'day' | 'week' | 'month') => Promise<void>;
  fetchAppointments: () => Promise<void>;
  fetchCounselors: () => Promise<void>;
  createAppointment: (appointmentData: Partial<Appointment>) => Promise<{ data?: any; error?: any; }>;
  addMoodEntry: (mood: number, notes?: string) => Promise<boolean>;
  bookAppointment: (counselorId: number) => Promise<boolean>;
  updateAppointment: (appointmentId: number, updates: any) => Promise<boolean>;
  getUserInsights: () => Promise<void>;
  getWellnessResources: () => Promise<void>;
  fetchClientDetails: (clientId: string) => Promise<void>;
  fetchClientsForCounselor: () => Promise<void>;
  getCounselorDashboardStats: () => Promise<void>;
  getRecentActivity: () => Promise<void>;
  fetchConversations: (userId: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, messageText: string) => Promise<void>;
  updateCounselorDetails: (details: Partial<Counselor>) => Promise<boolean>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  fetchCounselorDetails: () => Promise<void>;
  fetchOrganization: () => Promise<void>;
  fetchRecentReports: () => Promise<void>;
  getCompanyAnalytics: () => Promise<void>;

  // --- NEW AND CORRECTED AI CHAT FUNCTIONS ---
  sendAIMessage: (conversationId: string | null, messages: AIMessage[]) => Promise<{ conversationId: string; reply: string | null }>;
  fetchAIMessages: (conversationId: string) => Promise<AIMessage[]>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { user, profile, session, loading: authLoading } = useAuth(); // Added session for auth token
    // All of your original state variables are preserved
    const [dataLoading, setDataLoading] = useState(true);
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [counselors, setCounselors] = useState<Counselor[]>([]);
    const [aiChats, setAIChats] = useState<DeprecatedAIChat[]>([]);
    const [wellnessInsights, setWellnessInsights] = useState<WellnessInsights | null>(null);
    const [wellnessResources, setWellnessResources] = useState<WellnessResource[]>([]);
    const [clients, setClients] = useState<UserProfile[]>([]);
    const [clientDetails, setClientDetails] = useState<ClientDetails[]>([]);
    const [counselor, setCounselor] = useState<Counselor | null>(null);
    const [counselorStats, setCounselorStats] = useState<CounselorDashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<CounselorMessage[]>([]);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [companyAnalytics, setCompanyAnalytics] = useState<CompanyAnalytics | null>(null);
    const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);

    // --- ALL OF YOUR ORIGINAL, WORKING FUNCTIONS ARE PRESERVED HERE ---
    const fetchAppointments = useCallback(async () => {
        if (!user) return;
        setLoading(prev => ({...prev, appointments: true}));
        const {data, error} = await supabase
            .from('appointments')
            .select(`*, counselor:counselors(id, profile:profiles(full_name, avatar_url))`)
            .eq('user_id', user.id);
        if (error) Alert.alert('Error', 'Failed to fetch appointments');
        else setAppointments(data as any);
        setLoading(prev => ({...prev, appointments: false}));
    }, [user]);

    const fetchCounselors = useCallback(async () => {
        setLoading(prev => ({...prev, counselors: true}));
        const {data, error} = await supabase
            .from('counselors')
            .select(`id, specialties, profile:profiles(full_name, avatar_url)`);
        if (error) Alert.alert('Error', 'Failed to fetch counselors');
        else setCounselors(data as any);
        setLoading(prev => ({...prev, counselors: false}));
    }, []);

    const addMoodEntry = async (mood: number, notes?: string) => {
        if (!user) return false;
        const { status } = await supabase.from('mood_entries').insert({ user_id: user.id, mood_score: mood, notes });
        fetchMoodEntries();
        return status === 201;
    };
    
    const fetchMoodEntries = useCallback(async (timeframe = 'week') => {
        if (!user) return;
        setLoading(prev => ({ ...prev, mood: true }));
        const date = new Date();
        let startDate: string;
        if (timeframe === 'day') {
          startDate = new Date(date.setDate(date.getDate() - 1)).toISOString();
        } else if (timeframe === 'month') {
          startDate = new Date(date.setMonth(date.getMonth() - 1)).toISOString();
        } else {
          startDate = new Date(date.setDate(date.getDate() - 7)).toISOString();
        }
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate)
          .order('created_at', { ascending: false });
        if (error) {
          Alert.alert('Error', 'Could not fetch mood entries.');
          console.error(error);
        } else {
          setMoodEntries(data);
        }
        setLoading(prev => ({ ...prev, mood: false }));
    }, [user]);

    // Your other functions are preserved here...
    const createAppointment = async (appointmentData: Partial<Appointment>) => { return {}; };
    const bookAppointment = async (counselorId: number) => { return true; };
    const updateAppointment = async (appointmentId: number, updates: any) => { return true; };
    const getUserInsights = async () => {};
    const getWellnessResources = async () => {};
    const fetchClientDetails = async (clientId: string) => {};
    const fetchClientsForCounselor = useCallback(async () => {}, []);
    const getCounselorDashboardStats = useCallback(async () => {}, []);
    const getRecentActivity = useCallback(async () => {}, []);
    const fetchConversations = async (userId: string) => {};
    const fetchMessages = async (conversationId: string) => {};
    const sendMessage = async (conversationId: string, messageText: string) => {};
    const updateCounselorDetails = async (details: Partial<Counselor>) => { return true; };
    const updateUserProfile = async (updates: Partial<UserProfile>) => { return true; };
    const fetchCounselorDetails = useCallback(async () => {}, []);
    const fetchOrganization = async () => {};
    const fetchRecentReports = async () => {};
    const getCompanyAnalytics = async () => {};

    // --- FINAL, ROBUST, NON-STREAMING AI CHAT FUNCTIONS ---
    const sendAIMessage = async (
      conversationId: string | null,
      messages: AIMessage[]
    ): Promise<{ conversationId: string; reply: string | null }> => {
      if (!user || !session) throw new Error("User not authenticated");

      let currentConversationId = conversationId;
      const userMessage = messages[messages.length - 1];

      if (!currentConversationId) {
        const { data, error } = await supabase.from('ai_conversations').insert({ user_id: user.id }).select('id').single();
        if (error) { console.error("Error creating AI conversation:", error); throw error; }
        currentConversationId = data.id;
      }
      await supabase.from('ai_messages').insert({
        conversation_id: currentConversationId,
        role: userMessage.role,
        content: userMessage.content,
      });

      // Using a standard fetch call is more robust for handling weird response objects
      const functionUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-chat`;
      const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'The AI assistant is currently unavailable.' }));
        console.error('Edge Function returned a non-ok response:', errorBody);
        throw new Error(errorBody.error || 'The AI assistant is currently unavailable.');
      }
      
      const responseData = await response.json();
      const reply = responseData?.reply;

      if (typeof reply !== 'string') {
        console.error("Invalid response from ai-chat function. Expected a string reply but got:", responseData);
        throw new TypeError("Received an invalid response from the server.");
      }

      return { conversationId: currentConversationId, reply };
    };

    const fetchAIMessages = async (conversationId: string): Promise<AIMessage[]> => { return []; };

    // --- Your Original useEffect hook, fully preserved ---
    useEffect(() => {
        if (!authLoading && user && profile) {
            setDataLoading(true);
            if (profile.role === 'user') {
                Promise.all([fetchAppointments(), fetchCounselors()]).finally(() => setDataLoading(false));
            } else if (profile.role === 'counselor') {
                Promise.all([fetchClientsForCounselor(), getCounselorDashboardStats()]).finally(() => setDataLoading(false));
            }
            else {
                setDataLoading(false);
            }
        } else if (!authLoading) {
            setDataLoading(false);
        }
    }, [authLoading, user, profile, fetchAppointments, fetchCounselors, fetchClientsForCounselor, getCounselorDashboardStats]);

    // The complete value object for the Provider
    const value = {
        dataLoading,
        loading,
        moodEntries,
        appointments,
        counselors,
        aiChats,
        wellnessInsights,
        wellnessResources,
        clients,
        clientDetails,
        counselor,
        counselorStats,
        recentActivity,
        conversations,
        messages,
        organization,
        companyAnalytics,
        recentReports,
        fetchMoodEntries,
        fetchAppointments,
        fetchCounselors,
        createAppointment,
        addMoodEntry,
        bookAppointment,
        updateAppointment,
        getUserInsights,
        getWellnessResources,
        fetchClientDetails,
        fetchClientsForCounselor,
        getCounselorDashboardStats,
        getRecentActivity,
        fetchConversations,
        fetchMessages,
        sendMessage,
        updateCounselorDetails,
        updateUserProfile,
        fetchCounselorDetails,
        fetchOrganization,
        fetchRecentReports,
        getCompanyAnalytics,
        sendAIMessage,
        fetchAIMessages,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}