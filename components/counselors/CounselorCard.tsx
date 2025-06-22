import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Counselor } from '../../types';
import { BookingModal } from './BookingModal';
import { Button } from '../common/Button';
import { Star } from 'lucide-react-native';

export const CounselorCard = ({ counselor }: { counselor: Counselor }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const profile = counselor.profiles;

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
          <Image
            source={{ uri: profile?.avatar_url || 'https://example.com/default-avatar.png' }}
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.name}>{profile?.full_name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#FBBF24" fill="#FBBF24" />
              <Text style={styles.ratingText}>4.9 (120 reviews)</Text>
            </View>
          </View>
        </View>
        
        {/* The Text component for the non-existent 'bio' has been removed */}

        <View style={styles.tagsContainer}>
          {counselor.specialties?.slice(0, 3).map((specialty, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{specialty}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.divider} />
        
        <Button onPress={() => setModalVisible(true)}>
          View Availability & Book
        </Button>
      </View>

      <BookingModal
        counselor={counselor}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

// Your original styles are preserved
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // Added margin here to space it from the tags
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  headerText: {
    marginLeft: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: '#6B7280',
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#4338CA',
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
});