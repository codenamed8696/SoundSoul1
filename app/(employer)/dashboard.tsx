import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useData } from '@/context/DataContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, BarChart3, HeartPulse, MessageSquare } from 'lucide-react-native';
import { Card } from '@/components/common/Card';

const EmployerDashboardScreen = () => {
  const { companyAnalytics, loading } = useData();

  // The loading check now looks at the correct flag.
  if (loading.analytics) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!companyAnalytics) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Could not load company analytics data.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Company Wellness Dashboard</Text>
          <Text style={styles.subtitle}>Aggregated and anonymized employee metrics</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.card}><Users size={24} color="#3b82f6" /><Text style={styles.cardTitle}>Enrolled Employees</Text><Text style={styles.cardValue}>{companyAnalytics.totalUsers}</Text></View>
          <View style={styles.card}><BarChart3 size={24} color="#8b5cf6" /><Text style={styles.cardTitle}>Weekly Active</Text><Text style={styles.cardValue}>{companyAnalytics.activeSessions}</Text></View>
        </View>

        <View style={styles.fullCard}><HeartPulse size={24} color="#ec4899" /><Text style={styles.cardTitle}>Overall Mood Trend</Text><Text style={styles.cardValue}>{companyAnalytics.moodTrends.average.toFixed(1)} / 5.0</Text></View>
        <View style={styles.fullCard}><MessageSquare size={24} color="#10b981" /><Text style={styles.cardTitle}>Service Utilization</Text><View style={styles.utilizationRow}><Text style={styles.utilizationLabel}>AI Chat:</Text><Text style={styles.utilizationValue}>{companyAnalytics.utilization.aiChat}%</Text></View><View style={styles.utilizationRow}><Text style={styles.utilizationLabel}>Therapy Sessions:</Text><Text style={styles.utilizationValue}>{companyAnalytics.utilization.therapy}%</Text></View><View style={styles.utilizationRow}><Text style={styles.utilizationLabel}>Wellness Resources:</Text><Text style={styles.utilizationValue}>{companyAnalytics.utilization.resources}%</Text></View></View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scrollContent: { paddingBottom: 24 },
  header: { padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 16, color: '#6b7280', marginTop: 4 },
  errorText: { fontSize: 16, color: '#6b7280' },
  grid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, width: '48%', marginBottom: 16, alignItems: 'flex-start' },
  fullCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginHorizontal: 24, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginTop: 12 },
  cardValue: { fontSize: 32, fontWeight: 'bold', color: '#111827', marginTop: 4 },
  utilizationRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  utilizationLabel: { fontSize: 16, color: '#374151' },
  utilizationValue: { fontSize: 16, fontWeight: 'bold', color: '#111827' }
});

export default EmployerDashboardScreen;