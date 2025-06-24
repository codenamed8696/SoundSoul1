//
// NAME: context/DataContext.tsx
//
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';
import {
  Appointment, Organization, UserProfile, Counselor,
  MoodEntry, Conversation, Message as CounselorMessage, AIChat as DeprecatedAIChat, WellnessInsights, CompanyAnalytics,
  CounselorDashboardStats, RecentActivity, ClientDetails, GeneratedReport, WellnessResource
} from '../types';

// Define the shape of the data and functions the context will provide
interface DataContextType {
  dataLoading: boolean;
  loading: Record<string, boolean>;
  appointments: Appointment[];
  counselors: Counselor[];
  clients: UserProfile[];
  moodEntries: MoodEntry[];
  wellnessInsights: WellnessInsights | null;
  wellnessResources: WellnessResource[];
  organizations: Organization[];
  conversations: Conversation[];
  companyAnalytics: CompanyAnalytics | null;
  counselorDashboardStats: CounselorDashboardStats | null;
  recentActivity: RecentActivity[];
  clientDetails: ClientDetails[];
  generatedReports: GeneratedReport[];

  // All functions must be defined here
  bookAppointment: (counselorId: number, appointmentTime: Date) => Promise<boolean>;
  sendAIMessage: (currentMessages: any[]) => Promise<{ reply: string }>;
  fetchAppointments: () => Promise<void>;
  fetchCounselors: () => Promise<void>;
  fetchClientsForCounselor: (counselorId: string | undefined) => Promise<void>;
  getCounselorDashboardStats: (counselorId: string | undefined) => Promise<void>;
  getUserInsights: () => Promise<void>;
  fetchMoodEntries: () => Promise<void>;
  addMoodEntry: (moodScore: number, notes?: string) => Promise<boolean>;
  fetchWellnessResources: () => Promise<void>;
  fetchOrganizations: () => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchCompanyAnalytics: () => Promise<void>;
  fetchRecentActivity: () => Promise<void>;
  fetchClientDetails: () => Promise<void>;
  fetchGeneratedReports: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const { user, profile } = useAuth();
    const [dataLoading, setDataLoading] = useState(true);
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    
    // Initialize all array states to prevent '... of undefined' errors
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [counselors, setCounselors] = useState<Counselor[]>([]);
    const [clients, setClients] = useState<UserProfile[]>([]);
    const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
    const [wellnessInsights, setWellnessInsights] = useState<WellnessInsights | null>(null);
    const [wellnessResources, setWellnessResources] = useState<WellnessResource[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [companyAnalytics, setCompanyAnalytics] = useState<CompanyAnalytics | null>(null);
    const [counselorDashboardStats, setCounselorDashboardStats] = useState<CounselorDashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [clientDetails, setClientDetails] = useState<ClientDetails[]>([]);
    const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);

    // The stable, non-streaming AI Chat function
    const sendAIMessage = useCallback(async (currentMessages: any[]) => {
        setLoading(prev => ({ ...prev, aiChat: true }));
        try {
          const { data, error } = await supabase.functions.invoke('ai-chat', {
            body: { messages: currentMessages },
          });
    
          if (error) { throw error; }
          if (typeof data?.reply !== 'string') {
            throw new TypeError('Received an invalid response from the server.');
          }
          return { reply: data.reply };
    
        } catch (err) {
          console.error('Error in sendAIMessage:', err);
          throw err;
        } finally {
            setLoading(prev => ({ ...prev, aiChat: false }));
        }
    }, []); // Empty dependency array means this function is created only once

    // All data-fetching functions are wrapped in useCallback to stabilize them.
    // Their dependencies are primitive values from `user` and `profile`.
    const fetchAppointments = useCallback(async () => {
        if (!user?.id || !profile?.id) return;
        setLoading(prev => ({...prev, appointments: true}));
        try {
            let query = supabase.from('appointments').select(`*, counselors(*, profiles(*))`);
            if (profile.role === 'user') {
                query = query.eq('user_id', user.id);
            } else if (profile.role === 'counselor') {
                // FIXED: First get the counselor's numeric ID from the counselors table
                const { data: counselorData } = await supabase
                    .from('counselors')
                    .select('id')
                    .eq('profile_id', profile.id)
                    .single();
                
                if (counselorData) {
                    // Now use the correct numeric ID to query appointments
                    query = query.eq('counselor_id', counselorData.id);
                }
            }
            const { data, error } = await query;
            if (error) throw error;
            setAppointments(data || []);
        } catch (error) {
            console.error("Error fetching appointments:", error);
            setAppointments([]);
        } finally {
            setLoading(prev => ({...prev, appointments: false}));
        }
    }, [user?.id, profile?.id, profile?.role]);

