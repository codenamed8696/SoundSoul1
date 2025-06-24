import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Shield, Settings, LogOut, Building, Link as LinkIcon, Save, CreditCard as Edit, Bell, Palette, Globe } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { WellnessInsights } from '@/types';

// This is a placeholder for a real i18n/translation function
const translate = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

export default function ProfileScreen() {
  const { user, profile, signOut, loading } = useAuth();
  // Mock functions until they are implemented in AuthContext
  const updateUserProfile = async (data: any) => { console.log("Updating profile", data); return true; };
  const updateUserPreferences = async (data: any) => { console.log("Updating preferences", data); return true; };
  const linkCompanyToken = async (token: string) => { console.log("Linking token", token); return true; };
  
  const { getUserInsights } = useData();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [companyToken, setCompanyToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [insights, setInsights] = useState<WellnessInsights | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [preferencesForm, setPreferencesForm] = useState({
    notifications: { email: true, push: true, moodReminders: true },
    theme: 'system',
    language: 'en',
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({ name: profile.full_name || '', email: user?.email || '' });
      setPreferencesForm({
        notifications: {
          email: profile.preferences?.notifications?.email ?? true,
          push: profile.preferences?.notifications?.push ?? true,
          moodReminders: profile.preferences?.notifications?.moodReminders ?? true,
        },
        theme: profile.preferences?.theme ?? 'system',
        language: profile.preferences?.language ?? 'en',
      });
    }
  }, [profile, user]);

  useEffect(() => {
    async function fetchInsights() {
      const fetchedInsights = await getUserInsights();
      setInsights(fetchedInsights);
    }
    fetchInsights();
  }, []);

  const handleUpdateProfile = async () => {
    const success = await updateUserProfile({ full_name: profileForm.name });
    if (success) {
      Alert.alert('Success', 'Profile updated successfully.');
      setIsEditingProfile(false);
    } else {
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const handleUpdatePreferences = async () => {
    const success = await updateUserPreferences(preferencesForm);
    if (success) {
      Alert.alert('Success', 'Preferences updated successfully.');
      setIsEditingPreferences(false);
    } else {
      Alert.alert('Error', 'Failed to update preferences.');
    }
  };

  const handleLinkCompany = async () => {
    if (!companyToken) {
      Alert.alert('Error', 'Please enter a company token.');
      return;
    }
    const success = await linkCompanyToken(companyToken);
    if (success) {
      Alert.alert('Success', 'Account linked to company successfully.');
      setShowTokenInput(false);
      setCompanyToken('');
    } else {
      Alert.alert('Error', 'Failed to link company. The token may be invalid.');
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    // No navigation needed, the root layout will handle it.
  };

  const renderInsights = () => (
    <View style={styles.insightsGrid}>
      <View style={styles.insightItem}><Text style={styles.insightValue}>{insights?.mood_average?.toFixed(1) || 'N/A'}</Text><Text style={styles.insightLabel}>Avg. Mood</Text></View>
      <View style={styles.insightItem}><Text style={styles.insightValue}>{insights?.sessions_completed || 0}</Text><Text style={styles.insightLabel}>Sessions</Text></View>
      <View style={styles.insightItem}><Text style={styles.insightValue}>{insights?.streak || 0}</Text><Text style={styles.insightLabel}>Streak</Text></View>
    </View>
  );
  
  if (loading && !profile) {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" />
        </View>
    )
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <User size={32} color="#4f46e5" />
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        {isEditingProfile ? (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Edit size={20} color="#374151" />
              <Text style={styles.cardTitle}>Edit Profile</Text>
            </View>
            <View style={styles.formGroup}><Text style={styles.label}>Full Name</Text><TextInput style={styles.input} value={profileForm.name} onChangeText={(text) => setProfileForm({ ...profileForm, name: text })} placeholder="Your Full Name" /></View>
            <View style={styles.formGroup}><Text style={styles.label}>Email</Text><TextInput style={[styles.input, styles.inputDisabled]} value={profileForm.email} editable={false} /></View>
            <View style={styles.actions}><Button title="Cancel" variant="secondary" onPress={() => setIsEditingProfile(false)} /><Button title="Save" icon={Save} onPress={handleUpdateProfile} /></View>
          </Card>
        ) : (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <User size={20} color="#374151" />
              <Text style={styles.cardTitle}>{profile?.full_name || 'Anonymous User'}</Text>
              <Pressable style={styles.editButton} onPress={() => setIsEditingProfile(true)}><Edit size={16} color="#4f46e5" /></Pressable>
            </View>
            <Text style={styles.emailText}>{user?.email}</Text>
            {renderInsights()}
          </Card>
        )}

        {isEditingPreferences ? (
          <Card style={styles.card}>
              <View style={styles.cardHeader}><Settings size={20} color="#374151" /><Text style={styles.cardTitle}>Preferences</Text></View>
              <View style={styles.formGroup}>
                <View style={styles.subHeader}><Bell size={16} color="#475569"/><Text style={styles.label}>Notifications</Text></View>
                <View style={styles.switchRow}><Text style={styles.cardText}>Email</Text><Switch value={preferencesForm.notifications.email} onValueChange={(val) => setPreferencesForm(p => ({...p, notifications: {...p.notifications, email: val}}))} /></View>
                <View style={styles.switchRow}><Text style={styles.cardText}>Push</Text><Switch value={preferencesForm.notifications.push} onValueChange={(val) => setPreferencesForm(p => ({...p, notifications: {...p.notifications, push: val}}))} /></View>
                <View style={styles.switchRow}><Text style={styles.cardText}>Mood Reminders</Text><Switch value={preferencesForm.notifications.moodReminders} onValueChange={(val) => setPreferencesForm(p => ({...p, notifications: {...p.notifications, moodReminders: val}}))} /></View>
              </View>
              <View style={styles.formGroup}>
                  <View style={styles.subHeader}><Palette size={16} color="#475569"/><Text style={styles.label}>Theme</Text></View>
                  <View style={styles.radioGroup}>
                      {['system', 'light', 'dark'].map(theme => (
                          <Pressable key={theme} style={styles.radioButton} onPress={() => setPreferencesForm({...preferencesForm, theme})}>
                              <View style={styles.radioOuter}>{preferencesForm.theme === theme && <View style={styles.radioInner}/>}</View>
                              <Text style={styles.cardText}>{translate(theme)}</Text>
                          </Pressable>
                      ))}
                  </View>
              </View>
              <View style={styles.actions}><Button title="Cancel" variant="secondary" onPress={() => setIsEditingPreferences(false)} /><Button title="Save" icon={Save} onPress={handleUpdatePreferences} /></View>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Pressable onPress={() => setIsEditingPreferences(true)}>
                <View style={styles.cardHeader}><Settings size={20} color="#374151" /><Text style={styles.cardTitle}>Preferences</Text></View>
                <Text style={styles.cardText}>Manage your notifications, theme, and language.</Text>
            </Pressable>
          </Card>
        )}
        
        <Card style={styles.card}>
          <View style={styles.cardHeader}><Building size={20} color="#374151" /><Text style={styles.cardTitle}>Company Plan</Text></View>
          {profile?.organization_id ? (
            <Text style={styles.cardText}>Your account is linked to your company's wellness plan.</Text>
          ) : showTokenInput ? (
            <View style={styles.tokenInputContainer}>
              <TextInput style={styles.tokenInput} placeholder="Enter Company Token" value={companyToken} onChangeText={setCompanyToken} />
              <View style={styles.tokenActions}>
                <Button title="Cancel" variant="secondary" onPress={() => setShowTokenInput(false)} style={styles.tokenAction}/>
                <Button title="Link" icon={LinkIcon} onPress={handleLinkCompany} style={styles.tokenAction}/>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.cardText}>Link your account to unlock features provided by your employer.</Text>
              <Button title="Link with Token" icon={LinkIcon} onPress={() => setShowTokenInput(true)} style={styles.linkButton}/>
            </>
          )}
        </Card>
        
        <Card style={styles.card}>
          <View style={styles.cardHeader}><Shield size={20} color="#374151" /><Text style={styles.cardTitle}>Privacy & Data</Text></View>
          <Text style={styles.cardText}>Manage how your data is used and download your information.</Text>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}><LogOut size={20} color="#ef4444" /><Text style={styles.cardTitle}>Log Out</Text></View>
          <Text style={styles.cardText}>Are you sure you want to sign out of your account?</Text>
          <View style={styles.actionItem}>
            {isSigningOut ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Button title="Sign Out" onPress={handleSignOut} variant="destructive" />
            )}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// All of your original styles are preserved below
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    container: {
        padding: 16,
        paddingBottom: 48,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 8,
        paddingBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    card: {
        marginBottom: 16,
        // Using a more specific name from your original styles
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2.22,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginLeft: 12,
        flex: 1,
    },
    editButton: {
        padding: 4,
    },
    emailText: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 16,
        marginLeft: 32, // to align with title text
    },
    cardText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginLeft: 4, // consistent margin
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#334155',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#fafafa',
    },
    inputDisabled: {
        backgroundColor: '#e5e7eb',
        color: '#6b7280',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 8,
    },
    actionItem: {
        alignSelf: 'flex-start',
        marginLeft: 32, // Aligns button with card text
    },
    insightsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
        paddingVertical: 8,
    },
    insightItem: {
        alignItems: 'center',
    },
    insightValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4f46e5',
    },
    insightLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    tokenInputContainer: {
        gap: 12,
    },
    tokenInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#fafafa',
    },
    tokenActions: {
        flexDirection: 'row',
        gap: 12,
    },
    tokenAction: {
        flex: 1,
    },
    linkButton: {
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    subHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingLeft: 24, // Indent switch rows
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 16,
        paddingLeft: 24, // Indent radio group
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#4f46e5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4f46e5',
    }
});