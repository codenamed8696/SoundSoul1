import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

export default function CounselorSettingsScreen() {
  const { profile, signOut } = useAuth();
  const { counselor, fetchCounselorDetails, updateCounselorDetails, updateUserProfile, loading } = useData();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for counselor's professional profile
  const [formState, setFormState] = useState({
    full_name: '',
    bio: '',
  });

  // Notification state for counselor
  const [notifications, setNotifications] = useState({
    newMessageAlerts: true,
    appointmentReminders: true,
    weeklySummary: false,
  });

  // Update form when counselor data loads
  useEffect(() => {
    if (profile) {
      setFormState(prev => ({...prev, full_name: profile.full_name ?? ''}));
    }
    if (counselor) {
      setFormState(prev => ({...prev, bio: counselor.bio ?? ''}));
    }
  }, [profile, counselor]);

  const handleProfileSave = async () => {
    setIsSaving(true);
    
    // Update both tables
    const profileSuccess = await updateUserProfile({ full_name: formState.full_name });
    const counselorSuccess = await updateCounselorDetails({ bio: formState.bio });

    if (profileSuccess && counselorSuccess) {
      Alert.alert('Success', 'Your profile has been updated.');
      setIsEditingProfile(false);
    } else {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
    setIsSaving(false);
  };

  const handleToggle = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    console.log(`Notification setting '${key}' changed to ${value}`);
  };

  if (loading.counselor || loading.appointments) {
    return (
      <View style={styles.centered}><ActivityIndicator size="large" /></View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Profile</Text>
          <Card>
            {isEditingProfile ? (
              <>
                <Text style={styles.label}>Full Name</Text>
                <TextInput style={styles.input} value={formState.full_name} onChangeText={(text) => setFormState(p => ({...p, full_name: text}))} />
                <Text style={styles.label}>Bio</Text>
                <TextInput style={[styles.input, styles.bioInput]} value={formState.bio} onChangeText={(text) => setFormState(p => ({...p, bio: text}))} multiline />
                <View style={styles.buttonRow}>
                  <Button title="Cancel" variant="secondary" onPress={() => setIsEditingProfile(false)} />
                  <Button title={isSaving ? "Saving..." : "Save Changes"} onPress={handleProfileSave} disabled={isSaving}/>
                </View>
              </>
            ) : (
              <>
                 <Text style={styles.infoText}><Text style={styles.infoLabel}>Name:</Text> {profile?.full_name || 'N/A'}</Text>
                 <Text style={styles.infoText}><Text style={styles.infoLabel}>Bio:</Text> {counselor?.bio || 'Not set'}</Text>
                <View style={{alignItems: 'flex-end'}}>
                    <Button title="Edit Profile" variant="outline" onPress={() => setIsEditingProfile(true)} />
                </View>
              </>
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <Card>
            <View style={styles.row}><Text style={styles.label}>New Message Alerts</Text><Switch value={notifications.newMessageAlerts} onValueChange={(v) => handleToggle('newMessageAlerts', v)} /></View>
            <View style={styles.row}><Text style={styles.label}>Appointment Reminders</Text><Switch value={notifications.appointmentReminders} onValueChange={(v) => handleToggle('appointmentReminders', v)} /></View>
            <View style={styles.row}><Text style={styles.label}>Weekly Summary Email</Text><Switch value={notifications.weeklySummary} onValueChange={(v) => handleToggle('weeklySummary', v)} /></View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Button title="Sign Out" onPress={signOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 24, paddingVertical: 12 },
    title: { fontSize: 28, fontWeight: 'bold' },
    section: { marginTop: 24, paddingHorizontal: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    label: { fontSize: 16, marginBottom: 8, color: '#374151' },
    infoText: { fontSize: 16, marginBottom: 12, lineHeight: 24 },
    infoLabel: { fontWeight: '600' },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 12 },
    bioInput: { height: 120, textAlignVertical: 'top' },
    buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 12 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }
});