    const fetchCounselors = useCallback(async () => {
        setLoading(prev => ({...prev, counselors: true}));
        try {
            const { data, error } = await supabase
                .from('counselors')
                .select('*, profiles(*)');
            if (error) throw error;
            setCounselors(data || []);
        } catch (error) {
            console.error("Error fetching counselors:", error);
            setCounselors([]);
        } finally {
            setLoading(prev => ({...prev, counselors: false}));
        }
    }, []);

    const fetchClientsForCounselor = useCallback(async (counselorId: string | undefined) => {
        if (!counselorId) return;
        setLoading(prev => ({...prev, clients: true}));
        try {
            // Get the counselor's numeric ID first
            const { data: counselorData } = await supabase
                .from('counselors')
                .select('id')
                .eq('profile_id', counselorId)
                .single();
            
            if (counselorData) {
                // Get appointments for this counselor to find clients
                const { data: appointmentData } = await supabase
                    .from('appointments')
                    .select('user_id')
                    .eq('counselor_id', counselorData.id);
                
                if (appointmentData && appointmentData.length > 0) {
                    const userIds = [...new Set(appointmentData.map(apt => apt.user_id))];
                    const { data: clientData, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .in('id', userIds);
                    
                    if (error) throw error;
                    setClients(clientData || []);
                } else {
                    setClients([]);
                }
            }
        } catch (error) {
            console.error("Error fetching clients for counselor:", error);
            setClients([]);
        } finally {
            setLoading(prev => ({...prev, clients: false}));
        }
    }, []);

    const getCounselorDashboardStats = useCallback(async (counselorId: string | undefined) => {
        if (!counselorId) return;
        setLoading(prev => ({...prev, dashboardStats: true}));
        try {
            // Get the counselor's numeric ID first
            const { data: counselorData } = await supabase
                .from('counselors')
                .select('id')
                .eq('profile_id', counselorId)
                .single();
            
            if (counselorData) {
                // Get appointments count
                const { count: appointmentsCount } = await supabase
                    .from('appointments')
                    .select('*', { count: 'exact', head: true })
                    .eq('counselor_id', counselorData.id);
                
                // Get completed appointments count
                const { count: completedCount } = await supabase
                    .from('appointments')
                    .select('*', { count: 'exact', head: true })
                    .eq('counselor_id', counselorData.id)
                    .eq('status', 'completed');
                
                const stats: CounselorDashboardStats = {
                    totalAppointments: appointmentsCount || 0,
                    completedAppointments: completedCount || 0,
                    pendingAppointments: (appointmentsCount || 0) - (completedCount || 0),
                    totalClients: clients.length,
                    averageRating: 4.5, // Placeholder - implement actual rating logic
                    monthlyRevenue: 0 // Placeholder - implement actual revenue logic
                };
                
                setCounselorDashboardStats(stats);
            }
        } catch (error) {
            console.error("Error fetching counselor dashboard stats:", error);
            setCounselorDashboardStats(null);
        } finally {
            setLoading(prev => ({...prev, dashboardStats: false}));
        }
    }, [clients.length]);

    const bookAppointment = useCallback(async (counselorId: number, appointmentTime: Date) => {
        if (!user?.id) return false;
        try {
            const { error } = await supabase.from('appointments').insert({
                user_id: user.id,
                counselor_id: counselorId,
                appointment_time: appointmentTime.toISOString(),
                status: 'confirmed'
            });
            if (error) throw error;
            await fetchAppointments(); // This call is now safe because fetchAppointments is stable
            return true;
        } catch(e) {
            console.error("Error booking appointment", e);
            return false;
        }
    }, [user?.id, fetchAppointments]); // Stable dependency

    const getUserInsights = useCallback(async () => {
        if (!user?.id) return;
        setLoading(prev => ({...prev, insights: true}));
        try {
            // Get mood entries for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const { data: moodData } = await supabase
                .from('mood_entries')
                .select('*')
                .eq('user_id', user.id)
                .gte('created_at', thirtyDaysAgo.toISOString());
            
            // Get completed appointments count
            const { count: sessionsCount } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'completed');
            
            const averageMood = moodData && moodData.length > 0 
                ? moodData.reduce((sum, entry) => sum + entry.mood_score, 0) / moodData.length 
                : 0;
            
            const insights: WellnessInsights = {
                mood_average: Math.round(averageMood * 10) / 10,
                sessions_completed: sessionsCount || 0,
                streak: 0 // Placeholder - implement actual streak logic
            };
            
            setWellnessInsights(insights);
        } catch (error) {
            console.error("Error fetching user insights:", error);
            setWellnessInsights(null);
        } finally {
            setLoading(prev => ({...prev, insights: false}));
        }
    }, [user?.id]);

