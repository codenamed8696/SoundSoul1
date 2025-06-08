import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Filter,
  Video,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

const sessionTypes = [
  { id: 'video', label: 'Video', icon: Video, color: '#6366f1' },
  { id: 'audio', label: 'Audio', icon: Phone, color: '#10b981' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, color: '#f59e0b' },
];

export default function CounselorScheduleScreen() {
  const { user } = useAuth();
  const { appointments } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const counselorAppointments = appointments.filter(apt => apt.counselorId === user?.id);
  const currentAppointments = counselorAppointments.filter(apt => 
    apt.scheduledDate.split('T')[0] === selectedDate
  );

  const getSessionTypeIcon = (type: string) => {
    const sessionType = sessionTypes.find(t => t.id === type);
    if (!sessionType) return Video;
    return sessionType.icon;
  };

  const getSessionTypeColor = (type: string) => {
    const sessionType = sessionTypes.find(t => t.id === type);
    return sessionType?.color || '#6b7280';
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 1);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const handleAppointmentAction = (appointmentId: string, action: string) => {
    console.log(`${action} appointment ${appointmentId}`);
  };

  const handleAddAppointment = () => {
    console.log('Add new appointment');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Schedule</Text>
          <Text style={styles.subtitle}>
            Manage your therapy sessions and appointments
          </Text>
        </View>

        {/* Date Navigation */}
        <View style={styles.section}>
          <View style={styles.dateNavigation}>
            <Pressable 
              style={styles.dateNavButton}
              onPress={() => handleDateChange('prev')}
            >
              <ChevronLeft size={20} color="#6b7280" />
            </Pressable>
            
            <View style={styles.dateDisplay}>
              <Text style={styles.dateText}>
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            
            <Pressable 
              style={styles.dateNavButton}
              onPress={() => handleDateChange('next')}
            >
              <ChevronRight size={20} color="#6b7280" />
            </Pressable>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Calendar size={24} color="#6366f1" />
              <Text style={styles.statValue}>{currentAppointments.length}</Text>
              <Text style={styles.statLabel}>Today's Sessions</Text>
            </Card>

            <Card style={styles.statCard}>
              <Clock size={24} color="#10b981" />
              <Text style={styles.statValue}>
                {currentAppointments.reduce((total, apt) => total + apt.duration, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Minutes</Text>
            </Card>

            <Card style={styles.statCard}>
              <Plus size={24} color="#f59e0b" />
              <Text style={styles.statValue}>
                {8 - currentAppointments.length}
              </Text>
              <Text style={styles.statLabel}>Available Slots</Text>
            </Card>
          </View>
        </View>

        {/* Add Appointment */}
        <View style={styles.section}>
          <Button
            title="Schedule New Appointment"
            onPress={handleAddAppointment}
            style={styles.addButton}
          />
        </View>

        {/* Appointments List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {currentAppointments.length > 0 ? 'Today\'s Appointments' : 'No Appointments Today'}
          </Text>
          
          {currentAppointments.length > 0 ? (
            <View style={styles.appointmentsList}>
              {currentAppointments.map((appointment) => {
                const SessionIcon = getSessionTypeIcon(appointment.type);
                return (
                  <Card key={appointment.id} style={styles.appointmentCard}>
                    <View style={styles.appointmentHeader}>
                      <View style={styles.appointmentTime}>
                        <Clock size={16} color="#6b7280" />
                        <Text style={styles.timeText}>
                          {new Date(appointment.scheduledDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                        <Text style={styles.durationText}>
                          ({appointment.duration}min)
                        </Text>
                      </View>
                      
                      <View style={styles.appointmentType}>
                        <View style={[
                          styles.typeIcon,
                          { backgroundColor: getSessionTypeColor(appointment.type) }
                        ]}>
                          <SessionIcon size={16} color="#ffffff" />
                        </View>
                        <Text style={styles.typeText}>
                          {appointment.type}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.appointmentDetails}>
                      <Text style={styles.clientText}>
                        Anonymous Client #{appointment.userAnonymousId.slice(-6)}
                      </Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: appointment.status === 'confirmed' ? '#10b981' : '#f59e0b' }
                      ]}>
                        <Text style={styles.statusText}>
                          {appointment.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {appointment.notes && (
                      <Text style={styles.appointmentNotes}>{appointment.notes}</Text>
                    )}

                    <View style={styles.appointmentActions}>
                      <Button
                        title="Join"
                        onPress={() => handleAppointmentAction(appointment.id, 'join')}
                        size="small"
                        style={styles.actionButton}
                      />
                      <Button
                        title="Reschedule"
                        onPress={() => handleAppointmentAction(appointment.id, 'reschedule')}
                        variant="ghost"
                        size="small"
                        style={styles.actionButton}
                      />
                      <Button
                        title="Notes"
                        onPress={() => handleAppointmentAction(appointment.id, 'notes')}
                        variant="ghost"
                        size="small"
                        style={styles.actionButton}
                      />
                    </View>
                  </Card>
                );
              })}
            </View>
          ) : (
            <Card style={styles.emptyState}>
              <Calendar size={64} color="#d1d5db" />
              <Text style={styles.emptyStateTitle}>No appointments scheduled</Text>
              <Text style={styles.emptyStateText}>
                You have a free day! Use this time for self-care or administrative tasks.
              </Text>
            </Card>
          )}
        </View>

        {/* Session Types Legend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Types</Text>
          <View style={styles.sessionTypesGrid}>
            {sessionTypes.map((type) => (
              <Card key={type.id} style={styles.sessionTypeCard}>
                <View style={[
                  styles.sessionTypeIcon,
                  { backgroundColor: type.color }
                ]}>
                  <type.icon size={20} color="#ffffff" />
                </View>
                <Text style={styles.sessionTypeLabel}>{type.label}</Text>
              </Card>
            ))}
          </View>
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
  header: {
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dateNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
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
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  addButton: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  appointmentsList: {
    gap: 16,
  },
  appointmentCard: {
    padding: 20,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  durationText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  appointmentType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'capitalize',
  },
  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  appointmentNotes: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 20,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  sessionTypesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  sessionTypeCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  sessionTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sessionTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  bottomSpacing: {
    height: 20,
  },
});