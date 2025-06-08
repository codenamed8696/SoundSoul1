import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Download, Calendar, Filter, Shield, ChartBar as BarChart3, TrendingUp, Users, Heart, Clock } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

const reportTypes = [
  {
    id: 'weekly',
    title: 'Weekly Summary',
    description: 'High-level wellness metrics and trends',
    icon: Calendar,
    frequency: 'Weekly',
    lastGenerated: '2024-12-01',
  },
  {
    id: 'monthly',
    title: 'Monthly Analytics',
    description: 'Comprehensive monthly wellness report',
    icon: BarChart3,
    frequency: 'Monthly',
    lastGenerated: '2024-11-30',
  },
  {
    id: 'quarterly',
    title: 'Quarterly Review',
    description: 'Detailed quarterly program assessment',
    icon: TrendingUp,
    frequency: 'Quarterly',
    lastGenerated: '2024-09-30',
  },
  {
    id: 'custom',
    title: 'Custom Report',
    description: 'Generate reports for specific date ranges',
    icon: Filter,
    frequency: 'On Demand',
    lastGenerated: '2024-11-28',
  },
];

const recentReports = [
  {
    id: '1',
    title: 'November 2024 Wellness Summary',
    type: 'Monthly Analytics',
    generatedDate: '2024-12-01',
    size: '2.4 MB',
    status: 'ready',
  },
  {
    id: '2',
    title: 'Week of Nov 25-Dec 1 Summary',
    type: 'Weekly Summary',
    generatedDate: '2024-12-01',
    size: '856 KB',
    status: 'ready',
  },
  {
    id: '3',
    title: 'Q3 2024 Quarterly Review',
    type: 'Quarterly Review',
    generatedDate: '2024-10-02',
    size: '4.7 MB',
    status: 'ready',
  },
  {
    id: '4',
    title: 'October 2024 Custom Analysis',
    type: 'Custom Report',
    generatedDate: '2024-11-01',
    size: '3.1 MB',
    status: 'ready',
  },
];

export default function EmployerReportsScreen() {
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);

  const handleGenerateReport = (reportType: string) => {
    console.log('Generating report:', reportType);
    // In a real app, this would trigger report generation
  };

  const handleDownloadReport = (reportId: string) => {
    console.log('Downloading report:', reportId);
    // In a real app, this would download the report file
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Wellness Reports</Text>
            <Text style={styles.subtitle}>
              Privacy-compliant analytics and insights
            </Text>
          </View>
          <View style={styles.privacyBadge}>
            <Shield size={16} color="#10b981" />
            <Text style={styles.privacyText}>Anonymous</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Overview</Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <FileText size={24} color="#6366f1" />
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Reports Generated</Text>
            </Card>

            <Card style={styles.statCard}>
              <Download size={24} color="#10b981" />
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Downloads</Text>
            </Card>

            <Card style={styles.statCard}>
              <Clock size={24} color="#f59e0b" />
              <Text style={styles.statValue}>2 days</Text>
              <Text style={styles.statLabel}>Last Generated</Text>
            </Card>
          </View>
        </View>

        {/* Report Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generate New Report</Text>
          <View style={styles.reportTypes}>
            {reportTypes.map((reportType) => (
              <Pressable
                key={reportType.id}
                style={[
                  styles.reportTypeCard,
                  selectedReportType === reportType.id && styles.reportTypeCardSelected
                ]}
                onPress={() => setSelectedReportType(
                  selectedReportType === reportType.id ? null : reportType.id
                )}
              >
                <View style={styles.reportTypeHeader}>
                  <View style={styles.reportTypeIcon}>
                    <reportType.icon size={24} color="#6366f1" />
                  </View>
                  <View style={styles.reportTypeInfo}>
                    <Text style={styles.reportTypeTitle}>{reportType.title}</Text>
                    <Text style={styles.reportTypeDescription}>
                      {reportType.description}
                    </Text>
                  </View>
                  <View style={styles.reportTypeFrequency}>
                    <Text style={styles.frequencyText}>{reportType.frequency}</Text>
                  </View>
                </View>
                <View style={styles.reportTypeFooter}>
                  <Text style={styles.lastGenerated}>
                    Last: {new Date(reportType.lastGenerated).toLocaleDateString()}
                  </Text>
                  {selectedReportType === reportType.id && (
                    <Button
                      title="Generate"
                      onPress={() => handleGenerateReport(reportType.id)}
                      size="small"
                      style={styles.generateButton}
                    />
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recent Reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <View style={styles.recentReports}>
            {recentReports.map((report) => (
              <Card key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text style={styles.reportType}>{report.type}</Text>
                  </View>
                  <View style={styles.reportStatus}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: report.status === 'ready' ? '#10b981' : '#f59e0b' }
                    ]} />
                    <Text style={styles.statusText}>
                      {report.status === 'ready' ? 'Ready' : 'Processing'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.reportDetails}>
                  <View style={styles.reportMeta}>
                    <Text style={styles.reportDate}>
                      Generated: {new Date(report.generatedDate).toLocaleDateString()}
                    </Text>
                    <Text style={styles.reportSize}>Size: {report.size}</Text>
                  </View>
                  
                  {report.status === 'ready' && (
                    <Button
                      title="Download"
                      onPress={() => handleDownloadReport(report.id)}
                      variant="ghost"
                      size="small"
                      style={styles.downloadButton}
                    />
                  )}
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
              <Text style={styles.privacyTitle}>Privacy Protection</Text>
            </View>
            <Text style={styles.privacyText}>
              All reports contain only aggregated, anonymized data. Individual employee 
              information is never included or identifiable. Data is processed using 
              differential privacy techniques to ensure complete anonymity while 
              providing valuable insights.
            </Text>
            <View style={styles.privacyFeatures}>
              <View style={styles.privacyFeature}>
                <Text style={styles.privacyFeatureText}>• Differential Privacy Applied</Text>
              </View>
              <View style={styles.privacyFeature}>
                <Text style={styles.privacyFeatureText}>• Minimum 5 Data Points Required</Text>
              </View>
              <View style={styles.privacyFeature}>
                <Text style={styles.privacyFeatureText}>• No Individual Identification</Text>
              </View>
              <View style={styles.privacyFeature}>
                <Text style={styles.privacyFeatureText}>• HIPAA & GDPR Compliant</Text>
              </View>
            </View>
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
  reportTypes: {
    gap: 12,
  },
  reportTypeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  reportTypeCardSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f9ff',
  },
  reportTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reportTypeInfo: {
    flex: 1,
  },
  reportTypeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  reportTypeDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  reportTypeFrequency: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed',
  },
  reportTypeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastGenerated: {
    fontSize: 12,
    color: '#9ca3af',
  },
  generateButton: {
    minWidth: 100,
  },
  recentReports: {
    gap: 12,
  },
  reportCard: {
    padding: 20,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  reportType: {
    fontSize: 14,
    color: '#6b7280',
  },
  reportStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  reportDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportMeta: {
    flex: 1,
  },
  reportDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  reportSize: {
    fontSize: 12,
    color: '#9ca3af',
  },
  downloadButton: {
    marginLeft: 16,
  },
  privacyCard: {
    padding: 24,
    backgroundColor: '#f0f9ff',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 16,
  },
  privacyFeatures: {
    gap: 8,
  },
  privacyFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyFeatureText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
});