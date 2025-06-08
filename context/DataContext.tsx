import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabaseClient'; // Import the shared Supabase client
import {
  MoodEntry,
  Counselor,
  Appointment,
  WellnessResource,
  AIChat,
  CompanyAnalytics
} from '@/types';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';

// Define the shape of the data and functions provided by this context
interface DataContextType {
  counselors: Counselor[];
  appointments: Appointment[];
  loading: {
    counselors: boolean;
    appointments: boolean;
    booking: boolean;
  };
  bookAppointment: (counselorId: number, scheduledDate: string, type: 'video' | 'audio' | 'chat') => Promise<boolean>;
  fetchAppointments: () => Promise<void>;
  // Stubs for features not yet implemented on the backend
  moodEntries: MoodEntry[];
  wellnessResources: WellnessResource[];
  addMoodEntry: (mood: number, notes?: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const [loading, setLoading] = useState({
    counselors: true,
    appointments: true,
    booking: false,
  });

  // --- DATA FETCHING FUNCTIONS ---

  const fetchAppointments = async () => {
    if (!user) return;
    setLoading(prev => ({ ...prev, appointments: true }));
    try {
      let query = supabase.from('appointments').select(`*, counselors(*), profiles!appointments_user_id_fkey(*)`);

      // **FIX**: This now correctly filters based on the user's role and appropriate ID.
      if (user.role === 'counselor' && user.counselor_id) {
        // If the user is a counselor, filter by their numeric counselor_id.
        query = query.eq('counselor_id', user.counselor_id);
      } else if (user.role === 'user') {
        // If the user is a client, filter by their text-based user_id.
        query = query.eq('user_id', user.id);
      } else {
        // For any other role (like admin) or if data is missing, fetch all appointments.
        // You would tighten this security with Row Level Security in production.
      }
      
      const { data, error } = await query.order('scheduled_date', { ascending: true });
      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
       setLoading(prev => ({ ...prev, appointments: false }));
    }
  };

  const fetchCounselors = async () => {
    setLoading(prev => ({ ...prev, counselors: true }));
    try {
      const { data, error } = await supabase.from('counselors').select('*');
      if (error) throw error;
      setCounselors(data || []);
    } catch (error) {
      console.error('Error fetching counselors:', error);
    } finally {
      setLoading(prev => ({ ...prev, counselors: false }));
    }
  };
  
  // Effect to fetch initial data when the user logs in
  useEffect(() => {
    if (user && session) {
        fetchAppointments();
        fetchCounselors();
    }
  }, [user, session]);


  // --- DATA MUTATION FUNCTIONS ---

  const bookAppointment = async (counselorId: number, scheduledDate: string, type: 'video' | 'audio' | 'chat'): Promise<boolean> => {
    if (!user) return false;
    setLoading(prev => ({ ...prev, booking: true }));
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{ user_id: user.id, counselor_id: counselorId, scheduled_date: scheduledDate, type, status: 'confirmed' }])
        .select()
        .single();
      if (error) throw error;
      await fetchAppointments(); // Refetch all appointments to update the UI
      Alert.alert("Success", "Your session has been booked.");
      return true;
    } catch(error) {
      console.error("Error booking appointment:", error);
      Alert.alert("Booking Failed", "Could not book the appointment. Please try again.");
      return false;
    } finally {
      setLoading(prev => ({ ...prev, booking: false }));
    }
  };
  
  // Stub for a function not yet implemented
  const addMoodEntry = async () => { return true; };

  return (
    <DataContext.Provider value={{
      counselors,
      appointments,
      loading,
      bookAppointment,
      fetchAppointments,
      // Provide stub data/functions for unused properties to satisfy the type
      moodEntries: [],
      wellnessResources: [],
      addMoodEntry,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}