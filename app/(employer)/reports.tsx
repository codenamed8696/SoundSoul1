import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Download, Calendar, Filter, Shield, ChartBar as BarChart3, TrendingUp, Clock } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useData } from '@/context/DataContext';
import { supabase } from '@/context/supabaseClient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Your existing UI data for the report types
const reportTypes = [
  { id: 'weekly', title: 'Weekly Summary', description: 'High-level wellness metrics and trends', icon: Calendar, frequency: 'Weekly', lastGenerated: '2024-12-01' },
  { id: 'monthly', title: 'Monthly Analytics', description: 'Comprehensive monthly wellness report', icon: BarChart3, frequency: 'Monthly', lastGenerated: '2024-11-30' },
  { id: 'quarterly', title: 'Quarterly Review', description: 'Detailed quarterly program assessment', icon: TrendingUp, frequency: 'Quarterly', lastGenerated: '2024-09-30' },
  { id: 'custom', title: 'Custom Report', description: 'Generate reports for specific date ranges', icon: Filter, frequency: 'On Demand', lastGenerated: '2024-11-28' },
];

export default function EmployerReportsScreen() {
  const { recentReports, fetchRecentReports, loading } = useData();
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch the reports when the component first loads
  useEffect(() => {
    fetchRecentReports();
  }, []);

  // This function now calls your Edge Function to generate a report
  const handleGenerateReport = async (reportType: string) => {
    setIsGenerating(true);
    Alert.alert("Generating Report", `Your ${reportType} report is being generated and will appear in the 'Recent Reports' list shortly.`);
    try {
      const { error } = await supabase.functions.invoke('export-data');
      if (error) throw error;
      await fetchRecentReports(); // Refresh the list of reports
    } catch (error) {
      Alert.alert("Error", `Could not generate report: ${(error as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // This function now downloads a stored report from Supabase Storage
  const handleDownloadReport = async (report) => {
    Alert.alert("Downloading Report", "Your report is being prepared for download.");
    try {
      const { data, error } = await supabase.storage
        .from('generated-reports')
        .download(report.file_path);
      
      if (error) throw error;

      // This logic handles saving the file on the user's device
      const fileReader = new FileReader();
      fileReader.readAsDataURL(data);
      fileReader.onload = async () => {
        const base64Data = (fileReader.result as string).split(',')[1];
        const fileName = report.file_path.split('/').pop() || `report-${report.id}.csv`;
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert("Sharing not available on this device.");
        }
      };
    } catch (error) {
      Alert.alert("Download Failed", `Could not download report: ${(error as Error).message}`);
    }
  };
  
  const lastGeneratedDate = recentReports.length > 0 ? new Date(recentReports[0].generated_at) : new Date();
  const daysSinceLast = Math.floor((new Date().getTime() - lastGeneratedDate.getTime()) / (1000 * 3600 * 24));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}><View><Text style={styles.title}>Wellness Reports</Text><Text style={styles.subtitle}>Privacy-compliant analytics and insights</Text></View><View style={styles.privacyBadge}><Shield size={16} color="#10b981" /><Text style={styles.privacyText}>Anonymous</Text></View></View>
        
        {loading.reports ? (
          <ActivityIndicator size="large" color="#6366f1" style={{ marginVertical: 40 }} />
        ) : (
          <>
            {/* Quick Stats (Your existing UI, now using live data) */}
            <View style={styles.section}><Text style={styles.sectionTitle}>Report Overview</Text><View style={styles.statsGrid}><Card style={styles.statCard}><FileText size={24} color="#6366f1" /><Text style={styles.statValue}>{recentReports.length}</Text><Text style={styles.statLabel}>Reports Generated</Text></Card><Card style={styles.statCard}><Download size={24} color="#10b981" /><Text style={styles.statValue}>8</Text><Text style={styles.statLabel}>Downloads</Text></Card><Card style={styles.statCard}><Clock size={24} color="#f59e0b" /><Text style={styles.statValue}>{daysSinceLast}</Text><Text style={styles.statLabel}>Days Since Last</Text></Card></View></View>
            
            {/* Report Types (Your existing UI, now functional) */}
            <View style={styles.section}><Text style={styles.sectionTitle}>Generate New Report</Text><View style={styles.reportTypes}>{reportTypes.map((reportType) => (<Pressable key={reportType.id} style={[styles.reportTypeCard, selectedReportType === reportType.id && styles.reportTypeCardSelected]} onPress={() => setSelectedReportType(selectedReportType === reportType.id ? null : reportType.id)}><View style={styles.reportTypeHeader}><View style={styles.reportTypeIcon}><reportType.icon size={24} color="#6366f1" /></View><View style={styles.reportTypeInfo}><Text style={styles.reportTypeTitle}>{reportType.title}</Text><Text style={styles.reportTypeDescription}>{reportType.description}</Text></View><View style={styles.reportTypeFrequency}><Text style={styles.frequencyText}>{reportType.frequency}</Text></View></View><View style={styles.reportTypeFooter}><Text style={styles.lastGenerated}>Last: {new Date(reportType.lastGenerated).toLocaleDateString()}</Text>{selectedReportType === reportType.id && (<Button title={isGenerating ? "Generating..." : "Generate"} onPress={() => handleGenerateReport(reportType.title)} size="small" style={styles.generateButton} disabled={isGenerating}/>)}</View></Pressable>))}</View></View>
            
            {/* Recent Reports (Your existing UI, now using live data) */}
            <View style={styles.section}><Text style={styles.sectionTitle}>Recent Reports</Text><View style={styles.recentReports}>{recentReports.length > 0 ? recentReports.map((report) => (<Card key={report.id} style={styles.reportCard}><View style={styles.reportHeader}><View style={styles.reportInfo}><Text style={styles.reportTitle}>{report.file_path.split('/').pop()}</Text><Text style={styles.reportType}>{report.report_type}</Text></View><View style={styles.reportStatus}><View style={[styles.statusDot, { backgroundColor: '#10b981' }]} /><Text style={styles.statusText}>Ready</Text></View></View><View style={styles.reportDetails}><View style={styles.reportMeta}><Text style={styles.reportDate}>Generated: {new Date(report.generated_at).toLocaleDateString()}</Text><Text style={styles.reportSize}>Size: {report.file_size_kb} KB</Text></View><Button title="Download" onPress={() => handleDownloadReport(report)} variant="ghost" size="small" style={styles.downloadButton} /></View></Card>)) : (<View style={styles.infoCard}><Text style={styles.statLabel}>No reports have been generated yet. Click "Generate" above to create your first report.</Text></View>)}</View></View>
            
            {/* Privacy Notice (Your existing UI) */}
            <View style={styles.section}><Card style={styles.privacyCard}><View style={styles.privacyHeader}><Shield size={24} color="#6366f1" /><Text style={styles.privacyTitle}>Privacy Protection</Text></View><Text style={styles.privacyText}>All reports contain only aggregated, anonymized data. Individual employee information is never included or identifiable. Data is processed using differential privacy techniques to ensure complete anonymity while providing valuable insights.</Text><View style={styles.privacyFeatures}><View style={styles.privacyFeature}><Text style={styles.privacyFeatureText}>• Differential Privacy Applied</Text></View><View style={styles.privacyFeature}><Text style={styles.privacyFeatureText}>• Minimum 5 Data Points Required</Text></View><View style={styles.privacyFeature}><Text style={styles.privacyFeatureText}>• No Individual Identification</Text></View><View style={styles.privacyFeature}><Text style={styles.privacyFeatureText}>• HIPAA & GDPR Compliant</Text></View></View></Card></View>
          </>
        )}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Your full stylesheet
  container: { flex: 1, backgroundColor: '#f8fafc', }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, }, title: { fontSize: 32, fontWeight: '700', color: '#111827', marginBottom: 8, }, subtitle: { fontSize: 16, color: '#6b7280', }, privacyBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#bbf7d0', }, privacyText: { color: '#10b981', fontSize: 12, fontWeight: '600', marginLeft: 6, }, section: { paddingHorizontal: 20, marginBottom: 24, }, sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16, }, statsGrid: { flexDirection: 'row', gap: 12, }, statCard: { flex: 1, padding: 16, alignItems: 'center', }, statValue: { fontSize: 24, fontWeight: '700', color: '#111827', marginTop: 8, marginBottom: 4, }, statLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', textAlign: 'center', }, reportTypes: { gap: 12, }, reportTypeCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, }, reportTypeCardSelected: { borderColor: '#6366f1', backgroundColor: '#f0f9ff', }, reportTypeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, }, reportTypeIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', marginRight: 16, }, reportTypeInfo: { flex: 1, }, reportTypeTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4, }, reportTypeDescription: { fontSize: 14, color: '#6b7280', }, reportTypeFrequency: { backgroundColor: '#ede9fe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, }, frequencyText: { fontSize: 12, fontWeight: '600', color: '#7c3aed', }, reportTypeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }, lastGenerated: { fontSize: 12, color: '#9ca3af', }, generateButton: { minWidth: 100, }, recentReports: { gap: 12, }, reportCard: { padding: 20, }, reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, }, reportInfo: { flex: 1, }, reportTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4, }, reportType: { fontSize: 14, color: '#6b7280', }, reportStatus: { flexDirection: 'row', alignItems: 'center', }, statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6, }, statusText: { fontSize: 12, fontWeight: '600', color: '#374151', }, reportDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }, reportMeta: { flex: 1, }, reportDate: { fontSize: 12, color: '#6b7280', marginBottom: 2, }, reportSize: { fontSize: 12, color: '#9ca3af', }, downloadButton: { marginLeft: 16, }, privacyCard: { padding: 24, backgroundColor: '#eef2ff', }, privacyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, }, privacyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginLeft: 12, }, privacyText: { fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 16, }, privacyFeatures: { gap: 8, }, privacyFeature: { flexDirection: 'row', alignItems: 'center', }, privacyFeatureText: { fontSize: 14, color: '#6366f1', fontWeight: '500', }, bottomSpacing: { height: 20, }, infoCard: { padding: 20 }, noReportsText: { textAlign: 'center', color: '#6b7280', fontStyle: 'italic', paddingVertical: 20, }
});