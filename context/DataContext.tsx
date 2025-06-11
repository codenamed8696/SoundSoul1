import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';
import { CompanyAnalytics, Appointment, Organization, GeneratedReport } from '@/types';

interface DataContextType {
  loading: boolean; // Simplified to a single boolean
  appointments: Appointment[];
  companyAnalytics: CompanyAnalytics | null;
  organization: Organization | null;
  recentReports: GeneratedReport[];
  clients: any[];
  fetchAppointments: () => Promise<void>;
  getCompanyAnalytics: () => Promise<void>;
  fetchOrganization: () => Promise<void>;
  fetchRecentReports: () => Promise<void>;
  fetchClientsForCounselor: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  
  const [loading, setLoading] = useState(true); // Simplified to a single boolean
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [companyAnalytics, setCompanyAnalytics] = useState<CompanyAnalytics | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  const fetchAppointments = async () => { /* ... (implementation from previous steps) ... */ };
  const getCompanyAnalytics = async () => { /* ... (implementation from previous steps) ... */ };
  const fetchOrganization = async () => { /* ... (implementation from previous steps) ... */ };
  const fetchRecentReports = async () => { /* ... (implementation from previous steps) ... */ };
  const fetchClientsForCounselor = async () => { /* ... (implementation from previous steps) ... */ };

  useEffect(() => {
    const fetchAllData = async () => {
      // Set loading to true at the start of any data fetching process
      setLoading(true);
      try {
        if (user && profile) {
          const dataFetchPromises = [fetchAppointments()];
          if (profile.role === 'employer') {
            dataFetchPromises.push(getCompanyAnalytics(), fetchOrganization(), fetchRecentReports());
          } else if (profile.role === 'counselor') {
            dataFetchPromises.push(fetchClientsForCounselor());
          }
          await Promise.all(dataFetchPromises);
        }
      } catch (error) {
        console.error("A critical error occurred while fetching data:", error);
      } finally {
        // CRITICAL FIX: Always set loading to false after all attempts are finished.
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user, profile]);

  return (
    <DataContext.Provider value={{
      loading,
      appointments,
      companyAnalytics,
      organization,
      recentReports,
      clients,
      fetchAppointments,
      getCompanyAnalytics,
      fetchOrganization,
      fetchRecentReports,
      fetchClientsForCounselor,
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