import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, Switch, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Shield, Settings, LogOut, Building, Link as LinkIcon, Save, CreditCard as Edit, Bell, Palette, Globe } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { WellnessInsights } from '@/types';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/context/supabaseClient';

// This is a placeholder for a real i18n/translation function
const translate = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

export default function ProfileScreen() {
  const { user, profile, signOut, authLoading, preferences, fetchPreferences, updatePreferences } = useAuth();
  const navigation = useNavigation();
  const { getUserInsights } = useData();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [companyToken, setCompanyToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [insights, setInsights] = useState<WellnessInsights | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '', email: '' });

  // Accordion state
  const [expanded, setExpanded] = useState<string | null>(null);
  const [moodReminders, setMoodReminders] = useState(true);
  const [journalPrompts, setJournalPrompts] = useState(true);
  const [prefsLoading, setPrefsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({ name: profile.full_name || '', email: user?.email || '' });
    }
  }, [profile, user]);

  useEffect(() => {
    async function fetchInsights() {
      await getUserInsights();
    }
    fetchInsights();
  }, []);

  useEffect(() => {
    if (expanded === 'Preferences') {
      setPrefsLoading(true);
      fetchPreferences().finally(() => setPrefsLoading(false));
    }
  }, [expanded]);

  useEffect(() => {
    if (preferences) {
      setMoodReminders(preferences.mood_reminders_enabled);
      setJournalPrompts(preferences.journal_prompts_enabled);
    }
  }, [preferences]);

  const handleUpdateProfile = async () => {
    const success = await updateUserProfile({ full_name: profileForm.name });
    if (success) {
      Alert.alert('Success', 'Profile updated successfully.');
      setIsEditingProfile(false);
    } else {
      Alert.alert('Error', 'Failed to update profile.');
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
  
  if (authLoading && !profile) {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" />
        </View>
    )
  }

  // Accordion toggle
  const toggleSection = (section: string) => {
    setExpanded(expanded === section ? null : section);
  };

  // Privacy policy and export
  const PRIVACY_POLICY_URL = 'https://yourdomain.com/privacy-policy';
  const EXPORT_DATA_URL = 'https://your-supabase-project-url.functions.supabase.co/export-data';
  const { session } = useAuth();
  const handleViewPrivacyPolicy = () => {
    Linking.openURL(PRIVACY_POLICY_URL);
  };
  const handleExportData = async () => {
    try {
      const res = await fetch(EXPORT_DATA_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });
      if (res.ok) {
        Alert.alert('Success!', 'Your data export has started and will be sent to your email.');
      } else {
        Alert.alert('Error', 'Failed to start data export.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to start data export.');
    }
  };

  // Add updateUserProfile implementation
  const updateUserProfile = async (updates: { full_name: string }) => {
    if (!user) return false;
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: updates.full_name })
      .eq('id', user.id);
    if (error) {
      Alert.alert('Error', 'Could not update profile.');
      return false;
    }
    // Optionally, refetch profile here
    return true;
  };

  // Add linkCompanyToken implementation
  const linkCompanyToken = async (token: string) => {
    if (!user) return false;
    // For demo, just set organization_id to the token value
    const { error } = await supabase
      .from('profiles')
      .update({ organization_id: token })
      .eq('id', user.id);
    if (error) {
      Alert.alert('Error', 'Could not link company.');
      return false;
    }
    // Optionally, refetch profile here
    return true;
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <User size={32} color="#4f46e5" />
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        {/* Details Section */}
        <Card style={styles.card}>
          <Pressable onPress={() => toggleSection('Details')} style={styles.cardHeader}>
            <User size={20} color="#374151" />
            <Text style={styles.cardTitle}>Details</Text>
          </Pressable>
          {expanded === 'Details' && (
            isEditingProfile ? (
              <>
                <View style={styles.formGroup}><Text style={styles.label}>Full Name</Text><TextInput style={styles.input} value={profileForm.name} onChangeText={(text) => setProfileForm({ ...profileForm, name: text })} placeholder="Your Full Name" /></View>
                <View style={styles.formGroup}><Text style={styles.label}>Email</Text><TextInput style={[styles.input, styles.inputDisabled]} value={profileForm.email} editable={false} /></View>
                <View style={styles.actions}><Button title="Cancel" variant="secondary" onPress={() => setIsEditingProfile(false)} /><Button title="Save" onPress={handleUpdateProfile} /></View>
              </>
            ) : (
              <>
                <Text style={styles.emailText}>{user?.email}</Text>
                <Pressable style={styles.editButton} onPress={() => setIsEditingProfile(true)}><Edit size={16} color="#4f46e5" /></Pressable>
                {renderInsights()}
              </>
            )
          )}
        </Card>

        {/* Preferences Section */}
        <Card style={styles.card}>
          <Pressable onPress={() => toggleSection('Preferences')} style={styles.cardHeader}>
            <Settings size={20} color="#374151" />
            <Text style={styles.cardTitle}>Preferences</Text>
          </Pressable>
          {expanded === 'Preferences' && (
            prefsLoading ? <ActivityIndicator size="small" /> : (
              <>
                <View style={styles.row}>
                  <Text style={styles.label}>Enable Mood Reminders</Text>
                  <Switch value={moodReminders} onValueChange={async (val) => {
                    setMoodReminders(val);
                    await updatePreferences({ mood_reminders_enabled: val });
                  }} />
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Enable Journal Prompts</Text>
                  <Switch value={journalPrompts} onValueChange={async (val) => {
                    setJournalPrompts(val);
                    await updatePreferences({ journal_prompts_enabled: val });
                  }} />
                </View>
              </>
            )
          )}
        </Card>

        {/* Company Plan Section */}
        <Card style={styles.card}>
          <Pressable onPress={() => toggleSection('CompanyPlan')} style={styles.cardHeader}>
            <Building size={20} color="#374151" />
            <Text style={styles.cardTitle}>Company Plan</Text>
          </Pressable>
          {expanded === 'CompanyPlan' && (
            profile?.organization_id ? (
              <View style={styles.infoBox}>
                <Text style={styles.label}>Company Name: {/* TODO: fetch real company name */}Acme Corp</Text>
                <Text style={styles.label}>Plan Type: {/* TODO: fetch real plan type */}Premium</Text>
              </View>
            ) : showTokenInput ? (
              <View style={styles.tokenInputContainer}>
                <TextInput style={styles.tokenInput} placeholder="Enter Company Token" value={companyToken} onChangeText={setCompanyToken} />
                <View style={styles.tokenActions}>
                  <Button title="Cancel" variant="secondary" onPress={() => setShowTokenInput(false)} style={styles.tokenAction}/>
                  <Button title="Link" onPress={handleLinkCompany} style={styles.tokenAction}/>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.cardText}>Link your account to unlock features provided by your employer.</Text>
                <Button title="Link with Token" onPress={() => setShowTokenInput(true)} style={styles.linkButton}/>
              </>
            )
          )}
        </Card>

        {/* Privacy & Data Section */}
        <Card style={styles.card}>
          <Pressable onPress={() => toggleSection('Privacy')} style={styles.cardHeader}>
            <Shield size={20} color="#374151" />
            <Text style={styles.cardTitle}>Privacy & Data</Text>
          </Pressable>
          {expanded === 'Privacy' && (
            <>
              <View style={styles.buttonBox}>
                <Button title="View Privacy Policy" onPress={handleViewPrivacyPolicy} />
              </View>
              <View style={styles.buttonBox}>
                <Button title="Export My Data" onPress={handleExportData} />
              </View>
            </>
          )}
        </Card>

        {/* Logout Section */}
        <Card style={styles.card}>
          <Pressable onPress={() => toggleSection('Logout')} style={styles.cardHeader}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.cardTitle}>Log Out</Text>
          </Pressable>
          {expanded === 'Logout' && (
            <>
              <Text style={styles.cardText}>Are you sure you want to sign out of your account?</Text>
              <View style={styles.actionItem}>
                {isSigningOut ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <Button title="Sign Out" onPress={handleSignOut} variant="secondary" />
                )}
              </View>
            </>
          )}
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
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    settingsIcon: {
        marginRight: 8,
    },
    settingsLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1e293b',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    infoBox: {
        padding: 16,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        marginBottom: 16,
    },
    buttonBox: {
        marginBottom: 16,
    },
});