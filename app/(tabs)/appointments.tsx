import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Video, Phone, MessageSquare, Plus, Shield } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { CounselorCard } from '@/components/counselors/CounselorCard';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Counselor, Appointment } from '@/types';

export default function AppointmentsScreen() {
  const { user } = useAuth();
  // Get live data and functions from the context
  const { counselors, appointments, bookAppointment, loading } = useData();
  
  const [selectedView, setSelectedView] = useState<'upcoming' | 'book'>('upcoming');
  // Local state to track which counselor is being booked
  const [bookingState, setBookingState] = useState<{ [key: number]: boolean }>({});

  // Corrected logic to filter appointments based on the data from our API
  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.appointment_time) > new Date() && apt.status === 'scheduled'
  );
  const pastAppointments = appointments.filter(apt => 
    new Date(apt.appointment_time) <= new Date() || apt.status !== 'scheduled'
  );

  const handleBookAppointment = async (counselor: Counselor) => {
    setBookingState(prev => ({ ...prev, [counselor.id]: true }));
    // For this example, we'll book a video session for tomorrow at 2 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    
    try {
      const success = await bookAppointment(counselor.id, tomorrow.toISOString(), 'video');
      if (success) {
        Alert.alert('Success', `Your appointment with ${counselor.profile.full_name} has been booked.`);
        setSelectedView('upcoming'); // Switch back to see the new appointment
      } else {
        throw new Error('An unknown error occurred.');
      }
    } catch (error: any) {
      console.error('Failed to book appointment:', error);
      Alert.alert('Booking Failed', error.message || 'Could not book the appointment. Please try again.');
    } finally {
      setBookingState(prev => ({ ...prev, [counselor.id]: false }));
    }
  };

  const handleViewProfile = (counselor: Counselor) => {
    console.log('View counselor profile:', counselor.id);
    // Here you would navigate to a detailed counselor profile screen
    Alert.alert("View Profile", `This will show the full profile for ${counselor.profile.full_name}.`);
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'audio': return Phone;
      case 'chat': return MessageSquare;
      default: return Video;
    }
  };

  const getSessionColor = (type: string) => {
    switch (type) {
      case 'video': return '#6366f1';
      case 'audio': return '#10b981';
      case 'chat': return '#f59e0b';
      default: return '#6366f1';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header - Unchanged */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Therapy Sessions</Text>
            <Text style={styles.subtitle}>Professional support when you need it</Text>
          </View>
          <View style={styles.privacyBadge}><Shield size={16} color="#10b981" /><Text style={styles.privacyText}>Confidential</Text></View>
        </View>

        {/* View Toggle - Unchanged */}
        <View style={styles.section}>
          <View style={styles.viewToggle}>
            <Pressable style={[styles.toggleButton, selectedView === 'upcoming' && styles.toggleButtonActive]} onPress={() => setSelectedView('upcoming')}>
              <Text style={[styles.toggleText, selectedView === 'upcoming' && styles.toggleTextActive]}>My Sessions</Text>
            </Pressable>
            <Pressable style={[styles.toggleButton, selectedView === 'book' && styles.toggleButtonActive]} onPress={() => setSelectedView('book')}>
              <Text style={[styles.toggleText, selectedView === 'book' && styles.toggleTextActive]}>Book Session</Text>
            </Pressable>
          </View>
        </View>

        {selectedView === 'upcoming' ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
              {loading.appointments ? <ActivityIndicator color="#6366f1" /> : 
                upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => {
                    const SessionIcon = getSessionIcon(appointment.type);
                    return (
                      <Card key={appointment.id} style={styles.appointmentCard}>
                        {/* Corrected property names like `appointment_time` */}
                        <View style={styles.appointmentHeader}>
                          <View style={styles.appointmentDate}>
                            <Calendar size={20} color="#6366f1" />
                            <Text style={styles.dateText}>{new Date(appointment.appointment_time).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                          </View>
                          <View style={styles.appointmentTime}><Clock size={16} color="#6b7280" /><Text style={styles.timeText}>{new Date(appointment.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text></View>
                        </View>
                        <View style={styles.appointmentDetails}>
                          <View style={styles.sessionType}>
                            <View style={[styles.sessionIcon, { backgroundColor: getSessionColor(appointment.type) }]}><SessionIcon size={16} color="#ffffff" /></View>
                            <Text style={styles.sessionText}>{appointment.type} session • {appointment.duration} minutes</Text>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: appointment.status === 'confirmed' ? '#10b981' : '#f59e0b' }]}><Text style={styles.statusText}>{appointment.status.toUpperCase()}</Text></View>
                        </View>
                        <View style={styles.appointmentActions}><Button title="Join Session" onPress={() => console.log('Join session')} style={styles.actionButton} /><Button title="Reschedule" onPress={() => console.log('Reschedule')} variant="ghost" style={styles.actionButton} /></View>
                      </Card>
                    );
                  })
                ) : (
                  <Card style={styles.emptyState}>
                    <Calendar size={48} color="#d1d5db" />
                    <Text style={styles.emptyStateTitle}>No upcoming sessions</Text>
                    <Text style={styles.emptyStateText}>Book your first therapy session to get started</Text>
                    <Button title="Book Session" onPress={() => setSelectedView('book')} style={styles.emptyStateButton} />
                  </Card>
                )
              }
            </View>

            {pastAppointments.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Past Sessions</Text>
                {pastAppointments.slice(0, 3).map((appointment) => (
                  <Card key={appointment.id} style={styles.pastAppointmentCard}>
                    <View style={styles.pastAppointmentHeader}>
                      <Text style={styles.pastAppointmentDate}>{new Date(appointment.appointment_time).toLocaleDateString()}</Text>
                      <Text style={styles.pastAppointmentType}>{appointment.type} • {appointment.duration}min</Text>
                    </View>
                    <Text style={styles.pastAppointmentStatus}>Session completed</Text>
                  </Card>
                ))}
              </View>
            )}
          </>
        ) : (
          /* Book Session View */
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Your Therapist</Text>
            <Text style={styles.sectionSubtitle}>All therapists are licensed professionals specializing in various areas of mental health</Text>
            {loading.counselors ? <ActivityIndicator color="#6366f1" /> : 
              counselors
                .filter(counselor => counselor.status === 'available') // Filters for available counselors
                .map((counselor) => (
                  <CounselorCard
                    key={counselor.id}
                    counselor={counselor}
                    onBook={() => handleBookAppointment(counselor)}
                    onViewProfile={() => handleViewProfile(counselor)}
                    isBooking={bookingState[counselor.id]} // Pass booking state to the card
                  />
                ))
            }
          </View>
        )}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Your original styles are fully preserved
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  title: { fontSize: 32, fontFamily: 'Inter-Bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, fontFamily: 'Inter-Regular', color: '#6b7280' },
  privacyBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#bbf7d0' },
  privacyText: { color: '#10b981', fontSize: 12, fontFamily: 'Inter-SemiBold', marginLeft: 6 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  viewToggle: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 12, padding: 4 },
  toggleButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  toggleButtonActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 16, fontFamily: 'Inter-Medium', color: '#6b7280' },
  toggleTextActive: { color: '#111827', fontFamily: 'Inter-SemiBold' },
  sectionTitle: { fontSize: 20, fontFamily: 'Inter-Bold', color: '#111827', marginBottom: 16 },
  sectionSubtitle: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#6b7280', marginBottom: 20, lineHeight: 20 },
  appointmentCard: { padding: 20, marginBottom: 16 },
  appointmentHeader: { marginBottom: 16 },
  appointmentDate: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dateText: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#111827', marginLeft: 8 },
  appointmentTime: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 16, fontFamily: 'Inter-Medium', color: '#6b7280', marginLeft: 6 },
  appointmentDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sessionType: { flexDirection: 'row', alignItems: 'center' },
  sessionIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sessionText: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#374151', textTransform: 'capitalize' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { color: '#ffffff', fontSize: 12, fontFamily: 'Inter-Bold' },
  appointmentActions: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyStateTitle: { fontSize: 20, fontFamily: 'Inter-Bold', color: '#111827', marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: 16, fontFamily: 'Inter-Regular', color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  emptyStateButton: { minWidth: 150 },
  pastAppointmentCard: { padding: 16, marginBottom: 8, backgroundColor: '#f9fafb' },
  pastAppointmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pastAppointmentDate: { fontSize: 16, fontFamily: 'Inter-Medium', color: '#374151' },
  pastAppointmentType: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#6b7280', textTransform: 'capitalize' },
  pastAppointmentStatus: { fontSize: 12, fontFamily: 'Inter-Medium', color: '#10b981' },
  benefitsNotice: { padding: 20, backgroundColor: '#f0f9ff' },
  benefitsTitle: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#111827', marginBottom: 8 },
  benefitsText: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#374151', lineHeight: 20 },
  bottomSpacing: { height: 20 },
});