import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Counselor, UserProfile, Appointment } from '@/types';
import { BookingModal } from './BookingModal';
import { useData } from '@/context/DataContext';

interface CounselorCardProps {
  counselor: Counselor;
  onBookingComplete: () => void;
}

export function CounselorCard({ counselor, onBookingComplete }: CounselorCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { createAppointment } = useData();
  const profile = counselor.profiles as UserProfile;

  const handleConfirmBooking = async (details: Partial<Appointment>): Promise<boolean> => {
      const success = await createAppointment(details);
      if (success) {
        onBookingComplete();
      }
      return success;
  }

  return (
    <>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Image source={{ uri: profile?.avatar_url || `https://i.pravatar.cc/150?u=${profile?.id}` }} style={styles.avatar} />
          <View style={styles.headerText}>
            <Text style={styles.name}>{profile?.full_name || 'No Name'}</Text>
          </View>
        </View>
        <Text style={styles.specialties}>{counselor.specialties.join(', ')}</Text>
        <View style={styles.footer}>
          <Button 
            title="Book Now"
            onPress={() => setModalVisible(true)}
            style={styles.bookButton}
          />
        </View>
      </Card>
      <BookingModal
        counselor={counselor}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirmBooking={handleConfirmBooking}
      />
    </>
  );
}

const styles = StyleSheet.create({
    card: { marginBottom: 16, },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, },
    avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 16, },
    headerText: { flex: 1, },
    name: { fontSize: 18, fontFamily: 'Inter-Bold', color: '#1e293b', },
    specialties: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#4f46e5', marginBottom: 12, },
    footer: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 16, },
    bookButton: { }
});