    const fetchMoodEntries = useCallback(async () => {
        if (!user?.id) return;
        setLoading(prev => ({...prev, moodEntries: true}));
        try {
            const { data, error } = await supabase
                .from('mood_entries')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setMoodEntries(data || []);
        } catch (error) {
            console.error("Error fetching mood entries:", error);
            setMoodEntries([]);
        } finally {
            setLoading(prev => ({...prev, moodEntries: false}));
        }
    }, [user?.id]);

    const addMoodEntry = useCallback(async (moodScore: number, notes?: string) => {
        if (!user?.id) return false;
        try {
            const { error } = await supabase.from('mood_entries').insert({
                user_id: user.id,
                mood_score: moodScore,
                notes: notes || null
            });
            if (error) throw error;
            await fetchMoodEntries(); // Refresh mood entries
            return true;
        } catch (error) {
            console.error("Error adding mood entry:", error);
            return false;
        }
    }, [user?.id, fetchMoodEntries]);

    const fetchWellnessResources = useCallback(async () => {
        setLoading(prev => ({...prev, wellnessResources: true}));
        try {
            const { data, error } = await supabase
                .from('wellness_resources')
                .select('*');
            if (error) throw error;
            setWellnessResources(data || []);
        } catch (error) {
            console.error("Error fetching wellness resources:", error);
            setWellnessResources([]);
        } finally {
            setLoading(prev => ({...prev, wellnessResources: false}));
        }
    }, []);

    const fetchOrganizations = useCallback(async () => {
        setLoading(prev => ({...prev, organizations: true}));
        try {
            const { data, error } = await supabase
                .from('organizations')
                .select('*');
            if (error) throw error;
            setOrganizations(data || []);
        } catch (error) {
            console.error("Error fetching organizations:", error);
            setOrganizations([]);
        } finally {
            setLoading(prev => ({...prev, organizations: false}));
        }
    }, []);

    const fetchConversations = useCallback(async () => {
        if (!user?.id) return;
        setLoading(prev => ({...prev, conversations: true}));
        try {
            // Use user_id instead of client_id
            const { data, error } = await supabase
                .from('conversations')
                .select('*')
                .or(`user_id.eq.${user.id},counselor_id.eq.${user.id}`);
            if (error) throw error;
            setConversations(data || []);
        } catch (error) {
            console.error("Error fetching conversations:", error);
            setConversations([]);
        } finally {
            setLoading(prev => ({...prev, conversations: false}));
        }
    }, [user?.id]);

    const fetchCompanyAnalytics = useCallback(async () => {
        setLoading(prev => ({...prev, companyAnalytics: true}));
        try {
            // Placeholder implementation - implement actual analytics logic
            const analytics: CompanyAnalytics = {
                totalUsers: 0,
                activeUsers: 0,
                totalSessions: 0,
                averageSessionDuration: 0,
                userSatisfaction: 0
            };
            setCompanyAnalytics(analytics);
        } catch (error) {
            console.error("Error fetching company analytics:", error);
            setCompanyAnalytics(null);
        } finally {
            setLoading(prev => ({...prev, companyAnalytics: false}));
        }
    }, []);

