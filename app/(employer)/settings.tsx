import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Building, Users, Shield, Bell, CreditCard, ChartBar as BarChart3, Download, Mail, Phone, Globe, CreditCard as Edit, Save, X } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

const companyInfo = {
  name: 'Demo Corporation',
  token: 'ABC-1234-DEMO-5678',
  industry: 'Technology',
  employeeCount: 250,
  plan: 'Premium',
  contactEmail: 'hr@democorp.com',
  contactPhone: '+1 (555) 123-4567',
  website: 'https://democorp.com',
};

const billingInfo = {
  plan: 'Premium',
  monthlyFee: '$2,500',
  perUserFee: '$10',
  nextBilling: '2024-12-15',
  paymentMethod: 'Credit Card ending in 4567',
};

const notificationSettings = [
  {
    id: 'weekly_reports',
    title: 'Weekly Reports',
    description: 'Receive weekly wellness summaries',
    enabled: true,
  },
  {
    id: 'monthly_analytics',
    title: 'Monthly Analytics',
    description: 'Comprehensive monthly insights',
    enabled: true,
  },
  {
    id: 'crisis_alerts',
    title: 'Crisis Alerts',
    description: 'Anonymous crisis trend notifications',
    enabled: true,
  },
  {
    id: 'usage_updates',
    title: 'Usage Updates',
    description: 'Program utilization notifications',
    enabled: false,
  },
];

