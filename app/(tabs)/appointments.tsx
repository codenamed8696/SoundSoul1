// app/(tabs)/appointments.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Video, PlusCircle } from 'lucide-react-native';
import { useData } from '@/context/DataContext';
import { Appointment } from '@/types';
import { CounselorCard } from '@/components/counselors/CounselorCard';
import { format } from 'date-fns';

type ActiveTab = 'upcoming' | 'book';

export default function AppointmentsScreen() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('upcoming');
  const { appointments, counselors, isLoadingAppointments, isLoadingCounselors, bookAppointment } = useData();

  const renderUpcomingSessions = () => {
    const upcomingAppointments = appointments.filter(a => a.status === 'confirmed');

    if (isLoadingAppointments) {
      return <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#4f46e5" /></View>;
    }
    if (upcomingAppointments.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Calendar size={48} color="#9ca3af" />
          <Text style={styles.emptyStateTitle}>No Upcoming Sessions</Text>
          <Text style={styles.emptyStateSubtitle}>You can book a new session with one of our counselors.</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={upcomingAppointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AppointmentCard appointment={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderBookSession = () => {
    if (isLoadingCounselors) {
      return <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#4f46e5" /></View>;
    }
    return (
      <FlatList
        data={counselors}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CounselorCard counselor={item} onBook={bookAppointment} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const counselorProfile = appointment.counselors?.profiles;
    if (!counselorProfile) return null;

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
    listContainer: { paddingHorizontal: 16, paddingTop: 16 },
    appointmentCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
    appointmentDate: { fontSize: 16, fontFamily: 'Inter-Bold', color: '#111827', marginBottom: 12 },
    timeInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    timeText: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#374151', marginLeft: 8 },
    counselorInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f3f4f6' },
    counselorAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#e5e7eb' },
    counselorName: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#374151' },
    joinButton: { backgroundColor: '#4f46e5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, elevation: 2, shadowColor: '#4f46e5' },
    joinButtonText: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#ffffff', marginLeft: 8 },
});