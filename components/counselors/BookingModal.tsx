import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Counselor, Appointment, UserProfile } from '@/types';
import { X, Calendar, Clock, Video, MessageSquare } from 'lucide-react-native';
import { addDays, format } from 'date-fns';

interface BookingModalProps {
  counselor: Counselor;
  visible: boolean;
  onClose: () => void;
  onConfirmBooking: (details: Partial<Appointment>) => Promise<boolean>;
}

// --- NEW: Helper function to generate time slots ---
const generateTimeSlots = () => {
    const slots = [];
    for (let i = 9; i <= 20; i++) { // From 9:00 AM to 8:00 PM
        slots.push(`${i < 10 ? '0' : ''}${i}:00`);
    }
    return slots;
};

// --- NEW: Helper function to generate selectable dates ---
const generateDateOptions = () => {
    const options = [];
    for(let i = 0; i < 7; i++) {
        options.push(addDays(new Date(), i));
    }
    return options;
};

export const BookingModal = ({ counselor, visible, onClose, onConfirmBooking }: BookingModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [selectedType, setSelectedType] = useState<'video' | 'chat'>('video');
  const [isBooking, setIsBooking] =useState(false);

  const profile = counselor.profiles as UserProfile;
  const timeSlots = generateTimeSlots();
  const dateOptions = generateDateOptions();

  const handleConfirm = async () => {
    setIsBooking(true);
    const appointmentTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    appointmentTime.setHours(hours, minutes, 0, 0); // Set seconds and ms to 0

    const bookingDetails: Partial<Appointment> = {
      counselor_id: counselor.id,
      appointment_time: appointmentTime.toISOString(),
      type: selectedType,
      status: 'confirmed'
    };
    
    const success = await onConfirmBooking(bookingDetails);
    if(success) {
        onClose();
    }
    setIsBooking(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Card style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Book a Session</Text>
          <Text style={styles.counselorName}>with {profile?.full_name}</Text>
          
          <View style={styles.section}>
            <Calendar size={20} color="#4f46e5" />
            <Text style={styles.sectionTitle}>Select a Date</Text>
          </View>
          {/* --- UPDATED: Date Selection --- */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScrollView}>
                {dateOptions.map((date, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.dateChip, format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && styles.selectedDateChip]}
                        onPress={() => setSelectedDate(date)}
                    >
                        <Text style={[styles.dateChipDay, format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && styles.selectedDateChipText]}>{format(date, 'EEE')}</Text>
                        <Text style={[styles.dateChipDate, format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && styles.selectedDateChipText]}>{format(date, 'd')}</Text>
                    </TouchableOpacity>
                ))}
          </ScrollView>

          <View style={styles.section}>
            <Clock size={20} color="#4f46e5" />
            <Text style={styles.sectionTitle}>Select a Time</Text>
          </View>
          {/* --- UPDATED: Time Selection --- */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScrollView}>
                {timeSlots.map(time => (
                    <TouchableOpacity 
                        key={time}
                        style={[styles.timeSlot, selectedTime === time && styles.selectedTimeSlot]}
                        onPress={() => setSelectedTime(time)}
                    >
                        <Text style={[styles.timeSlotText, selectedTime === time && styles.selectedTimeSlotText]}>{time}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

          <View style={styles.section}>
            <Video size={20} color="#4f46e5" />
            <Text style={styles.sectionTitle}>Consultation Type</Text>
          </View>
          <View style={styles.typeContainer}>
            <TouchableOpacity style={[styles.typeButton, selectedType === 'video' && styles.selectedTypeButton]} onPress={() => setSelectedType('video')}>
              <Video size={16} color={selectedType === 'video' ? '#ffffff' : '#4f46e5'} />
              <Text style={[styles.typeButtonText, selectedType === 'video' && styles.selectedTypeButtonText]}>Video Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.typeButton, selectedType === 'chat' && styles.selectedTypeButton]} onPress={() => setSelectedType('chat')}>
              <MessageSquare size={16} color={selectedType === 'chat' ? '#ffffff' : '#4f46e5'}/>
              <Text style={[styles.typeButtonText, selectedType === 'chat' && styles.selectedTypeButtonText]}>Chat</Text>
            </TouchableOpacity>
          </View>
          
          <Button 
            title={isBooking ? "Confirming..." : "Confirm Booking"} 
            onPress={handleConfirm}
            disabled={isBooking}
          />
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { borderBottomRightRadius: 0, borderBottomLeftRadius: 0, paddingBottom: 20 },
    closeButton: { position: 'absolute', top: 16, right: 16, zIndex: 1 },
    title: { fontSize: 22, fontFamily: 'Inter-Bold', textAlign: 'center', marginBottom: 4 },
    counselorName: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
    section: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 16 },
    sectionTitle: { fontSize: 18, fontFamily: 'Inter-SemiBold', marginLeft: 8 },
    dateScrollView: { paddingLeft: 8 },
    dateChip: { width: 60, height: 70, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: '#f9fafb' },
    selectedDateChip: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
    dateChipDay: { fontSize: 14, color: '#6b7280' },
    dateChipDate: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
    selectedDateChipText: { color: '#ffffff' },
    timeScrollView: { paddingVertical: 8, paddingLeft: 8 },
    timeSlot: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', marginRight: 12 },
    selectedTimeSlot: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
    timeSlotText: { fontSize: 16, color: '#374151' },
    selectedTimeSlotText: { color: '#ffffff' },
    typeContainer: { flexDirection: 'row', gap: 12, marginBottom: 24, marginTop: 8 },
    typeButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb' },
    selectedTypeButton: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
    typeButtonText: { color: '#4f46e5', fontWeight: '500' },
    selectedTypeButtonText: { color: '#ffffff' },
});