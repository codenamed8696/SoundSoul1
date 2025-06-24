import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, MessageCircle, Calendar, TrendingUp, Shield, Plus } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { MoodTracker } from '@/components/mood/MoodTracker';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const { moodEntries, appointments, getUserInsights } = useData();
  const [insights, setInsights] = useState<any>(null);

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.appointment_time) > new Date() && apt.status !== 'cancelled'
  ).slice(0, 2);

  useEffect(() => {
    if (user) {
      getUserInsights().then(setInsights);
    }
  }, [user, getUserInsights]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'chat':
        router.push('/(tabs)/chat');
        break;
      case 'book':
        router.push('/(tabs)/appointments');
        break;
      case 'wellness':
        router.push('/(tabs)/wellness');
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, there
            </Text>
            <Text style={styles.subtitle}>How are you feeling today?</Text>
          </View>
          <View style={styles.privacyBadge}>
            <Shield size={16} color="#10b981" />
            <Text style={styles.privacyText}>Anonymous</Text>
          </View>
        </View>

        {/* Mood Tracker */}
        <View style={styles.section}>
          <MoodTracker />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Pressable 
              style={styles.quickAction}
              onPress={() => handleQuickAction('chat')}
            >
              <MessageCircle size={24} color="#6366f1" />
              <Text style={styles.quickActionText}>AI Chat</Text>
            </Pressable>
            
            <Pressable 
              style={styles.quickAction}
              onPress={() => handleQuickAction('book')}
            >
              <Calendar size={24} color="#10b981" />
              <Text style={styles.quickActionText}>Book Therapy</Text>
            </Pressable>
            
            <Pressable 
              style={styles.quickAction}
              onPress={() => handleQuickAction('wellness')}
            >
              <Heart size={24} color="#ec4899" />
              <Text style={styles.quickActionText}>Wellness</Text>
            </Pressable>
          </View>
        </View>

        {/* Wellness Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Wellness Journey</Text>
          <Card style={styles.insightsCard}>
            <View style={styles.insightsGrid}>
              <View style={styles.insightItem}>
                <TrendingUp size={20} color="#6366f1" />
                <Text style={styles.insightValue}>
                  {insights?.mood_average?.toFixed(1) || '3.0'}
                </Text>
                <Text style={styles.insightLabel}>Mood Average</Text>
              </View>
              
              <View style={styles.insightItem}>
                <Calendar size={20} color="#10b981" />
                <Text style={styles.insightValue}>
                  {insights?.streak || 0}
                </Text>
                <Text style={styles.insightLabel}>Day Streak</Text>
              </View>
              
              <View style={styles.insightItem}>
                <Heart size={20} color="#ec4899" />
                <Text style={styles.insightValue}>
                  {insights?.sessions_completed || 0}
                </Text>
                <Text style={styles.insightLabel}>Sessions</Text>
              </View>
            </View>
            
            <View style={styles.trendContainer}>
              <Text style={styles.trendText}>
                Your mood is stable
              </Text>
              <View style={[
                styles.trendIndicator,
                { backgroundColor: '#f59e0b' }
              ]} />
            </View>
          </Card>
        </View>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <Calendar size={20} color="#6366f1" />
                  <Text style={styles.appointmentDate}>
                    {new Date(appointment.appointment_time).toLocaleDateString()}
                  </Text>
                  <Text style={styles.appointmentTime}>
                    {new Date(appointment.appointment_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <Text style={styles.appointmentType}>
                  {appointment.type} session
                </Text>
              </Card>
            ))}
          </View>
        )}

        {/* Recommendations */}
        {insights?.recommendations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <Card style={styles.recommendationsCard}>
              {insights.recommendations.map((recommendation: string, index: number) => (
                <View key={index} style={styles.recommendationItem}>
                  <Plus size={16} color="#6366f1" />
                  <Text style={styles.recommendationText}>{recommendation}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  privacyText: {
    color: '#10b981',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  insightsCard: {
    padding: 20,
  },
  insightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  insightItem: {
    alignItems: 'center',
  },
  insightValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    textAlign: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  trendText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginRight: 8,
  },
  trendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  appointmentCard: {
    padding: 16,
    marginBottom: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentDate: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  appointmentTime: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  appointmentType: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  recommendationsCard: {
    padding: 20,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  bottomSpacing: {
    height: 20,
  },
});