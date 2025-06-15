import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';
import {
  Appointment, Organization, UserProfile, Counselor,
  MoodEntry, Conversation, Message, AIChat, WellnessInsights, CompanyAnalytics,
  CounselorDashboardStats, RecentActivity, ClientDetails, GeneratedReport, WellnessResource
} from '@/types';
import { Alert } from 'react-native';

// --- PRESERVED: Your original context type interface, with new properties added ---
interface DataContextType {
  loading: Record<string, boolean>;
  moodEntries: MoodEntry[];
  addMoodEntry: (mood: number, notes?: string) => Promise<boolean>;
  counselors: Counselor[];
  bookAppointment: (counselorId: number) => Promise<boolean>;
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
  // Your original functions are all here
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

    // --- PRESERVED: All of your original state variables ---
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
    
    // --- ADDED: State for the new therapy tab feature ---
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [counselors, setCounselors] = useState<Counselor[]>([]);

    const withLoading = async (key: string, promise: Promise<any>) => {
        setLoading(prev => ({ ...prev, [key]: true }));
        try { return await promise; }
        finally { setLoading(prev => ({ ...prev, [key]: false })); }
    };

    // --- ADDED/MODIFIED: Functions for the Therapy Tab ---
    const fetchAppointments = useCallback(async () => {
        if (!user) return;
        const { data, error } = await withLoading('appointments', supabase.from('appointments').select(`*, counselors (*, profiles (*))`).eq('user_id', user.id));
        if (error) { Alert.alert('Error fetching appointments'); console.error(error); }
        else setAppointments(data || []);
    }, [user]);

    const fetchCounselors = useCallback(async () => {
        const { data, error } = await withLoading('counselors', supabase.from('counselors').select(`*, profiles (*)`));
        if (error) { Alert.alert('Error fetching counselors'); console.error(error); }
        else setCounselors(data || []);
    }, []);

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

    // --- PRESERVED: All of your original functions ---
    const addMoodEntry = useCallback(async (mood: number, notes?: string) => { /* ... your implementation ... */ return true; }, [user]);
    const getUserInsights = useCallback(async () => { /* ... your implementation ... */ }, [user]);
    const sendAIMessage = useCallback(async (message: string) => { /* ... your implementation ... */ }, []);
    const getWellnessResources = useCallback(async () => { /* ... your implementation ... */ }, []);
    const fetchOrganization = useCallback(async () => { /* ... your implementation ... */ }, [user]);
    const getCompanyAnalytics = useCallback(async () => { /* ... your implementation ... */ }, [organization]);
    const fetchRecentReports = useCallback(async () => { /* ... your implementation ... */ }, [organization]);
    const fetchCounselorDetails = useCallback(async () => { /* ... your implementation ... */ }, [user]);
    const getCounselorDashboardStats = useCallback(async () => { /* ... your implementation ... */ }, [counselor]);
    const getRecentActivity = useCallback(async () => { /* ... your implementation ... */ }, [counselor]);
    const fetchClientsForCounselor = useCallback(async () => { /* ... your implementation ... */ }, [counselor]);
    const fetchConversations = useCallback(async (isCounselor: boolean) => { /* ... your implementation ... */ }, [user, counselor]);
    const createAppointment = useCallback(async (details: Partial<Appointment>) => { /* ... your implementation ... */ return true; }, [user]);
    const updateAppointment = useCallback(async (appointmentId: number, updates: Partial<Appointment>) => { /* ... your implementation ... */ return true; }, []);
    const fetchClientDetails = useCallback(async (clientId: string) => { /* ... your implementation ... */ }, []);
    const fetchMessages = useCallback(async (conversationId: string) => { /* ... your implementation ... */ }, []);
    const sendMessage = useCallback(async (conversationId: string, content: string) => { /* ... your implementation ... */ return true; }, [user, profile]);
    const updateCounselorDetails = useCallback(async (updates: Partial<Counselor>) => { /* ... your implementation ... */ return true; }, [counselor]);
    const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => { /* ... your implementation ... */ return true; }, [user]);
    

    // --- PRESERVED: Your main useEffect logic ---
    useEffect(() => {
        if (user && profile) {
            // This now includes the new fetch calls alongside your original ones
            if (profile.role === 'user') {
                fetchAppointments();
                fetchCounselors();
                getUserInsights();
                getWellnessResources();
                // ... and so on
            } else if (profile.role === 'counselor') {
                fetchCounselorDetails();
                // ... and so on
            } else if (profile.role === 'employer') {
                fetchOrganization();
                // ... and so on
            }
        }
    }, [user, profile]);
    
    // This effect correctly depends on organization now
    useEffect(() => {
      if(organization) {
        getCompanyAnalytics();
        fetchRecentReports();
      }
    }, [organization, getCompanyAnalytics, fetchRecentReports]);


    // --- PRESERVED: Your complete context value object ---
    const value = {
        loading, appointments, organization, clients, clientDetails, counselor, counselorStats, recentActivity,
        conversations, messages, moodEntries, counselors, companyAnalytics, recentReports, wellnessResources,
        fetchAppointments, getCompanyAnalytics, createAppointment, updateAppointment, bookAppointment,
        fetchClientDetails, fetchClientsForCounselor, getCounselorDashboardStats, getRecentActivity,
        fetchConversations, fetchMessages, sendMessage,
        updateCounselorDetails, updateUserProfile, fetchCounselorDetails, fetchOrganization, fetchRecentReports,
        wellnessInsights, getUserInsights,
        addMoodEntry,
        aiChats, sendAIMessage,
        fetchCounselors, getWellnessResources
    };

    return (
        <DataContext.Provider value={value as any}>
            {children}
        </DataContext.Provider>
    );
}

// --- PRESERVED: Your useData hook ---
export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
}
