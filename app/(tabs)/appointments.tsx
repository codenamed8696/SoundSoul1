import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useData } from '../../context/DataContext';
import { Appointment } from '../../types';
import { CounselorCard } from '../../components/counselors/CounselorCard';
import { GradientBackground } from '../../components/common/GradientBackground';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const AppointmentItem = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentItem}>
      <View>
        <Text style={styles.counselorName}>
          {item.counselor?.profile?.full_name || 'Counselor'}
        </Text>
        <Text style={styles.appointmentTime}>
          {new Date(item.appointment_time).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
        </Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: item.status === 'confirmed' ? '#D1FAE5' : '#FEE2E2' }]}>
        <Text style={[styles.statusText, { color: item.status === 'confirmed' ? '#065F46' : '#991B1B' }]}>
          {item.status}
        </Text>
      </View>
    </View>
);

const AppointmentsScreen = () => {
  const { appointments, counselors, fetchAppointments, fetchCounselors, loading } = useData();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchCounselors();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchAppointments(), fetchCounselors()]);
    setRefreshing(false);
  }, []);

  const upcomingAppointments = appointments.filter(app => app && new Date(app.appointment_time) > new Date());
  const pastAppointments = appointments.filter(app => app && new Date(app.appointment_time) <= new Date());
  const displayedAppointments = selectedIndex === 0 ? upcomingAppointments : pastAppointments;

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        <Text style={styles.header}>Appointments</Text>
        
        <View style={styles.listContainer}>
          <SegmentedControl
            values={['Upcoming', 'Past']}
            selectedIndex={selectedIndex}
            onChange={(event) => setSelectedIndex(event.nativeEvent.selectedSegmentIndex)}
            style={styles.segmentedControl}
          />
          {loading.appointments && <ActivityIndicator style={{ marginTop: 20 }} />}
          {!loading.appointments && (
            <>
              {displayedAppointments.length > 0 ? (
                displayedAppointments.map(item => <AppointmentItem key={item.id} item={item} />)
              ) : (
                <Text style={styles.emptyListText}>No {selectedIndex === 0 ? 'upcoming' : 'past'} appointments.</Text>
              )}
            </>
          )}
        </View>

        <View style={styles.bookingSection}>
          <Text style={styles.sectionTitle}>Book a Session</Text>
          {loading.counselors ? (
            <ActivityIndicator />
          ) : counselors && counselors.length > 0 ? (
            counselors.map(counselor => (
              <CounselorCard key={counselor.id} counselor={counselor} />
            ))
          ) : (
             <View style={styles.emptyContainer}>
               <Text style={styles.emptyText}>No counselors are available at this time. Please check back later.</Text>
             </View>
          )}
        </View>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { paddingTop: 60, paddingBottom: 50 },
  header: { fontSize: 32, fontWeight: 'bold', color: '#fff', paddingHorizontal: 20, marginBottom: 20 },
  listContainer: { marginHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 16 },
  segmentedControl: { marginBottom: 16 },
  appointmentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  counselorName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  appointmentTime: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '500' },
  emptyListText: { textAlign: 'center', paddingVertical: 20, color: '#6B7280' },
  bookingSection: { marginTop: 40 },
  sectionTitle: { fontSize: 22, fontWeight: '600', color: '#fff', paddingHorizontal: 20, marginBottom: 16 },
  emptyContainer: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 20, marginHorizontal: 20 },
  emptyText: { color: '#e0e7ff', textAlign: 'center' },
});

export default AppointmentsScreen;