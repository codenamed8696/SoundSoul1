import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TouchableOpacity, TextInput, Alert, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Video,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Appointment } from '@/types';

const sessionTypes = [
  { id: 'video', label: 'Video', icon: Video, color: '#6366f1' },
  { id: 'audio', label: 'Audio', icon: Phone, color: '#10b981' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, color: '#f59e0b' },
];

export default function CounselorScheduleScreen() {
  const { profile } = useAuth();
  const { appointments, clients, createAppointment, updateAppointment, loading } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // State for the "Add Appointment" modal
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [newAppointmentTime, setNewAppointmentTime] = useState('');

  // State for action modals (reschedule/notes)
  const [isActionModalVisible, setActionModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'reschedule' | 'notes' | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [notesText, setNotesText] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  if (loading.appointments) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }
  
  const currentAppointments = (Array.isArray(appointments) ? appointments : []).filter(apt => 
    apt.appointment_time.split('T')[0] === selectedDate
  );

  const getSessionTypeIcon = (type: string) => {
    const sessionType = sessionTypes.find(t => t.id === type);
    return sessionType ? sessionType.icon : Video;
  };

  const getSessionTypeColor = (type: string) => {
    const sessionType = sessionTypes.find(t => t.id === type);
    return sessionType?.color || '#6b7280';
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    currentDate.setUTCHours(12);
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 1);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const handleAppointmentAction = (appointment: Appointment, action: 'join' | 'reschedule' | 'notes') => {
    setSelectedAppointment(appointment);
    if (action === 'join') {
      if (appointment.meeting_link) {
        Linking.openURL(appointment.meeting_link).catch(() => Alert.alert("Error", "Could not open link."));
      } else {
        Alert.alert("No Link Available", "No meeting link for this session.");
      }
    } else {
      setModalMode(action);
      if (action === 'reschedule') {
        setRescheduleTime(new Date(appointment.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      } else {
        setNotesText(appointment.notes || '');
      }
      setActionModalVisible(true);
    }
  };

  const handleCreateAppointment = async () => {
    if (!selectedClient || !newAppointmentTime) {
      Alert.alert('Missing Information', 'Please select a client and enter a time.');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(newAppointmentTime)) {
      Alert.alert('Invalid Time Format', 'Please enter the time in HH:MM format (e.g., 14:30).');
      return;
    }
    setIsScheduling(true);
    const success = await createAppointment({
      user_id: selectedClient,
      appointment_time: new Date(`${selectedDate}T${newAppointmentTime}:00`).toISOString(),
    });
    setIsScheduling(false);
    if (success) {
      Alert.alert('Success', 'Appointment scheduled successfully.');
      setAddModalVisible(false);
      setSelectedClient(null);
      setNewAppointmentTime('');
    } else {
      Alert.alert('Error', 'Could not schedule appointment.');
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedAppointment) return;
    setIsScheduling(true);
    let success = false;
    if (modalMode === 'reschedule') {
      if (!/^\d{2}:\d{2}$/.test(rescheduleTime)) { Alert.alert('Invalid Time', 'Use HH:MM format.'); setIsScheduling(false); return; }
      const newDateTime = new Date(`${selectedDate}T${rescheduleTime}:00`);
      success = await updateAppointment(selectedAppointment.id, { appointment_time: newDateTime.toISOString() });
    } else if (modalMode === 'notes') {
      success = await updateAppointment(selectedAppointment.id, { notes: notesText });
    }
    setIsScheduling(false);
    if (success) {
      Alert.alert("Success", "Changes saved.");
      setActionModalVisible(false);
    } else {
      Alert.alert("Error", "Could not save changes.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Schedule</Text>
          <Text style={styles.subtitle}>Manage your therapy sessions and appointments</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.dateNavigation}>
            <Pressable style={styles.dateNavButton} onPress={() => handleDateChange('prev')}>
              <ChevronLeft size={20} color="#6b7280" />
            </Pressable>
            <View style={styles.dateDisplay}>
              <Text style={styles.dateText}>
                {new Date(`${selectedDate}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </View>
            <Pressable style={styles.dateNavButton} onPress={() => handleDateChange('next')}>
              <ChevronRight size={20} color="#6b7280" />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}><Calendar size={24} color="#6366f1" /><Text style={styles.statValue}>{currentAppointments.length}</Text><Text style={styles.statLabel}>Today's Sessions</Text></Card>
            <Card style={styles.statCard}><Clock size={24} color="#10b981" /><Text style={styles.statValue}>{currentAppointments.reduce((total, apt) => total + apt.duration, 0)}</Text><Text style={styles.statLabel}>Total Minutes</Text></Card>
            <Card style={styles.statCard}><Plus size={24} color="#f59e0b" /><Text style={styles.statValue}>{Math.max(0, 8 - currentAppointments.length)}</Text><Text style={styles.statLabel}>Available Slots</Text></Card>
          </View>
        </View>

        <View style={styles.section}><Button title="Schedule New Appointment" onPress={() => setAddModalVisible(true)} style={styles.addButton} /></View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{currentAppointments.length > 0 ? 'Today\'s Appointments' : 'No Appointments Today'}</Text>
          {currentAppointments.length > 0 ? (
            <View style={styles.appointmentsList}>
              {currentAppointments.map((appointment) => {
                const SessionIcon = getSessionTypeIcon(appointment.type);
                return (
                  <Card key={appointment.id} style={styles.appointmentCard}>
                    <View style={styles.appointmentHeader}>
                      <View style={styles.appointmentTime}><Clock size={16} color="#6b7280" /><Text style={styles.timeText}>{new Date(appointment.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text><Text style={styles.durationText}>({appointment.duration}min)</Text></View>
                      <View style={styles.appointmentType}><View style={[styles.typeIcon, { backgroundColor: getSessionTypeColor(appointment.type) }]}><SessionIcon size={16} color="#ffffff" /></View><Text style={styles.typeText}>{appointment.type}</Text></View>
                    </View>
                    <View style={styles.appointmentDetails}><Text style={styles.clientText}>Anonymous Client #{appointment.user_id.slice(-6)}</Text><View style={[styles.statusBadge, { backgroundColor: appointment.status === 'confirmed' ? '#10b981' : '#f59e0b' }]}><Text style={styles.statusText}>{appointment.status.toUpperCase()}</Text></View></View>
                    {appointment.notes && (<Text style={styles.appointmentNotes}>{appointment.notes}</Text>)}
                    <View style={styles.appointmentActions}>
                      <Button title="Join" onPress={() => handleAppointmentAction(appointment, 'join')} size="small" style={styles.actionButton} />
                      <Button title="Reschedule" onPress={() => handleAppointmentAction(appointment, 'reschedule')} variant="ghost" size="small" style={styles.actionButton} />
                      <Button title="Notes" onPress={() => handleAppointmentAction(appointment, 'notes')} variant="ghost" size="small" style={styles.actionButton} />
                    </View>
                  </Card>
                );
              })}
            </View>
          ) : (
            <Card style={styles.emptyState}><Calendar size={64} color="#d1d5db" /><Text style={styles.emptyStateTitle}>No appointments scheduled</Text><Text style={styles.emptyStateText}>You have a free day! Use this time for self-care or administrative tasks.</Text></Card>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Types</Text>
          <View style={styles.sessionTypesGrid}>
            {sessionTypes.map((type) => (<Card key={type.id} style={styles.sessionTypeCard}><View style={[styles.sessionTypeIcon, { backgroundColor: type.color }]}><type.icon size={20} color="#ffffff" /></View><Text style={styles.sessionTypeLabel}>{type.label}</Text></Card>))}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* --- ADD APPOINTMENT MODAL --- */}
      <Modal animationType="slide" transparent={true} visible={isAddModalVisible} onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Schedule New Session</Text><TouchableOpacity onPress={() => setAddModalVisible(false)}><X size={24} color="#6b7280" /></TouchableOpacity></View>
            <Text style={styles.label}>Select Client</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientSelector}>
              {(Array.isArray(clients) ? clients : []).map(client => (<TouchableOpacity key={client.id} style={[styles.clientChip, selectedClient === client.id && styles.clientChipSelected]} onPress={() => setSelectedClient(client.id)}><Text style={[styles.clientChipText, selectedClient === client.id && styles.clientChipTextSelected]}>...{client.id.slice(-6)}</Text></TouchableOpacity>))}
            </ScrollView>
            <Text style={styles.label}>Time (24-hour format)</Text>
            <TextInput style={styles.input} placeholder="HH:MM (e.g., 14:30)" value={newAppointmentTime} onChangeText={setNewAppointmentTime} keyboardType="numbers-and-punctuation" maxLength={5} />
            <Button title={isScheduling ? "Scheduling..." : "Confirm Appointment"} onPress={handleCreateAppointment} disabled={isScheduling} />
          </View>
        </View>
      </Modal>

      {/* --- ACTION MODAL (Reschedule/Notes) --- */}
      <Modal animationType="slide" transparent={true} visible={isActionModalVisible} onRequestClose={() => setActionModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{modalMode === 'reschedule' ? 'Reschedule Session' : 'Session Notes'}</Text><TouchableOpacity onPress={() => setActionModalVisible(false)}><X size={24} color="#6b7280" /></TouchableOpacity></View>
            {modalMode === 'reschedule' && (<><Text style={styles.label}>New Time (24-hour format)</Text><TextInput style={styles.input} placeholder="HH:MM" value={rescheduleTime} onChangeText={setRescheduleTime} keyboardType="numbers-and-punctuation" maxLength={5}/></>)}
            {modalMode === 'notes' && (<><Text style={styles.label}>Notes for session with ...{selectedAppointment?.user_id.slice(-6)}</Text><TextInput style={[styles.input, styles.notesInput]} placeholder="Enter session notes..." value={notesText} onChangeText={setNotesText} multiline /></>)}
            <Button title={isScheduling ? "Saving..." : "Save Changes"} onPress={handleSaveChanges} disabled={isScheduling} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  dateNavigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  dateNavButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  dateDisplay: { flex: 1, alignItems: 'center' },
  dateText: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: '#111827', marginTop: 8, marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', textAlign: 'center' },
  addButton: { marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16 },
  appointmentsList: { gap: 16 },
  appointmentCard: { padding: 20 },
  appointmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  appointmentTime: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 18, fontWeight: '700', color: '#111827', marginLeft: 8 },
  durationText: { fontSize: 14, color: '#6b7280', marginLeft: 8 },
  appointmentType: { flexDirection: 'row', alignItems: 'center' },
  typeIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  typeText: { fontSize: 14, fontWeight: '600', color: '#374151', textTransform: 'capitalize' },
  appointmentDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  clientText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
  appointmentNotes: { fontSize: 14, color: '#6b7280', fontStyle: 'italic', marginBottom: 16, lineHeight: 20 },
  appointmentActions: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyStateTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  sessionTypesGrid: { flexDirection: 'row', gap: 12 },
  sessionTypeCard: { flex: 1, padding: 16, alignItems: 'center' },
  sessionTypeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  sessionTypeLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  bottomSpacing: { height: 20 },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { backgroundColor: 'white', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  label: { fontSize: 16, color: '#374151', marginBottom: 8, marginTop: 12 },
  clientSelector: { flexDirection: 'row', flexWrap: 'nowrap', gap: 8, paddingBottom: 10 },
  clientChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#f3f4f6' },
  clientChipSelected: { backgroundColor: '#6366f1' },
  clientChipText: { color: '#374151', fontWeight: '500' },
  clientChipTextSelected: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20 },
  notesInput: { height: 120, textAlignVertical: 'top' },
});