export default function EmployerSettingsScreen() {
  const [editMode, setEditMode] = useState<string | null>(null);
  const [formData, setFormData] = useState(companyInfo);
  const [notifications, setNotifications] = useState(notificationSettings);

  const handleEdit = (section: string) => {
    setEditMode(section);
  };

  const handleSave = (section: string) => {
    console.log('Saving:', section, formData);
    setEditMode(null);
    Alert.alert('Success', 'Settings updated successfully');
  };

  const handleCancel = () => {
    setFormData(companyInfo);
    setEditMode(null);
  };

  const toggleNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
      )
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      'Download Company Data',
      'This will generate a report of all your company\'s wellness program data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: () => console.log('Downloading data...') }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your company\'s wellness program account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => console.log('Deleting account...') 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Company Settings</Text>
          <Text style={styles.subtitle}>
            Manage your wellness program configuration
          </Text>
        </View>

        {/* Company Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Information</Text>
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Building size={24} color="#6366f1" />
              <Text style={styles.infoTitle}>Company Profile</Text>
              {editMode !== 'company' ? (
                <Pressable onPress={() => handleEdit('company')}>
                  <Edit size={20} color="#6b7280" />
                </Pressable>
              ) : (
                <View style={styles.editActions}>
                  <Pressable onPress={() => handleSave('company')} style={styles.editAction}>
                    <Save size={20} color="#10b981" />
                  </Pressable>
                  <Pressable onPress={handleCancel} style={styles.editAction}>
                    <X size={20} color="#ef4444" />
                  </Pressable>
                </View>
              )}
            </View>

            <View style={styles.infoContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Company Name</Text>
                {editMode === 'company' ? (
                  <TextInput
                    style={styles.infoInput}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                ) : (
                  <Text style={styles.infoValue}>{formData.name}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Company Token</Text>
                <View style={styles.tokenContainer}>
                  <Text style={styles.tokenValue}>{formData.token}</Text>
                  <Text style={styles.tokenNote}>Share with employees</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Industry</Text>
                {editMode === 'company' ? (
                  <TextInput
                    style={styles.infoInput}
                    value={formData.industry}
                    onChangeText={(text) => setFormData({ ...formData, industry: text })}
                  />
                ) : (
                  <Text style={styles.infoValue}>{formData.industry}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Employee Count</Text>
                <Text style={styles.infoValue}>{formData.employeeCount}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Mail size={24} color="#10b981" />
              <Text style={styles.infoTitle}>Contact Details</Text>
              {editMode !== 'contact' ? (
                <Pressable onPress={() => handleEdit('contact')}>
                  <Edit size={20} color="#6b7280" />
                </Pressable>
              ) : (
                <View style={styles.editActions}>
                  <Pressable onPress={() => handleSave('contact')} style={styles.editAction}>
                    <Save size={20} color="#10b981" />
                  </Pressable>
                  <Pressable onPress={handleCancel} style={styles.editAction}>
                    <X size={20} color="#ef4444" />
                  </Pressable>
                </View>
              )}
            </View>

            <View style={styles.infoContent}>
              <View style={styles.infoRow}>
                <Mail size={16} color="#6b7280" />
                <Text style={styles.infoLabel}>Email</Text>
                {editMode === 'contact' ? (
                  <TextInput
                    style={styles.infoInput}
                    value={formData.contactEmail}
                    onChangeText={(text) => setFormData({ ...formData, contactEmail: text })}
                  />
                ) : (
                  <Text style={styles.infoValue}>{formData.contactEmail}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Phone size={16} color="#6b7280" />
                <Text style={styles.infoLabel}>Phone</Text>
                {editMode === 'contact' ? (
                  <TextInput
                    style={styles.infoInput}
                    value={formData.contactPhone}
                    onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
                  />
                ) : (
                  <Text style={styles.infoValue}>{formData.contactPhone}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Globe size={16} color="#6b7280" />
                <Text style={styles.infoLabel}>Website</Text>
                {editMode === 'contact' ? (
                  <TextInput
                    style={styles.infoInput}
                    value={formData.website}
                    onChangeText={(text) => setFormData({ ...formData, website: text })}
                  />
                ) : (
                  <Text style={styles.infoValue}>{formData.website}</Text>
                )}
              </View>
            </View>
          </Card>
        </View>

        {/* Billing Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing & Plan</Text>
          <Card style={styles.billingCard}>
            <View style={styles.billingHeader}>
              <CreditCard size={24} color="#f59e0b" />
              <View style={styles.billingInfo}>
                <Text style={styles.billingPlan}>{billingInfo.plan} Plan</Text>
                <Text style={styles.billingFee}>{billingInfo.monthlyFee}/month</Text>
              </View>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>Premium</Text>
              </View>
            </View>

            <View style={styles.billingDetails}>
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Per User Fee</Text>
                <Text style={styles.billingValue}>{billingInfo.perUserFee}</Text>
              </View>
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Next Billing</Text>
                <Text style={styles.billingValue}>
                  {new Date(billingInfo.nextBilling).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Payment Method</Text>
                <Text style={styles.billingValue}>{billingInfo.paymentMethod}</Text>
              </View>
            </View>

            <Button
              title="Manage Billing"
              onPress={() => console.log('Manage billing')}
              variant="ghost"
              style={styles.billingButton}
            />
          </Card>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <Card style={styles.notificationsCard}>
            <View style={styles.notificationsHeader}>
              <Bell size={24} color="#6366f1" />
              <Text style={styles.notificationsTitle}>Email Notifications</Text>
            </View>

            <View style={styles.notificationsList}>
              {notifications.map((notification) => (
                <Pressable
                  key={notification.id}
                  style={styles.notificationItem}
                  onPress={() => toggleNotification(notification.id)}
                >
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationDescription}>
                      {notification.description}
                    </Text>
                  </View>
                  <View style={[
                    styles.notificationToggle,
                    notification.enabled && styles.notificationToggleEnabled
                  ]}>
                    <View style={[
                      styles.notificationToggleThumb,
                      notification.enabled && styles.notificationToggleThumbEnabled
                    ]} />
                  </View>
                </Pressable>
              ))}
            </View>
          </Card>
        </View>

        {/* Privacy & Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Data</Text>
          <Card style={styles.privacyCard}>
            <View style={styles.privacyHeader}>
              <Shield size={24} color="#6366f1" />
              <Text style={styles.privacyTitle}>Data Management</Text>
            </View>

            <Text style={styles.privacyDescription}>
              All employee data is processed with complete anonymization. We use 
              differential privacy and k-anonymity to ensure individual privacy 
              while providing valuable insights.
            </Text>

            <View style={styles.privacyActions}>
              <Button
                title="Download Company Data"
                onPress={handleDownloadData}
                variant="ghost"
                style={styles.privacyAction}
              />
              <Button
                title="Delete Account"
                onPress={handleDeleteAccount}
                variant="ghost"
                style={[styles.privacyAction, styles.dangerButton]}
                textStyle={{ color: '#ef4444' }}
              />
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  infoCard: {
    padding: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editAction: {
    padding: 4,
  },
  infoContent: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  infoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fafafa',
  },
  tokenContainer: {
    flex: 1,
  },
  tokenValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 2,
  },
  tokenNote: {
    fontSize: 12,
    color: '#6b7280',
  },
  billingCard: {
    padding: 20,
  },
  billingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  billingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  billingPlan: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  billingFee: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
  },
  planBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d97706',
  },
  billingDetails: {
    gap: 12,
    marginBottom: 20,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billingLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  billingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  billingButton: {
    alignSelf: 'flex-start',
  },
  notificationsCard: {
    padding: 20,
  },
  notificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  notificationsList: {
    gap: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  notificationToggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    padding: 2,
    justifyContent: 'center',
  },
  notificationToggleEnabled: {
    backgroundColor: '#6366f1',
  },
  notificationToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  notificationToggleThumbEnabled: {
    alignSelf: 'flex-end',
  },
  privacyCard: {
    padding: 20,
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
  privacyDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  privacyActions: {
    gap: 12,
  },
  privacyAction: {
    alignSelf: 'flex-start',
  },
  dangerButton: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  bottomSpacing: {
    height: 20,
  },
});