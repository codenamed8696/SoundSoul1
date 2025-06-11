import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Building, Users, Shield, Bell, CreditCard, ChartBar as BarChart3, Download, Mail, Phone, Globe, CreditCard as Edit, Save, X, LogOut } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { supabase } from '@/context/supabaseClient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const billingInfo = {
  plan: 'Premium', monthlyFee: '$2,500', perUserFee: '$10',
  nextBilling: '2024-12-15', paymentMethod: 'Credit Card ending in 4567',
};
const initialNotificationSettings = [
  { id: 'weekly_reports', title: 'Weekly Reports', description: 'Receive weekly wellness summaries' },
  { id: 'monthly_analytics', title: 'Monthly Analytics', description: 'Comprehensive monthly insights' },
  { id: 'crisis_alerts', title: 'Crisis Alerts', description: 'Anonymous crisis trend notifications' },
  { id: 'usage_updates', title: 'Usage Updates', description: 'Program utilization notifications' },
];

export default function EmployerSettingsScreen() {
  const { signOut, profile } = useAuth();
  const { organization, fetchOrganization } = useData();

  const [editMode, setEditMode] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', industry: '', contactEmail: '', contactPhone: '', website: '', token: '', employeeCount: 0, plan: '' });
  const [notifications, setNotifications] = useState(initialNotificationSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '', industry: organization.industry || '',
        contactEmail: organization.contact_email || '', contactPhone: organization.contact_phone || '',
        website: organization.website || '', token: organization.token || 'Loading...',
        employeeCount: organization.employee_count || 0, plan: organization.plan || 'Premium',
      });
      setNotifications(prev => prev.map(n => ({ ...n, enabled: organization[`notifications_${n.id}`] ?? false })));
    } else if (profile?.role === 'employer') {
      fetchOrganization();
    }
  }, [organization, profile]);

  const handleEdit = (section: string) => setEditMode(section);
  const handleSignOut = () => Alert.alert("Sign Out", "Are you sure?", [{ text: "Cancel", style: "cancel" }, { text: "Sign Out", style: "destructive", onPress: signOut }]);

  const handleSave = async (section: string) => {
    if (!organization) return; setIsSaving(true);
    let updates = {};
    if (section === 'company') { updates = { name: formData.name, industry: formData.industry }; }
    else if (section === 'contact') { updates = { contact_email: formData.contactEmail, contact_phone: formData.contactPhone, website: formData.website }; }
    try {
      const { error } = await supabase.from('organizations').update(updates).eq('id', organization.id);
      if (error) throw error;
      Alert.alert('Success', 'Settings updated'); await fetchOrganization(); setEditMode(null);
    } catch (error) {
      Alert.alert('Error', `Failed to update settings: ${(error as Error).message}`);
    } finally { setIsSaving(false); }
  };

  const handleCancel = () => {
    if (organization) {
      setFormData({
        name: organization.name || '', industry: organization.industry || '',
        contactEmail: organization.contact_email || '', contactPhone: organization.contact_phone || '',
        website: organization.website || '', token: organization.token || 'Loading...',
        employeeCount: organization.employee_count || 0, plan: organization.plan || 'Premium',
      });
    }
    setEditMode(null);
  };

  const toggleNotification = async (id: string) => {
    if (!organization) return;
    const currentSetting = notifications.find(n => n.id === id);
    if (currentSetting === undefined) return;
    const newStatus = !currentSetting.enabled;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, enabled: newStatus } : n));
    const updateColumn = `notifications_${id}`;
    const { error } = await supabase.from('organizations').update({ [updateColumn]: newStatus }).eq('id', organization.id);
    if (error) { Alert.alert("Error", "Could not save preference."); setNotifications(prev => prev.map(n => n.id === id ? { ...n, enabled: !newStatus } : n)); }
  };

  const handleDownloadData = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-data', { responseType: 'text' });
      if (error) throw error;
      const fileUri = FileSystem.documentDirectory + `wellness-report-${organization?.id}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, data, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Save Your Wellness Report' });
      } else { Alert.alert("Sharing Not Available"); }
    } catch (error) { Alert.alert("Download Failed", `Could not generate report: ${(error as Error).message}`);
    } finally { setIsSaving(false); }
  };
  
  // --- THIS IS THE NEW, CROSS-PLATFORM VERSION ---
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account Permanently",
      "This action is irreversible and will delete all data for your organization. Are you sure you want to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsSaving(true);
            try {
              // Call the secure database function
              const { error } = await supabase.rpc('delete_organization_account');
              if (error) throw error;
              
              Alert.alert("Success", "Your account has been permanently deleted.");
              // The user no longer exists, sign them out to clear the app state
              await signOut();

            } catch (error) {
              Alert.alert("Error", `Could not delete account: ${(error as Error).message}`);
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Text style={styles.title}>Company Settings</Text><Text style={styles.subtitle}>Manage your wellness program configuration</Text></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Company Information</Text><Card style={styles.infoCard}><View style={styles.infoHeader}><Building size={24} color="#6366f1" /><Text style={styles.infoTitle}>Company Profile</Text>{editMode !== 'company' ? (<Pressable onPress={() => handleEdit('company')}><Edit size={20} color="#6b7280" /></Pressable>) : (<View style={styles.editActions}>{isSaving ? <ActivityIndicator color="#6366f1" /> : (<><Pressable onPress={() => handleSave('company')} disabled={isSaving} style={styles.editAction}><Save size={20} color="#10b981" /></Pressable><Pressable onPress={handleCancel} disabled={isSaving} style={styles.editAction}><X size={20} color="#ef4444" /></Pressable></>)}</View>)}</View><View style={styles.infoContent}><View style={styles.infoRow}><Text style={styles.infoLabel}>Company Name</Text>{editMode === 'company' ? (<TextInput style={styles.infoInput} value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} />) : (<Text style={styles.infoValue}>{formData.name}</Text>)}</View><View style={styles.infoRow}><Text style={styles.infoLabel}>Company Token</Text><View style={styles.tokenContainer}><Text style={styles.tokenValue}>{formData.token}</Text><Text style={styles.tokenNote}>Share with employees</Text></View></View><View style={styles.infoRow}><Text style={styles.infoLabel}>Industry</Text>{editMode === 'company' ? (<TextInput style={styles.infoInput} value={formData.industry} onChangeText={(text) => setFormData({ ...formData, industry: text })} />) : (<Text style={styles.infoValue}>{formData.industry}</Text>)}</View><View style={styles.infoRow}><Text style={styles.infoLabel}>Employee Count</Text><Text style={styles.infoValue}>{formData.employeeCount}</Text></View></View></Card></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Contact Information</Text><Card style={styles.infoCard}><View style={styles.infoHeader}><Mail size={24} color="#10b981" /><Text style={styles.infoTitle}>Contact Details</Text>{editMode !== 'contact' ? (<Pressable onPress={() => handleEdit('contact')}><Edit size={20} color="#6b7280" /></Pressable>) : (<View style={styles.editActions}>{isSaving ? <ActivityIndicator color="#6366f1" /> : (<><Pressable onPress={() => handleSave('contact')} disabled={isSaving} style={styles.editAction}><Save size={20} color="#10b981" /></Pressable><Pressable onPress={handleCancel} disabled={isSaving} style={styles.editAction}><X size={20} color="#ef4444" /></Pressable></>)}</View>)}</View><View style={styles.infoContent}><View style={styles.infoRow}><Mail size={16} color="#6b7280" /><Text style={styles.infoLabel}>Email</Text>{editMode === 'contact' ? (<TextInput style={styles.infoInput} value={formData.contactEmail} onChangeText={(text) => setFormData({ ...formData, contactEmail: text })} />) : (<Text style={styles.infoValue}>{formData.contactEmail}</Text>)}</View><View style={styles.infoRow}><Phone size={16} color="#6b7280" /><Text style={styles.infoLabel}>Phone</Text>{editMode === 'contact' ? (<TextInput style={styles.infoInput} value={formData.contactPhone} onChangeText={(text) => setFormData({ ...formData, contactPhone: text })} />) : (<Text style={styles.infoValue}>{formData.contactPhone}</Text>)}</View><View style={styles.infoRow}><Globe size={16} color="#6b7280" /><Text style={styles.infoLabel}>Website</Text>{editMode === 'contact' ? (<TextInput style={styles.infoInput} value={formData.website} onChangeText={(text) => setFormData({ ...formData, website: text })} />) : (<Text style={styles.infoValue}>{formData.website}</Text>)}</View></View></Card></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Billing & Plan</Text><Card style={styles.billingCard}><View style={styles.billingHeader}><CreditCard size={24} color="#f59e0b" /><View style={styles.billingInfo}><Text style={styles.billingPlan}>{billingInfo.plan} Plan</Text><Text style={styles.billingFee}>{billingInfo.monthlyFee}/month</Text></View><View style={styles.planBadge}><Text style={styles.planBadgeText}>Premium</Text></View></View><View style={styles.billingDetails}><View style={styles.billingRow}><Text style={styles.billingLabel}>Per User Fee</Text><Text style={styles.billingValue}>{billingInfo.perUserFee}</Text></View><View style={styles.billingRow}><Text style={styles.billingLabel}>Next Billing</Text><Text style={styles.billingValue}>{new Date(billingInfo.nextBilling).toLocaleDateString()}</Text></View><View style={styles.billingRow}><Text style={styles.billingLabel}>Payment Method</Text><Text style={styles.billingValue}>{billingInfo.paymentMethod}</Text></View></View><Button title="Manage Billing" onPress={() => Alert.alert('Manage Billing', 'This would open a secure portal to manage your subscription.')} variant="ghost" style={styles.billingButton} /></Card></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Notification Preferences</Text><Card style={styles.notificationsCard}><View style={styles.notificationsHeader}><Bell size={24} color="#6366f1" /><Text style={styles.notificationsTitle}>Email Notifications</Text></View><View style={styles.notificationsList}>{notifications.map((notification) => (<Pressable key={notification.id} style={styles.notificationItem} onPress={() => toggleNotification(notification.id)}><View style={styles.notificationInfo}><Text style={styles.notificationTitle}>{notification.title}</Text><Text style={styles.notificationDescription}>{notification.description}</Text></View><View style={[styles.notificationToggle, notification.enabled && styles.notificationToggleEnabled]}><View style={[styles.notificationToggleThumb, notification.enabled && styles.notificationToggleThumbEnabled]} /></View></Pressable>))}</View></Card></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Privacy & Data</Text><Card style={styles.privacyCard}><View style={styles.privacyHeader}><Shield size={24} color="#6366f1" /><Text style={styles.privacyTitle}>Data Management</Text></View><Text style={styles.privacyDescription}>All employee data is processed with complete anonymization. We use differential privacy and k-anonymity to ensure individual privacy while providing valuable insights.</Text><View style={styles.privacyActions}><Button title="Download Company Data" onPress={handleDownloadData} disabled={isSaving} variant="ghost" style={styles.privacyAction} /><Button title="Delete Account" onPress={handleDeleteAccount} disabled={isSaving} variant="ghost" style={[styles.privacyAction, styles.dangerButton]} textStyle={{ color: '#ef4444' }} /></View></Card></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Account</Text><Card style={styles.infoCard}><TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}><LogOut color="#ef4444" size={20} /><Text style={styles.signOutButtonText}>Sign Out</Text></TouchableOpacity></Card></View>
        <View style={styles.bottomSpacing} /></ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', }, header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, }, title: { fontSize: 32, fontWeight: '700', color: '#111827', marginBottom: 8, }, subtitle: { fontSize: 16, color: '#6b7280', }, section: { paddingHorizontal: 20, marginBottom: 24, }, sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16, }, infoCard: { padding: 20, }, infoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, }, infoTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginLeft: 12, flex: 1, }, editActions: { flexDirection: 'row', gap: 12, }, editAction: { padding: 4, }, infoContent: { gap: 16, }, infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, }, infoLabel: { fontSize: 14, fontWeight: '600', color: '#374151', width: 120, }, infoValue: { fontSize: 14, color: '#111827', flex: 1, }, infoInput: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 14, color: '#111827', backgroundColor: '#fafafa', }, tokenContainer: { flex: 1, }, tokenValue: { fontSize: 14, fontWeight: '600', color: '#6366f1', marginBottom: 2, }, tokenNote: { fontSize: 12, color: '#6b7280', }, billingCard: { padding: 20, }, billingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, }, billingInfo: { marginLeft: 12, flex: 1, }, billingPlan: { fontSize: 18, fontWeight: '700', color: '#111827', }, billingFee: { fontSize: 16, color: '#10b981', fontWeight: '600', }, planBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, }, planBadgeText: { fontSize: 12, fontWeight: '700', color: '#d97706', }, billingDetails: { gap: 12, marginBottom: 20, }, billingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }, billingLabel: { fontSize: 14, color: '#6b7280', }, billingValue: { fontSize: 14, fontWeight: '600', color: '#111827', }, billingButton: { alignSelf: 'flex-start', }, notificationsCard: { padding: 20, }, notificationsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, }, notificationsTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginLeft: 12, }, notificationsList: { gap: 16, }, notificationItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }, notificationInfo: { flex: 1, }, notificationTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4, }, notificationDescription: { fontSize: 14, color: '#6b7280', }, notificationToggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: '#e5e7eb', padding: 2, justifyContent: 'center', }, notificationToggleEnabled: { backgroundColor: '#6366f1', }, notificationToggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#ffffff', alignSelf: 'flex-start', }, notificationToggleThumbEnabled: { alignSelf: 'flex-end', }, privacyCard: { padding: 20, }, privacyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, }, privacyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginLeft: 12, }, privacyDescription: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 20, }, privacyActions: { gap: 12, }, privacyAction: { alignSelf: 'flex-start', }, dangerButton: { borderColor: '#fecaca', backgroundColor: '#fef2f2', }, bottomSpacing: { height: 20, },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fee2e2', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#fca5a5' },
  signOutButtonText: { color: '#ef4444', fontSize: 16, fontWeight: '600', marginLeft: 8, },
});