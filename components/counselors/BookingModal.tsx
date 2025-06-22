import { View, Text, Modal, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Counselor } from '../../types';
import { X, Calendar, Clock, Video, MessageSquare } from 'lucide-react-native';
import { Button } from '../common/Button';
import { addDays, format } from 'date-fns';

interface BookingModalProps {
  counselor: Counselor;
  visible: boolean;
  onClose: () => void;
}

const generateTimeSlots = () => {
    const slots = [];
    for (let i = 9; i <= 20; i++) {
        slots.push(`${i < 10 ? '0' : ''}${i}:00`);
    }
    return slots;
};

const generateDateOptions = () => {
    const options = [];
    for(let i = 1; i < 8; i++) { // Start from tomorrow
        options.push(addDays(new Date(), i));
    }
    return options;
};

export const BookingModal = ({ counselor, visible, onClose }: BookingModalProps) => {
  const { user } = useAuth();
  const { createAppointment, loading } = useData();
  
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [selectedType, setSelectedType] = useState<'video' | 'chat'>('video');

  const dateOptions = generateDateOptions();
  const timeSlots = generateTimeSlots();

  // ** THIS IS THE FIX: We now correctly access the nested profile data **
  const profile = counselor.profiles;

  const handleConfirmBooking = async () => {
    if (!user) {
      Alert.alert("Authentication Error", "You must be signed in to book a session.");
      return;
    }
    
    const [hour, minute] = selectedTime.split(':');
    const finalAppointmentTime = new Date(selectedDate);
    finalAppointmentTime.setHours(parseInt(hour), parseInt(minute), 0, 0);

    const appointmentDetails = {
      user_id: user.id,
      counselor_id: counselor.id,
      appointment_time: finalAppointmentTime.toISOString(),
      status: 'confirmed',
      duration: 60,
      type: selectedType,
      notes: ''
    };

    const { error } = await createAppointment(appointmentDetails);

    if (!error) {
      Alert.alert(
        "Booking Confirmed!",
        `Your session with ${profile?.full_name} has been scheduled.`,
        [{ text: "OK", onPress: onClose }]
      );
    }
  };


  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Book with {profile?.full_name}</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Calendar size={20} color="#374151" />
              <Text style={styles.sectionTitle}>Select Date</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScrollView}>
              {dateOptions.map((date, index) => (
                <TouchableOpacity key={index} style={[styles.dateChip, format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && styles.selectedDateChip]} onPress={() => setSelectedDate(date)}>
                  <Text style={[styles.dateChipDay, format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && styles.selectedDateChipText]}>{format(date, 'EEE')}</Text>
                  <Text style={[styles.dateChipDate, format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && styles.selectedDateChipText]}>{format(date, 'd')}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.section}>
              <Clock size={20} color="#374151" />
              <Text style={styles.sectionTitle}>Select Time</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScrollView}>
              {timeSlots.map((time, index) => (
                <TouchableOpacity key={index} style={[styles.timeSlot, selectedTime === time && styles.selectedTimeSlot]} onPress={() => setSelectedTime(time)}>
                  <Text style={[styles.timeSlotText, selectedTime === time && styles.selectedTimeSlotText]}>{time}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.typeContainer}>
              <TouchableOpacity style={[styles.typeButton, selectedType === 'video' && styles.selectedTypeButton]} onPress={() => setSelectedType('video')}>
                  <Video size={16} color={selectedType === 'video' ? '#fff' : '#374151'} />
                  <Text style={[styles.typeButtonText, selectedType === 'video' && styles.selectedTypeButtonText]}>Video Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeButton, selectedType === 'chat' && styles.selectedTypeButton]} onPress={() => setSelectedType('chat')}>
                  <MessageSquare size={16} color={selectedType === 'chat' ? '#fff' : '#374151'} />
                  <Text style={[styles.typeButtonText, selectedType === 'chat' && styles.selectedTypeButtonText]}>Chat</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          <Button onPress={handleConfirmBooking} disabled={loading.createAppointment}>
            {loading.createAppointment ? <ActivityIndicator color="#fff" /> : 'Confirm & Book Session'}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

// Your original styles, slightly adjusted for consistency
const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '100%', maxHeight: '90%', backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingTop: 40 },
  closeButton: { position: 'absolute', top: 15, right: 15, zIndex: 1, padding: 5 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 24 },
  section: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginLeft: 8 },
  dateScrollView: { paddingVertical: 8 },
  dateChip: { width: 60, height: 70, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: '#f9fafb' },
  selectedDateChip: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  dateChipDay: { fontSize: 14, color: '#6b7280' },
  dateChipDate: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  selectedDateChipText: { color: '#ffffff' },
  timeScrollView: { paddingVertical: 8, flexGrow: 0 },
  timeSlot: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', marginRight: 12 },
  selectedTimeSlot: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  timeSlotText: { fontSize: 16, color: '#374151' },
  selectedTimeSlotText: { color: '#ffffff' },
  typeContainer: { flexDirection: 'row', gap: 12, marginBottom: 24, marginTop: 16 },
  typeButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  selectedTypeButton: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  typeButtonText: { marginLeft: 8, fontSize: 14, fontWeight: '500' },
  selectedTypeButtonText: { color: '#fff' }
});