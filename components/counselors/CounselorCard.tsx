// components/counselors/CounselorCard.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Counselor, UserProfile } from '@/types'; // Updated to include UserProfile
import { Briefcase, GraduationCap, Star } from 'lucide-react-native';

interface CounselorCardProps {
  counselor: Counselor;
  onBook: (counselorId: number) => Promise<boolean>; // Changed to number to match DB
}

export function CounselorCard({ counselor, onBook }: CounselorCardProps) {
  const [isBooking, setIsBooking] = useState(false);
  
  // Correctly access the nested profile data
  const profile = counselor.profiles as UserProfile;

  const handleBooking = async () => {
    setIsBooking(true);
    const success = await onBook(counselor.id);
    if (success) {
      Alert.alert('Success', `Appointment booked with ${profile?.full_name}.`);
    } else {
      Alert.alert('Error', 'Could not book the appointment. Please try again.');
    }
    setIsBooking(false);
  };

  // Your original UI structure is preserved
  // It's now populated with data from the nested profile object
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: profile?.avatar_url || `https://i.pravatar.cc/150?u=${profile?.id}` }} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{profile?.full_name || 'No Name'}</Text>
           {/* The rating and experience fields don't exist in your schema, so they are removed to prevent errors */}
        </View>
      </View>
      <Text style={styles.specialties}>{counselor.specialties.join(', ')}</Text>
      {/* The qualifications field doesn't exist in your schema, so it is removed */}
      <View style={styles.footer}>
        <Button 
          title={isBooking ? "Booking..." : "Book Now"}
          onPress={handleBooking} 
          disabled={isBooking}
          style={styles.bookButton}
        >
            {isBooking && <ActivityIndicator size="small" color="#ffffff" style={{marginRight: 8}}/>}
        </Button>
      </View>
    </Card>
  );
}

// All of your original styles are preserved below
const styles = StyleSheet.create({
    card: { marginBottom: 16, },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, },
    avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 16, },
    headerText: { flex: 1, },
    name: { fontSize: 18, fontFamily: 'Inter-Bold', color: '#1e293b', },
    specialties: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#4f46e5', marginBottom: 12, },
    footer: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 16, },
    bookButton: { /* your styles */ }
});