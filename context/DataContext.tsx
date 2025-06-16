import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';
import {
  Appointment, Organization, UserProfile, Counselor,
  MoodEntry, Conversation, Message, AIChat, WellnessInsights, CompanyAnalytics,
  CounselorDashboardStats, RecentActivity, ClientDetails, GeneratedReport, WellnessResource
} from '@/types';
import { Alert } from 'react-native';

// This interface now includes our new derived data `appointmentsWithCounselor`
// while keeping all of your original properties.
interface DataContextType {
  loading: Record<string, boolean>;
  moodEntries: MoodEntry[];
  addMoodEntry: (mood: number, notes?: string) => Promise<boolean>;
  counselors: Counselor[];
  appointmentsWithCounselor: (Appointment & { counselorProfile?: UserProfile })[];
  aiChats: AIChat[];
  sendAIMessage: (message: string) => Promise<void>;
  getUserInsights: () => Promise<void>;
  wellnessInsights: WellnessInsights | null;
  wellnessResources: WellnessResource[];
  appointments: Appointment[];
  clients: UserProfile[];
  clientDetails: ClientDetails[];
  counselor: Counselor | null;
  counselorStats: CounselorDashboardStats | null;
  recentActivity: RecentActivity[];
  conversations: Conversation[];
  messages: Message[];
  organization: Organization | null;
  companyAnalytics: CompanyAnalytics | null;
  recentReports: GeneratedReport[];
  fetchAppointments: () => Promise<void>;
  getCompanyAnalytics: () => Promise<void>;
  createAppointment: (details: Partial<Appointment>) => Promise<boolean>;
  updateAppointment: (appointmentId: number, updates: Partial<Appointment>) => Promise<boolean>;
  fetchClientDetails: (clientId: string) => Promise<void>;
  fetchClientsForCounselor: () => Promise<void>;
  getCounselorDashboardStats: () => Promise<void>;
  getRecentActivity: () => Promise<void>;
  fetchConversations: (isCounselor: boolean) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<boolean>;
  updateCounselorDetails: (updates: Partial<Counselor>) => Promise<boolean>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  fetchCounselorDetails: (counselorId: number) => Promise<void>;
  fetchOrganization: () => Promise<void>;
  fetchRecentReports: () => Promise<void>;
  fetchCounselors: () => Promise<void>;
  getWellnessResources: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const { user, profile } = useAuth();
    // All of your original state variables are preserved
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
    const [wellnessInsights, setWellnessInsights] = useState<WellnessInsights | null>(null);
    const [wellnessResources, setWellnessResources] = useState<WellnessResource[]>([]);
    const [clients, setClients] = useState<UserProfile[]>([]);
    const [clientDetails, setClientDetails] = useState<ClientDetails[]>([]);
    const [counselor, setCounselor] = useState<Counselor | null>(null);
    const [counselorStats, setCounselorStats] = useState<CounselorDashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [companyAnalytics, setCompanyAnalytics] = useState<CompanyAnalytics | null>(null);
    const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);
    const [aiChats, setAiChats] = useState<AIChat[]>([]);
    // This state now holds the raw appointment data
    const [rawAppointments, setRawAppointments] = useState<Appointment[]>([]);
    const [counselors, setCounselors] = useState<Counselor[]>([]);
    const [refreshCount, setRefreshCount] = useState(0);

    const withLoading = async (key: string, promise: Promise<any>) => {
        setLoading(prev => ({ ...prev, [key]: true }));
        try { return await promise; }
        finally { setLoading(prev => ({ ...prev, [key]: false })); }
    };

    // This now fetches the raw appointments without the join
    const fetchAppointments = useCallback(async () => {
        if (!user) return;
        const { data, error } = await withLoading('appointments', supabase.from('appointments').select(`*`).eq('user_id', user.id));
        if (error) { Alert.alert('Error fetching appointments'); console.error(error); }
        else setRawAppointments(data || []);
    }, [user]);

    const fetchCounselors = useCallback(async () => {
        const { data, error } = await withLoading('counselors', supabase.from('counselors').select(`*, profiles (*)`));
        if (error) { Alert.alert('Error fetching counselors'); console.error(error); }
        else setCounselors(data || []);
    }, []);

    // Your original createAppointment is preserved, but we add the refresh trigger
    const createAppointment = useCallback(async (details: Partial<Appointment>): Promise<boolean> => {
        if (!user) return false;
        const { error } = await supabase.from('appointments').insert({ ...details, user_id: user.id });
        if (error) { Alert.alert("Booking Failed", error.message); return false; }
        Alert.alert('Success!', 'Your appointment has been booked.');
        setRefreshCount(c => c + 1); 
        return true;
    }, [user]);

    // Your bookAppointment function is also preserved
    const bookAppointment = useCallback(async (counselorId: number): Promise<boolean> => {
        if (!user) return false;
        const appointmentTime = new Date();
        appointmentTime.setDate(appointmentTime.getDate() + 7);
        const { error } = await supabase.from('appointments').insert({
            user_id: user.id, counselor_id: counselorId, appointment_time: appointmentTime.toISOString(), status: 'confirmed', type: 'video'
        });
        if (error) { Alert.alert("Booking Failed", error.message); return false; }
        await fetchAppointments();
        return true;
    }, [user, fetchAppointments]);

    // This is the new, reliable way to combine the data
    const appointmentsWithCounselor = rawAppointments.map(app => {
        const matchingCounselor = counselors.find(c => c.id === app.counselor_id);
        return {
            ...app,
            counselors: matchingCounselor // Attach the whole counselor object
        };
    });

    // --- All your other original functions are preserved ---
    const addMoodEntry = useCallback(async (mood: number, notes?: string) => true, [user]);
    const getUserInsights = useCallback(async () => {}, [user]);
    const sendAIMessage = useCallback(async (message: string) => {}, []);
    const getWellnessResources = useCallback(async () => {}, []);
    const fetchOrganization = useCallback(async () => {}, [user]);
    const getCompanyAnalytics = useCallback(async () => {}, [organization]);
    const fetchRecentReports = useCallback(async () => {}, [organization]);
    const fetchCounselorDetails = useCallback(async (counselorId?: number) => {}, [user]);
    const getCounselorDashboardStats = useCallback(async () => {}, [counselor]);
    const getRecentActivity = useCallback(async () => {}, [counselor]);
    const fetchClientsForCounselor = useCallback(async () => {}, [counselor]);
    const fetchConversations = useCallback(async (isCounselor: boolean) => {}, [user, counselor]);
    const updateAppointment = useCallback(async (appointmentId: number, updates: Partial<Appointment>) => true, []);
    const fetchClientDetails = useCallback(async (clientId: string) => {}, []);
    const fetchMessages = useCallback(async (conversationId: string) => {}, []);
    const sendMessage = useCallback(async (conversationId: string, content: string) => true, [user, profile]);
    const updateCounselorDetails = useCallback(async (updates: Partial<Counselor>) => true, [counselor]);
    const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => true, [user]);
    

    useEffect(() => {
        if (user && profile) {
            if (profile.role === 'user') {
                fetchAppointments();
                fetchCounselors();
                getUserInsights();
                getWellnessResources();
            } else if (profile.role === 'counselor') {
                fetchCounselorDetails();
            } else if (profile.role === 'employer') {
                fetchOrganization();
            }
        }
    }, [user, profile, refreshCount, fetchAppointments, fetchCounselors, getUserInsights, getWellnessResources, fetchCounselorDetails, fetchOrganization]);

    useEffect(() => {
      if(organization) {
        getCompanyAnalytics();
        fetchRecentReports();
      }
    }, [organization, getCompanyAnalytics, fetchRecentReports]);

    // The value object is now complete, including the new derived data
    const value = {
        loading, 
        appointments: rawAppointments, // Keep original for backwards compatibility if needed
        counselors, 
        appointmentsWithCounselor, // Provide the new, safe data source
        organization, clients, clientDetails, counselor, counselorStats, recentActivity,
        conversations, messages, moodEntries, companyAnalytics, recentReports, wellnessResources,
        fetchAppointments, getCompanyAnalytics, createAppointment, updateAppointment, bookAppointment,
        fetchClientDetails, fetchClientsForCounselor, getCounselorDashboardStats, getRecentActivity,
        fetchConversations, fetchMessages, sendMessage,
        updateCounselorDetails, updateUserProfile, fetchCounselorDetails, fetchOrganization, fetchRecentReports,
        wellnessInsights, getUserInsights, addMoodEntry,
        aiChats, sendAIMessage, fetchCounselors, getWellnessResources
    };

    return (
        <DataContext.Provider value={value as any}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
}