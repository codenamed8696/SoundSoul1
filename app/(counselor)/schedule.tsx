import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, Modal, TextInput, Linking } from 'react-native';
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
  X as CloseIcon,
  Save
} from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useData } from '@/context/DataContext';
import { supabase } from '@/context/supabaseClient';

const sessionTypes = [
  { id: 'video', label: 'Video', icon: Video, color: '#6366f1' },
  { id: 'audio', label: 'Audio', icon: Phone, color: '#10b981' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, color: '#f59e0b' },
];

export default function CounselorScheduleScreen() {
  const { appointments, loading, fetchAppointments } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // State to manage which modal is open ('reschedule' or 'notes')
  const [activeModal, setActiveModal] = useState<string | null>(null);
  // State to hold the specific appointment being edited
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  
  // State for the form inputs inside the modals
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [notesContent, setNotesContent] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const currentAppointments = useMemo(() => {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    return appointments.filter(apt => 
      apt.appointment_time && apt.appointment_time.split('T')[0] === selectedDateStr
    );
  }, [appointments, selectedDate]);

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'prev' ? -1 : 1));
    setSelectedDate(newDate);
  };

  const handleJoinSession = async (appointment) => {
    if (appointment.meeting_link) {
      const supported = await Linking.canOpenURL(appointment.meeting_link);
      if (supported) {
        await Linking.openURL(appointment.meeting_link);
      } else {
        Alert.alert("Cannot Open Link", `The meeting link for this session is invalid: ${appointment.meeting_link}`);
      }
    } else {
      Alert.alert("No Link Available", "There is no meeting link associated with this session.");
    }
  };
  
  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleTime(new Date(appointment.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    setActiveModal('reschedule');
  };

  const handleConfirmReschedule = async () => {
    if (!selectedAppointment || !rescheduleTime) return;
    
    const [hours, minutes] = rescheduleTime.split(':');
    const newDateTime = new Date(selectedAppointment.appointment_time);
    newDateTime.setHours(parseInt(hours, 10));
    newDateTime.setMinutes(parseInt(minutes, 10));

    const { error } = await supabase
      .from('appointments')
      .update({ appointment_time: newDateTime.toISOString() })
      .eq('id', selectedAppointment.id);
      
    if (error) {
      Alert.alert("Error", "Could not reschedule the appointment.");
    } else {
      Alert.alert("Success", "Appointment has been rescheduled.");
      await fetchAppointments();
      setActiveModal(null);
    }
  };
  
  const openNotesModal = (appointment) => {
    setSelectedAppointment(appointment);
    setNotesContent(appointment.notes || '');
    setActiveModal('notes');
  };

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;
    
    const { error } = await supabase
      .from('appointments')
      .update({ notes: notesContent })
      .eq('id', selectedAppointment.id);

    if (error) {
      Alert.alert("Error", "Could not save notes.");
    } else {
      Alert.alert("Success", "Notes have been saved.");
      await fetchAppointments();
      setActiveModal(null);
    }
  };

  const getSessionTypeIcon = (type: string) => sessionTypes.find(t => t.id === type)?.icon || Video;
  const getSessionTypeColor = (type: string) => sessionTypes.find(t => t.id === type)?.color || '#6b7280';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Text style={styles.title}>Schedule</Text><Text style={styles.subtitle}>Manage your therapy sessions and appointments</Text></View>
        <View style={styles.section}><View style={styles.dateNavigation}><Pressable style={styles.dateNavButton} onPress={() => handleDateChange('prev')}><ChevronLeft size={20} color="#6b7280" /></Pressable><View style={styles.dateDisplay}><Text style={styles.dateText}>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text></View><Pressable style={styles.dateNavButton} onPress={() => handleDateChange('next')}><ChevronRight size={20} color="#6b7280" /></Pressable></View></View>
        <View style={styles.section}><View style={styles.statsGrid}><Card style={styles.statCard}><Calendar size={24} color="#6366f1" /><Text style={styles.statValue}>{currentAppointments.length}</Text><Text style={styles.statLabel}>Today's Sessions</Text></Card><Card style={styles.statCard}><Clock size={24} color="#10b981" /><Text style={styles.statValue}>{currentAppointments.reduce((total, apt) => total + (apt.duration || 60), 0)}</Text><Text style={styles.statLabel}>Total Minutes</Text></Card><Card style={styles.statCard}><Plus size={24} color="#f59e0b" /><Text style={styles.statValue}>{Math.max(0, 8 - currentAppointments.length)}</Text><Text style={styles.statLabel}>Available Slots</Text></Card></View></View>
        <View style={styles.section}><Button title="Schedule New Appointment" onPress={() => Alert.alert('Schedule New Appointment', 'This feature is in development.')} style={styles.addButton} /></View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{loading.appointments ? "Loading..." : currentAppointments.length > 0 ? `Appointments for ${selectedDate.toLocaleDateString()}` : 'No Appointments Today'}</Text>
          {loading.appointments ? (<ActivityIndicator size="large" color="#6366f1" style={{marginTop: 20}}/>) : currentAppointments.length > 0 ? (<View style={styles.appointmentsList}>{currentAppointments.map((appointment) => { const SessionIcon = getSessionTypeIcon(appointment.type); return (<Card key={appointment.id} style={styles.appointmentCard}><View style={styles.appointmentHeader}><View style={styles.appointmentTime}><Clock size={16} color="#6b7280" /><Text style={styles.timeText}>{new Date(appointment.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text><Text style={styles.durationText}>({appointment.duration || 60}min)</Text></View><View style={styles.appointmentType}><View style={[styles.typeIcon, { backgroundColor: getSessionTypeColor(appointment.type) }]}><SessionIcon size={16} color="#ffffff" /></View><Text style={styles.typeText}>{appointment.type}</Text></View></View><View style={styles.appointmentDetails}><Text style={styles.clientText}>Client: {appointment.client_profile?.full_name || `Anonymous #${appointment.user_id.slice(-6)}`}</Text><View style={[styles.statusBadge, { backgroundColor: appointment.status === 'confirmed' || appointment.status === 'scheduled' ? '#10b981' : '#f59e0b' }]}><Text style={styles.statusText}>{appointment.status?.toUpperCase()}</Text></View></View>{appointment.notes && (<Text style={styles.appointmentNotes}>{appointment.notes}</Text>)}<View style={styles.appointmentActions}><Button title="Join" onPress={() => handleJoinSession(appointment)} size="small" style={styles.actionButton} /><Button title="Reschedule" onPress={() => openRescheduleModal(appointment)} variant="ghost" size="small" style={styles.actionButton} /><Button title="Notes" onPress={() => openNotesModal(appointment)} variant="ghost" size="small" style={styles.actionButton} /></View></Card>);})}</View>) : (<Card style={styles.emptyState}><Calendar size={64} color="#d1d5db" /><Text style={styles.emptyStateTitle}>No appointments scheduled</Text><Text style={styles.emptyStateText}>You have a free day! Use this time for self-care or administrative tasks.</Text></Card>)}
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Session Types</Text><View style={styles.sessionTypesGrid}>{sessionTypes.map((type) => (<Card key={type.id} style={styles.sessionTypeCard}><View style={[styles.sessionTypeIcon, { backgroundColor: type.color }]}><type.icon size={20} color="#ffffff" /></View><Text style={styles.sessionTypeLabel}>{type.label}</Text></Card>))}</View></View>
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Reschedule Modal */}
      <Modal animationType="slide" transparent={true} visible={activeModal === 'reschedule'} onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalContainer}><View style={styles.modalContent}><View style={styles.modalHeader}><Text style={styles.modalTitle}>Reschedule Session</Text><Pressable onPress={() => setActiveModal(null)}><CloseIcon size={24} color="#6b7280" /></Pressable></View><Text style={styles.inputLabel}>New Time (24hr format, e.g., 14:30)</Text><TextInput style={styles.modalInput} placeholder="HH:MM" value={rescheduleTime} onChangeText={setRescheduleTime} /><Button title="Confirm Reschedule" onPress={handleConfirmReschedule} /></View></View>
      </Modal>

      {/* Notes Modal */}
      <Modal animationType="slide" transparent={true} visible={activeModal === 'notes'} onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalContainer}><View style={styles.modalContent}><View style={styles.modalHeader}><Text style={styles.modalTitle}>Session Notes</Text><Pressable onPress={() => setActiveModal(null)}><CloseIcon size={24} color="#6b7280" /></Pressable></View><Text style={styles.inputLabel}>Notes for client: {selectedAppointment?.client_profile?.full_name || 'Anonymous'}</Text><TextInput style={[styles.modalInput, {height: 120, textAlignVertical: 'top'}]} multiline={true} value={notesContent} onChangeText={setNotesContent} /><Button title="Save Notes" onPress={handleSaveNotes} /></View></View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', }, header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, }, title: { fontSize: 32, fontWeight: '700', color: '#111827', marginBottom: 8, }, subtitle: { fontSize: 16, color: '#6b7280', }, section: { paddingHorizontal: 20, marginBottom: 24, }, dateNavigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, }, dateNavButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', }, dateDisplay: { flex: 1, alignItems: 'center', }, dateText: { fontSize: 18, fontWeight: '700', color: '#111827', }, statsGrid: { flexDirection: 'row', gap: 12, }, statCard: { flex: 1, padding: 16, alignItems: 'center', }, statValue: { fontSize: 24, fontWeight: '700', color: '#111827', marginTop: 8, marginBottom: 4, }, statLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', textAlign: 'center', }, addButton: { marginBottom: 8, }, sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16, }, appointmentsList: { gap: 16, }, appointmentCard: { padding: 20, }, appointmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, }, appointmentTime: { flexDirection: 'row', alignItems: 'center', }, timeText: { fontSize: 18, fontWeight: '700', color: '#111827', marginLeft: 8, }, durationText: { fontSize: 14, color: '#6b7280', marginLeft: 8, }, appointmentType: { flexDirection: 'row', alignItems: 'center', }, typeIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 8, }, typeText: { fontSize: 14, fontWeight: '600', color: '#374151', textTransform: 'capitalize', }, appointmentDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, }, clientText: { fontSize: 16, fontWeight: '600', color: '#111827', }, statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, }, statusText: { color: '#ffffff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }, appointmentNotes: { fontSize: 14, color: '#6b7280', fontStyle: 'italic', marginBottom: 16, lineHeight: 20, }, appointmentActions: { flexDirection: 'row', gap: 8, }, actionButton: { flex: 1, }, emptyState: { padding: 40, alignItems: 'center', }, emptyStateTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 16, marginBottom: 8, }, emptyStateText: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20, }, sessionTypesGrid: { flexDirection: 'row', gap: 12, }, sessionTypeCard: { flex: 1, padding: 16, alignItems: 'center', }, sessionTypeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8, }, sessionTypeLabel: { fontSize: 14, fontWeight: '600', color: '#374151', }, bottomSpacing: { height: 20, },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', },
  modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  modalInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
});