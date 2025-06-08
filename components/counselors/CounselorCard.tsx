import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Star, Clock, Award } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Counselor } from '@/types';

interface CounselorCardProps {
  counselor: Counselor;
  onBook: (counselor: Counselor) => void;
  onViewProfile: (counselor: Counselor) => void;
}

export function CounselorCard({ counselor, onBook, onViewProfile }: CounselorCardProps) {
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: counselor.image }} 
          style={styles.avatar}
          defaultSource={undefined}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{counselor.name}</Text>
          <View style={styles.rating}>
            <Star size={16} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.ratingText}>{counselor.rating}</Text>
            <Text style={styles.ratingSubtext}>({counselor.experience} years)</Text>
          </View>
          <View style={styles.price}>
            <Text style={styles.priceText}>${counselor.pricePerSession}/session</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.specialties}>
        {counselor.specialties.map((specialty, index) => (
          <View key={index} style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{specialty}</Text>
          </View>
        ))}
      </View>
      
      <Text style={styles.bio} numberOfLines={3}>
        {counselor.bio}
      </Text>
      
      <View style={styles.credentials}>
        <Award size={16} color="#6b7280" />
        <Text style={styles.credentialsText}>
          {counselor.credentials.join(' • ')}
        </Text>
      </View>
      
      <View style={styles.availability}>
        <Clock size={16} color="#10b981" />
        <Text style={styles.availabilityText}>Available this week</Text>
      </View>
      
      <View style={styles.actions}>
        <Button
          title="View Profile"
          onPress={() => onViewProfile(counselor)}
          variant="ghost"
          style={styles.actionButton}
        />
        <Button
          title="Book Session"
          onPress={() => onBook(counselor)}
          style={styles.actionButton}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
  },
  ratingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  price: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  specialtyTag: {
    backgroundColor: '#ede9fe',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed',
  },
  bio: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  credentials: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  credentialsText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
    flex: 1,
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  availabilityText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});