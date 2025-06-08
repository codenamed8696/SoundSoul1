import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Search, Filter, Calendar, MessageCircle, TrendingUp, TriangleAlert as AlertTriangle, Shield, Clock } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

const riskFilters = [
  { id: 'all', label: 'All Clients', color: '#6b7280' },
  { id: 'low', label: 'Low Risk', color: '#10b981' },
  { id: 'medium', label: 'Medium Risk', color: '#f59e0b' },
  { id: 'high', label: 'High Risk', color: '#ef4444' },
];

export default function CounselorClientsScreen() {
  const { user } = useAuth();
  const { appointments } = useData();
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Get unique clients from appointments for this counselor
  const counselorAppointments = appointments.filter(apt => apt.counselorId === user?.id);
  const uniqueClients = counselorAppointments.reduce((clients, apt) => {
    const existingClient = clients.find(c => c.anonymousId === apt.userAnonymousId);
    if (!existingClient) {
      // Create client data from appointments
      const clientAppointments = counselorAppointments.filter(a => a.userAnonymousId === apt.userAnonymousId);
      const lastSession = clientAppointments
        .filter(a => a.status === 'completed')
        .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())[0];
      const nextSession = clientAppointments
        .filter(a => new Date(a.scheduledDate) > new Date() && a.status !== 'cancelled')
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())[0];
      
      clients.push({
        id: apt.userAnonymousId,
        anonymousId: `Client #${apt.userAnonymousId.slice(-6)}`,
        riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low', // Demo risk assessment
        lastSession: lastSession?.scheduledDate || null,
        nextSession: nextSession?.scheduledDate || null,
        totalSessions: clientAppointments.filter(a => a.status === 'completed').length,
        moodTrend: Math.random() > 0.6 ? 'improving' : Math.random() > 0.3 ? 'stable' : 'declining',
        notes: 'Client progress notes would be stored securely and anonymously',
        sessionType: apt.type,
      });
    }
    return clients;
  }, [] as any[]);

  const filteredClients = selectedFilter === 'all' 
    ? uniqueClients 
    : uniqueClients.filter(client => client.riskLevel === selectedFilter);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '↗️';
      case 'declining': return '↘️';
      case 'stable': return '→';
      default: return '→';
    }
  };

  const handleClientAction = (clientId: string, action: string) => {
    console.log(`${action} for client ${clientId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Client Management</Text>
            <Text style={styles.subtitle}>
              Anonymous client overview and care coordination
            </Text>
          </View>
          <View style={styles.privacyBadge}>
            <Shield size={16} color="#10b981" />
            <Text style={styles.privacyText}>Anonymous</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Overview</Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Users size={24} color="#6366f1" />
              <Text style={styles.statValue}>{uniqueClients.length}</Text>
              <Text style={styles.statLabel}>Active Clients</Text>
            </Card>

            <Card style={styles.statCard}>
              <Calendar size={24} color="#10b981" />
              <Text style={styles.statValue}>
                {uniqueClients.filter(c => c.nextSession).length}
              </Text>
              <Text style={styles.statLabel}>Upcoming Sessions</Text>
            </Card>

            <Card style={styles.statCard}>
              <AlertTriangle size={24} color="#f59e0b" />
              <Text style={styles.statValue}>
                {uniqueClients.filter(c => c.riskLevel === 'high').length}
              </Text>
              <Text style={styles.statLabel}>High Risk</Text>
            </Card>
          </View>
        </View>

        {/* Risk Level Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter by Risk Level</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
          >
            {riskFilters.map((filter) => (
              <Pressable
                key={filter.id}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.id && styles.filterButtonActive,
                  { borderColor: filter.color }
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter.id && { color: filter.color }
                ]}>
                  {filter.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Client List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedFilter === 'all' ? 'All Clients' : `${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Risk Clients`}
          </Text>
          <View style={styles.clientsList}>
            {filteredClients.map((client) => (
              <Card key={client.id} style={styles.clientCard}>
                <View style={styles.clientHeader}>
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientId}>{client.anonymousId}</Text>
                    <View style={[
                      styles.riskBadge,
                      { backgroundColor: getRiskColor(client.riskLevel) }
                    ]}>
                      <Text style={styles.riskText}>
                        {client.riskLevel.toUpperCase()} RISK
                      </Text>
                    </View>
                  </View>
                  <View style={styles.trendIndicator}>
                    <Text style={styles.trendEmoji}>{getTrendIcon(client.moodTrend)}</Text>
                    <Text style={styles.trendText}>{client.moodTrend}</Text>
                  </View>
                </View>

                <View style={styles.clientDetails}>
                  {client.lastSession && (
                    <View style={styles.detailRow}>
                      <Calendar size={16} color="#6b7280" />
                      <Text style={styles.detailText}>
                        Last: {new Date(client.lastSession).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {client.nextSession && (
                    <View style={styles.detailRow}>
                      <Clock size={16} color="#6b7280" />
                      <Text style={styles.detailText}>
                        Next: {new Date(client.nextSession).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <TrendingUp size={16} color="#6b7280" />
                    <Text style={styles.detailText}>
                      {client.totalSessions} sessions completed
                    </Text>
                  </View>
                </View>

                <Text style={styles.clientNotes}>{client.notes}</Text>

                <View style={styles.clientActions}>
                  <Button
                    title="Schedule"
                    onPress={() => handleClientAction(client.id, 'schedule')}
                    variant="ghost"
                    size="small"
                    style={styles.actionButton}
                  />
                  <Button
                    title="Message"
                    onPress={() => handleClientAction(client.id, 'message')}
                    variant="ghost"
                    size="small"
                    style={styles.actionButton}
                  />
                  <Button
                    title="Notes"
                    onPress={() => handleClientAction(client.id, 'notes')}
                    size="small"
                    style={styles.actionButton}
                  />
                </View>
              </Card>
            ))}
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={styles.section}>
          <Card style={styles.privacyCard}>
            <View style={styles.privacyHeader}>
              <Shield size={24} color="#6366f1" />
              <Text style={styles.privacyTitle}>Privacy & Anonymity</Text>
            </View>
            <Text style={styles.privacyText}>
              All client information is completely anonymized. No personally 
              identifiable information is stored or displayed. Client IDs are 
              randomly generated and cannot be traced back to individuals.
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
  filtersScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#f0f9ff',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  clientsList: {
    gap: 16,
  },
  clientCard: {
    padding: 20,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginRight: 12,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  trendIndicator: {
    alignItems: 'center',
  },
  trendEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  trendText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  clientDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  clientNotes: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 20,
  },
  clientActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  privacyCard: {
    padding: 20,
    backgroundColor: '#f0f9ff',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  privacyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  privacyText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});