    const fetchRecentActivity = useCallback(async () => {
        if (!user?.id) return;
        setLoading(prev => ({...prev, recentActivity: true}));
        try {
            // Placeholder implementation - implement actual activity logic
            const activity: RecentActivity[] = [];
            setRecentActivity(activity);
        } catch (error) {
            console.error("Error fetching recent activity:", error);
            setRecentActivity([]);
        } finally {
            setLoading(prev => ({...prev, recentActivity: false}));
        }
    }, [user?.id]);

    const fetchClientDetails = useCallback(async () => {
        setLoading(prev => ({...prev, clientDetails: true}));
        try {
            // Placeholder implementation - implement actual client details logic
            const details: ClientDetails[] = [];
            setClientDetails(details);
        } catch (error) {
            console.error("Error fetching client details:", error);
            setClientDetails([]);
        } finally {
            setLoading(prev => ({...prev, clientDetails: false}));
        }
    }, []);

    const fetchGeneratedReports = useCallback(async () => {
        setLoading(prev => ({...prev, generatedReports: true}));
        try {
            // Placeholder implementation - implement actual reports logic
            const reports: GeneratedReport[] = [];
            setGeneratedReports(reports);
        } catch (error) {
            console.error("Error fetching generated reports:", error);
            setGeneratedReports([]);
        } finally {
            setLoading(prev => ({...prev, generatedReports: false}));
        }
    }, []);
    
    // **THE DEFINITIVE FIX FOR THE INFINITE LOOP**
    // This useEffect hook now has stable dependencies. It will only re-run if the
    // user's ID or profile's ID actually changes (i.e., on login/logout),
    // which is the correct and intended behavior.
    useEffect(() => {
        let isMounted = true;
        if (user && profile) {
            setDataLoading(true);
            (async () => {
                await Promise.all([
                    fetchAppointments(),
                    fetchCounselors(),
                    fetchMoodEntries(),
                    fetchWellnessResources(),
                    fetchOrganizations(),
                    fetchConversations(),
                    fetchCompanyAnalytics(),
                    fetchRecentActivity(),
                    fetchClientDetails(),
                    fetchGeneratedReports(),
                    profile.role === 'counselor' ? fetchClientsForCounselor(profile.id) : Promise.resolve(),
                    profile.role === 'counselor' ? getCounselorDashboardStats(profile.id) : Promise.resolve(),
                    getUserInsights()
                ]);
                if (isMounted) setDataLoading(false);
            })();
        }
        return () => { isMounted = false; };
    }, [user?.id, profile?.id, profile?.role]);

    const value = useMemo(() => ({
        dataLoading, 
        loading, 
        appointments, 
        counselors, 
        clients, 
        moodEntries,
        wellnessInsights,
        wellnessResources,
        organizations,
        conversations,
        companyAnalytics,
        counselorDashboardStats,
        recentActivity,
        clientDetails,
        generatedReports,
        bookAppointment, 
        sendAIMessage, 
        fetchAppointments, 
        fetchCounselors,
        fetchClientsForCounselor, 
        getCounselorDashboardStats, 
        getUserInsights,
        fetchMoodEntries,
        addMoodEntry,
        fetchWellnessResources,
        fetchOrganizations,
        fetchConversations,
        fetchCompanyAnalytics,
        fetchRecentActivity,
        fetchClientDetails,
        fetchGeneratedReports
    }), [
        dataLoading, 
        loading, 
        appointments, 
        counselors, 
        clients, 
        moodEntries,
        wellnessInsights,
        wellnessResources,
        organizations,
        conversations,
        companyAnalytics,
        counselorDashboardStats,
        recentActivity,
        clientDetails,
        generatedReports,
        bookAppointment, 
        sendAIMessage, 
        fetchAppointments, 
        fetchCounselors,
        fetchClientsForCounselor, 
        getCounselorDashboardStats, 
        getUserInsights,
        fetchMoodEntries,
        addMoodEntry,
        fetchWellnessResources,
        fetchOrganizations,
        fetchConversations,
        fetchCompanyAnalytics,
        fetchRecentActivity,
        fetchClientDetails,
        fetchGeneratedReports
    ]);

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}