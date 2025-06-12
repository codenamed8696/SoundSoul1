import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

const SettingsScreen = () => {
  const { signOut } = useAuth();
  // Now using the real updateOrganization function
  const { organization, fetchOrganization, updateOrganization, loading } = useData();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState({ name: '', contact_email: '', website: '' });
  const [notifications, setNotifications] = useState({
    notifications_weekly_reports: true,
    notifications_monthly_analytics: true,
    notifications_crisis_alerts: true,
    notifications_usage_updates: false,
  });

  useEffect(() => {
    if (organization) {
      setFormState({ name: organization.name ?? '', contact_email: organization.contact_email ?? '', website: organization.website ?? '' });
      setNotifications({
        notifications_weekly_reports: organization.notifications_weekly_reports ?? true,
        notifications_monthly_analytics: organization.notifications_monthly_analytics ?? true,
        notifications_crisis_alerts: organization.notifications_crisis_alerts ?? true,
        notifications_usage_updates: organization.notifications_usage_updates ?? false,
      });
    }
  }, [organization]);

  const handleSave = async () => {
    if (!organization) return;
    setIsSaving(true);
    // This now calls the real update function from our context
    const success = await updateOrganization({ ...formState });
    
    if (success) {
      Alert.alert('Success', 'Information updated.');
      setIsEditing(false);
    } else {
      Alert.alert('Error', 'Failed to save information.');
    }
    setIsSaving(false);
  };

  const handleToggle = async (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    if (!organization) return;
    // This now calls the real update function
    await updateOrganization({ [key]: value });
  };
  
  const handleDeleteAccount = () => { /* ... (same as your file) ... */ };

  // The loading check now looks at the correct flag.
  if (loading.organization) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.header}><Text style={styles.title}>Settings</Text></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Company Profile & Contact Info</Text><Card>{isEditing ? (<>{/* ... */}<View style={styles.buttonRow}><Button title="Cancel" variant="secondary" onPress={() => setIsEditing(false)} /><Button title={isSaving ? "Saving..." : "Save"} onPress={handleSave} disabled={isSaving} /></View></>) : (<>{/* ... */}<View style={{alignItems: 'flex-end'}}><Button title="Edit" variant="outline" onPress={() => setIsEditing(true)} /></View></>)}</Card></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Notification Preferences</Text><Card><View style={styles.row}><Text style={styles.label}>Weekly Reports</Text><Switch value={notifications.notifications_weekly_reports} onValueChange={(v) => handleToggle('notifications_weekly_reports', v)} /></View><View style={styles.row}><Text style={styles.label}>Monthly Analytics</Text><Switch value={notifications.notifications_monthly_analytics} onValueChange={(v) => handleToggle('notifications_monthly_analytics', v)} /></View><View style={styles.row}><Text style={styles.label}>Crisis Alerts</Text><Switch value={notifications.notifications_crisis_alerts} onValueChange={(v) => handleToggle('notifications_crisis_alerts', v)} /></View><View style={styles.row}><Text style={styles.label}>Usage Updates</Text><Switch value={notifications.notifications_usage_updates} onValueChange={(v) => handleToggle('notifications_usage_updates', v)} /></View></Card></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Data Management</Text><Button title="Download Anonymized Data Report" variant="secondary" /></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Account</Text><Button title="Sign Out" onPress={signOut} /><View style={{height: 10}}/><Button title="Delete Account" variant="destructive" onPress={handleDeleteAccount} /></View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ /* ... (all your original styles) ... */ });

export default SettingsScreen;