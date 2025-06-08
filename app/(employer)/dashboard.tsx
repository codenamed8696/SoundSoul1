import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChartBar as BarChart3, Users, TrendingUp, Shield, Download, Calendar, Heart, MessageCircle, Activity, ArrowUp, ArrowDown } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useData } from '@/context/DataContext';

const timeRanges = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'This Quarter' },
  { id: 'year', label: 'This Year' },
];

export default function EmployerDashboardScreen() {
  const { getCompanyAnalytics, fetchCompanyAnalytics, loading } = useData();
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  
  // Demo company token for analytics
  const analytics = getCompanyAnalytics('ABC-1234-DEMO-5678');

  const handleDownloadReport = () => {
    // In a real app, this would generate and download a PDF report
    console.log('Downloading analytics report...');
  };

  const handleRefreshAnalytics = () => {
    fetchCompanyAnalytics('ABC-1234-DEMO-5678');
  };

  if (loading.companyAnalytics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
          <Text style={styles.loadingSubtext}>Applying privacy protection...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load analytics</Text>
          <Button
            title="Retry"
            onPress={handleRefreshAnalytics}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Wellness Analytics</Text>
            <Text style={styles.subtitle}>
              Anonymous employee wellness insights
            </Text>
          </View>
          <View style={styles.privacyBadge}>
            <Shield size={16} color="#10b981" />
            <Text style={styles.privacyText}>Privacy Protected</Text>
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={styles.section}>
          <Card style={styles.privacyNotice}>
            <View style={styles.privacyNoticeHeader}>
              <Shield size={20} color="#6366f1" />
              <Text style={styles.privacyNoticeTitle}>Privacy-Enhanced Analytics</Text>
            </View>
            <Text style={styles.privacyNoticeText}>
              All data has been processed using Privacy-Enhancing Technologies (PETs):
            </Text>
            <View style={styles.privacyFeatures}>
              <Text style={styles.privacyFeature}>• Differential Privacy: Noise added to protect individual data</Text>
              <Text style={styles.privacyFeature}>• K-Anonymity: Groups smaller than 5 individuals are filtered</Text>
              <Text style={styles.privacyFeature}>• Data Minimization: Only necessary aggregated data is processed</Text>
            </View>
          </Card>
        </View>

        {/* Time Range Selector */}
        <View style={styles.section}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.timeRangeScroll}
          >
            {timeRanges.map((range) => (
              <Pressable
                key={range.id}
                style={[
                  styles.timeRangeButton,
                  selectedTimeRange === range.id && styles.timeRangeButtonActive
                ]}
                onPress={() => setSelectedTimeRange(range.id)}
              >
                <Text style={[
                  styles.timeRangeText,
                  selectedTimeRange === range.id && styles.timeRangeTextActive
                ]}>
                  {range.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <Card style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Users size={24} color="#6366f1" />
                <View style={styles.metricTrend}>
                  <ArrowUp size={16} color="#10b981" />
                  <Text style={styles.metricTrendText}>+12%</Text>
                </View>
              </View>
              <Text style={styles.metricValue}>{analytics.totalUsers}</Text>
              <Text style={styles.metricLabel}>Enrolled Employees</Text>
            </Card>

            <Card style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Activity size={24} color="#10b981" />
                <View style={styles.metricTrend}>
                  <ArrowUp size={16} color="#10b981" />
                  <Text style={styles.metricTrendText}>+8%</Text>
                </View>
              </View>
              <Text style={styles.metricValue}>{analytics.activeSessions}</Text>
              <Text style={styles.metricLabel}>Active This Week</Text>
            </Card>

            <Card style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Heart size={24} color="#ec4899" />
                <View style={styles.metricTrend}>
                  <ArrowUp size={16} color="#10b981" />
                  <Text style={styles.metricTrendText}>+0.3</Text>
                </View>
              </View>
              <Text style={styles.metricValue}>
                {analytics.moodTrends.average.toFixed(1)}
              </Text>
              <Text style={styles.metricLabel}>Average Mood</Text>
            </Card>
          </View>
        </View>

        {/* Mood Trends Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wellness Trends</Text>
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Employee Mood Trends</Text>
              <View style={[
                styles.trendIndicator,
                analytics.moodTrends.trend === 'up' && styles.trendUp,
                analytics.moodTrends.trend === 'down' && styles.trendDown
              ]}>
                {analytics.moodTrends.trend === 'up' ? (
                  <ArrowUp size={16} color="#10b981" />
                ) : analytics.moodTrends.trend === 'down' ? (
                  <ArrowDown size={16} color="#ef4444" />
                ) : (
                  <Activity size={16} color="#f59e0b" />
                )}
                <Text style={[
                  styles.trendText,
                  { color: analytics.moodTrends.trend === 'up' ? '#10b981' : 
                           analytics.moodTrends.trend === 'down' ? '#ef4444' : '#f59e0b' }
                ]}>
                  {analytics.moodTrends.trend.toUpperCase()}
                </Text>
              </View>
            </View>
            
            {/* Simple chart visualization */}
            <View style={styles.chartContainer}>
              {analytics.moodTrends.data.map((point, index) => (
                <View key={index} style={styles.chartBar}>
                  <View style={[
                    styles.chartBarFill,
                    { height: `${(point.value / 5) * 100}%` }
                  ]} />
                  <Text style={styles.chartBarLabel}>
                    {new Date(point.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Service Utilization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Utilization</Text>
          <View style={styles.utilizationGrid}>
            <Card style={styles.utilizationCard}>
              <View style={styles.utilizationHeader}>
                <MessageCircle size={20} color="#6366f1" />
                <Text style={styles.utilizationTitle}>AI Chat</Text>
              </View>
              <Text style={styles.utilizationValue}>
                {analytics.utilization.aiChat}%
              </Text>
              <Text style={styles.utilizationLabel}>Employee Engagement</Text>
            </Card>

            <Card style={styles.utilizationCard}>
              <View style={styles.utilizationHeader}>
                <Calendar size={20} color="#10b981" />
                <Text style={styles.utilizationTitle}>Therapy</Text>
              </View>
              <Text style={styles.utilizationValue}>
                {analytics.utilization.therapy}%
              </Text>
              <Text style={styles.utilizationLabel}>Sessions Booked</Text>
            </Card>

            <Card style={styles.utilizationCard}>
              <View style={styles.utilizationHeader}>
                <Heart size={20} color="#f59e0b" />
                <Text style={styles.utilizationTitle}>Resources</Text>
              </View>
              <Text style={styles.utilizationValue}>
                {analytics.utilization.resources}%
              </Text>
              <Text style={styles.utilizationLabel}>Content Accessed</Text>
            </Card>
          </View>
        </View>

        {/* Demographics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Anonymous Demographics</Text>
          <View style={styles.demographicsContainer}>
            <Card style={styles.demographicsCard}>
              <Text style={styles.demographicsTitle}>Age Distribution</Text>
              {analytics.demographics.ageGroups.map((group, index) => (
                <View key={index} style={styles.demographicsItem}>
                  <Text style={styles.demographicsLabel}>{group.range}</Text>
                  <View style={styles.demographicsBar}>
                    <View style={[
                      styles.demographicsBarFill,
                      { width: `${(group.count / analytics.totalUsers) * 100}%` }
                    ]} />
                  </View>
                  <Text style={styles.demographicsValue}>{group.count}</Text>
                </View>
              ))}
            </Card>

            <Card style={styles.demographicsCard}>
              <Text style={styles.demographicsTitle}>Risk Levels</Text>
              {analytics.demographics.riskLevels.map((level, index) => (
                <View key={index} style={styles.demographicsItem}>
                  <Text style={styles.demographicsLabel}>{level.level}</Text>
                  <View style={styles.demographicsBar}>
                    <View style={[
                      styles.demographicsBarFill,
                      { 
                        width: `${level.percentage}%`,
                        backgroundColor: level.level === 'Low' ? '#10b981' : 
                                       level.level === 'Medium' ? '#f59e0b' : '#ef4444'
                      }
                    ]} />
                  </View>
                  <Text style={styles.demographicsValue}>{level.percentage}%</Text>
                </View>
              ))}
            </Card>
          </View>
        </View>

        {/* Export Report */}
        <View style={styles.section}>
          <Card style={styles.exportCard}>
            <View style={styles.exportHeader}>
              <Download size={24} color="#6366f1" />
              <View style={styles.exportText}>
                <Text style={styles.exportTitle}>Download Report</Text>
                <Text style={styles.exportSubtitle}>
                  Generate a comprehensive wellness analytics report
                </Text>
              </View>
            </View>
            <Button
              title="Generate Report"
              onPress={handleDownloadReport}
              style={styles.exportButton}
            />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 16,
  },
  retryButton: {
    minWidth: 120,
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
  privacyNotice: {
    padding: 20,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  privacyNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  privacyNoticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  privacyNoticeText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  privacyFeatures: {
    gap: 4,
  },
  privacyFeature: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  timeRangeScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timeRangeButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  timeRangeTextActive: {
    color: '#ffffff',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricTrendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
    marginLeft: 4,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  chartCard: {
    padding: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendUp: {
    backgroundColor: '#f0fdf4',
  },
  trendDown: {
    backgroundColor: '#fef2f2',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  chartBarFill: {
    backgroundColor: '#6366f1',
    width: '80%',
    borderRadius: 4,
    minHeight: 4,
  },
  chartBarLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  utilizationGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  utilizationCard: {
    flex: 1,
    padding: 16,
  },
  utilizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  utilizationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  utilizationValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  utilizationLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  demographicsContainer: {
    gap: 16,
  },
  demographicsCard: {
    padding: 20,
  },
  demographicsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  demographicsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  demographicsLabel: {
    fontSize: 14,
    color: '#374151',
    width: 80,
  },
  demographicsBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  demographicsBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  demographicsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    width: 40,
    textAlign: 'right',
  },
  exportCard: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exportText: {
    marginLeft: 16,
    flex: 1,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  exportSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  exportButton: {
    marginLeft: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});