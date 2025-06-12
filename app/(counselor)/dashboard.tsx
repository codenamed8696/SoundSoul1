import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calendar, 
  Users, 
  MessageCircle, 
  Clock,
  TrendingUp,
  Heart,
  Shield,
  Star
} from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { RecentActivity, Appointment } from '@/types';

// Helper function to render the correct icon based on activity type
const renderActivityIcon = (type: RecentActivity['type']) => {
  switch (type) {
    case 'message':
      return <MessageCircle size={16} color="#6366f1" />;
    case 'session':
      return <Calendar size={16} color="#10b981" />;
    case 'rating':
      return <Star size={16} color="#f59e0b" />;
    default:
      return null;
  }
};

// Helper function to format the timestamp into a readable string
const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";

    return "Just now";
};


export default function CounselorDashboardScreen() {
  const { profile } = useAuth();
  const { appointments, counselorStats, recentActivity, loading } = useData();

  // The loading check now looks at all the specific data needed for this screen.
  if (loading.counselorStats || loading.appointments || loading.recentActivity) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // Filter appointments for today
  const todayAppointments = (Array.isArray(appointments) ? appointments : []).filter(apt => {
    const today = new Date().toDateString();
    return new Date(apt.appointment_time).toDateString() === today;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Counselor Dashboard</Text>
            <Text style={styles.subtitle}>
              Welcome back, {profile?.full_name || 'Dr. Sarah Chen'}
            </Text>
          </View>
          <View style={styles.privacyBadge}>
            <Shield size={16} color="#10b981" />
            <Text style={styles.privacyText}>Secure</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <Calendar size={24} color="#6366f1" />
                <Text style={styles.statValue}>{todayAppointments.length}</Text>
              </View>
              <Text style={styles.statLabel}>Today's Sessions</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <Clock size={24} color="#10b981" />
                <Text style={styles.statValue}>{counselorStats?.upcomingAppointments ?? '...'}</Text>
              </View>
              <Text style={styles.statLabel}>Upcoming</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <MessageCircle size={24} color="#f59e0b" />
                <Text style={styles.statValue}>{counselorStats?.unreadMessages ?? '...'}</Text>
              </View>
              <Text style={styles.statLabel}>New Messages</Text>
            </Card>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.metricsGrid}>
            <Card style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Users size={20} color="#6366f1" />
                <Text style={styles.metricTitle}>Total Clients</Text>
              </View>
              <Text style={styles.metricValue}>{counselorStats?.totalClients ?? '...'}</Text>
              <Text style={styles.metricTrend}>+3 this month</Text>
            </Card>

            <Card style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <TrendingUp size={20} color="#10b981" />
                <Text style={styles.metricTitle}>Sessions Completed</Text>
              </View>
              <Text style={styles.metricValue}>{counselorStats?.sessionsCompleted ?? '...'}</Text>
              <Text style={styles.metricTrend}>+12 this month</Text>
            </Card>

            <Card style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Star size={20} color="#f59e0b" />
                <Text style={styles.metricTitle}>Average Rating</Text>
              </View>
              <Text style={styles.metricValue}>{counselorStats?.averageRating ?? '...'}</Text>
              <Text style={styles.metricTrend}>Excellent</Text>
            </Card>
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          {todayAppointments.length > 0 ? (
            <View style={styles.scheduleList}>
              {todayAppointments.map((appointment) => (
                <Card key={appointment.id} style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.appointmentTime}>
                      <Clock size={16} color="#6b7280" />
                      <Text style={styles.timeText}>
                        {new Date(appointment.appointment_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                    <View style={[
                      styles.sessionTypeBadge,
                      { backgroundColor: appointment.type === 'video' ? '#6366f1' : 
                                       appointment.type === 'audio' ? '#10b981' : '#f59e0b' }
                    ]}>
                      <Text style={styles.sessionTypeText}>
                        {appointment.type}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.appointmentClient}>
                    Anonymous Client #{appointment.user_id.slice(-6)}
                  </Text>
                  <Text style={styles.appointmentDuration}>
                    {appointment.duration} minutes • {appointment.status}
                  </Text>
                </Card>
              ))}
            </View>
          ) : (
            <Card style={styles.emptySchedule}>
              <Calendar size={48} color="#d1d5db" />
              <Text style={styles.emptyScheduleTitle}>No sessions today</Text>
              <Text style={styles.emptyScheduleText}>
                Enjoy your day off or check your upcoming schedule
              </Text>
            </Card>
          )}
        </View>

        {/* --- RECENT ACTIVITY (NOW FUNCTIONAL) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Card style={styles.activityCard}>
            {(Array.isArray(recentActivity) ? recentActivity : []).map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  {renderActivityIcon(activity.type)}
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityTime}>{formatTimeAgo(activity.timestamp)}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Wellness Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Wellness</Text>
          <Card style={styles.wellnessCard}>
            <View style={styles.wellnessHeader}>
              <Heart size={24} color="#ec4899" />
              <Text style={styles.wellnessTitle}>Self-Care Reminder</Text>
            </View>
            <Text style={styles.wellnessText}>
              Remember to take breaks between sessions and practice the wellness 
              techniques you recommend to your clients. Your well-being matters too.
            </Text>
          </Card>
        </View>

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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  metricsGrid: {
    gap: 12,
  },
  metricCard: {
    padding: 20,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  metricTrend: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  scheduleList: {
    gap: 12,
  },
  appointmentCard: {
    padding: 16,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 6,
  },
  sessionTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionTypeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  appointmentClient: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  appointmentDuration: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  emptySchedule: {
    padding: 40,
    alignItems: 'center',
  },
  emptyScheduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyScheduleText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  activityCard: {
    padding: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  wellnessCard: {
    padding: 20,
    backgroundColor: '#fdf2f8',
  },
  wellnessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  wellnessTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  wellnessText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});