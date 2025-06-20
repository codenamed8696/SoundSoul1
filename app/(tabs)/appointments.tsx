import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Video, PlusCircle, Lock } from 'lucide-react-native';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Appointment } from '@/types';
import { CounselorCard } from '@/components/counselors/CounselorCard';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { supabase } from '@/context/supabaseClient'; // Import supabase client directly

// This component is now defined OUTSIDE the main component to prevent re-creation issues.
const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const counselorProfile = appointment.counselors?.profiles;
    if (!counselorProfile) {
        return <View style={styles.appointmentCard}><ActivityIndicator /></View>;
    }
    return (
      <View style={styles.appointmentCard}>
        <Text style={styles.appointmentDate}>{format(new Date(appointment.appointment_time), "EEEE, MMMM d, yyyy")}</Text>
        <View style={styles.timeInfo}>
          <Clock size={16} color="#6b7280" />
          <Text style={styles.timeText}>{format(new Date(appointment.appointment_time), "h:mm a")}</Text>
        </View>
        <View style={styles.counselorInfo}>
          <Image 
            source={{ uri: counselorProfile.avatar_url || `https://i.pravatar.cc/150?u=${counselorProfile.id}` }} 
            style={styles.counselorAvatar}
          />
          <Text style={styles.counselorName}>with {counselorProfile.full_name}</Text>
        </View>
        <Pressable style={styles.joinButton}>
          <Video size={16} color="#ffffff" />
          <Text style={styles.joinButtonText}>Join Video Call</Text>
        </Pressable>
      </View>
    );
};

const AnonymousPrompt = () => {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.promptContainer}>
            <Card style={styles.promptCard}>
                <View style={styles.promptIconContainer}>
                    <Lock size={32} color="#4f46e5" />
                </View>
                <Text style={styles.promptTitle}>Book & Manage Sessions</Text>
                <Text style={styles.promptText}>
                To schedule therapy sessions and view your appointment history, please create a free account or link an employer code. Your privacy is always our priority.
                </Text>
                <Button 
                    title="Create a Free Account" 
                    onPress={() => router.push('/(auth)/signup')}
                    style={{marginBottom: 16}} 
                />
                <Button 
                    title="Add Employer Code" 
                    onPress={() => router.push('/(tabs)/profile')}
                    variant="ghost"
                />
            </Card>
        </View>
      </SafeAreaView>
    );
};

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const { counselors, loading: dataContextLoading, fetchCounselors, bookAppointment } = useData();
  const [activeTab, setActiveTab] = useState<ActiveTab>('upcoming');
  
  // --- DEFINITIVE FIX: State is now managed locally within this screen ---
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);

  // This function now lives inside the component and is responsible for its own data.
  const getAppointments = useCallback(async () => {
    if (!user) return;
    setIsLoadingAppointments(true);
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select(`*, counselors (*, profiles (*))`)
            .eq('user_id', user.id)
            .order('appointment_time', { ascending: true });

        if (error) throw error;
        setLocalAppointments(data || []);
    } catch (error: any) {
        Alert.alert("Error", "Could not fetch your appointments.");
    } finally {
        setIsLoadingAppointments(false);
    }
  }, [user]);

  // This useEffect fetches data when the component loads or the user changes.
  useEffect(() => {
    if(user) {
        getAppointments();
        if (typeof fetchCounselors === 'function') {
          fetchCounselors();
        }
    }
  }, [user, getAppointments, fetchCounselors]);

  const renderUpcomingSessions = () => {
    if (isLoadingAppointments) {
      return <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#4f46e5" /></View>;
    }

    const upcomingAppointments = localAppointments
      .filter(a => a && new Date(a.appointment_time) >= new Date());

    if (upcomingAppointments.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Calendar size={48} color="#9ca3af" />
          <Text style={styles.emptyStateTitle}>No Upcoming Sessions</Text>
          <Text style={styles.emptyStateSubtitle}>Book a new session to see it here.</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={upcomingAppointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <AppointmentCard appointment={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderBookSession = () => {
    if (dataContextLoading['counselors']) {
        return <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#4f46e5" /></View>;
    }
    return (
      <FlatList
        data={counselors}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CounselorCard counselor={item} onBookingComplete={getAppointments} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };
  
  if (user?.is_anonymous) {
    return <AnonymousPrompt />;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Therapy Sessions</Text>
      </View>
      <View style={styles.tabContainer}>
        <TabButton title="Upcoming" icon={Calendar} isActive={activeTab === 'upcoming'} onPress={() => setActiveTab('upcoming')} />
        <TabButton title="Book Session" icon={PlusCircle} isActive={activeTab === 'book'} onPress={() => setActiveTab('book')} />
      </View>
      <View style={styles.content}>
        {activeTab === 'upcoming' ? renderUpcomingSessions() : renderBookSession()}
      </View>
    </SafeAreaView>
  );
}

const TabButton = ({ title, icon: Icon, isActive, onPress }: any) => (
  <Pressable style={[styles.tabButton, isActive && styles.activeTab]} onPress={onPress}>
    <Icon size={20} color={isActive ? '#4f46e5' : '#6b7280'} />
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f9fafb' },
    header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    headerTitle: { fontSize: 28, fontFamily: 'Inter-Bold', color: '#111827' },
    tabContainer: { flexDirection: 'row', marginHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 8 },
    activeTab: { borderBottomWidth: 3, borderBottomColor: '#4f46e5' },
    tabText: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#6b7280' },
    activeTabText: { color: '#4f46e5' },
    content: { flex: 1 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, transform: [{ translateY: -30 }] },
    emptyStateTitle: { fontSize: 20, fontFamily: 'Inter-Bold', color: '#1f2937', marginTop: 16 },
    emptyStateSubtitle: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#6b7280', marginTop: 8, textAlign: 'center', maxWidth: '80%' },
    listContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
    appointmentCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
    appointmentDate: { fontSize: 16, fontFamily: 'Inter-Bold', color: '#111827', marginBottom: 12 },
    timeInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    timeText: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#374151', marginLeft: 8 },
    counselorInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f3f4f6' },
    counselorAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#e5e7eb' },
    counselorName: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#374151' },
    joinButton: { backgroundColor: '#4f46e5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, elevation: 2, shadowColor: '#4f46e5' },
    joinButtonText: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#ffffff', marginLeft: 8 },
    promptContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8fafc', },
    promptCard: { width: '100%', alignItems: 'center' },
    promptIconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginBottom: 16, },
    promptTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: 8, },
    promptText: { fontSize: 16, textAlign: 'center', marginBottom: 24, color: '#4b5563', lineHeight: 24, },
});