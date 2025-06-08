import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Shield, Settings, LogOut, Building, Link, Save, CreditCard as Edit, Bell, Palette, Globe } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { WellnessInsights } from '@/types';

export default function ProfileScreen() {
  const { user, signOut, linkCompanyToken, updateUserProfile, updateUserPreferences } = useAuth();
  const { getUserInsights } = useData();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [companyToken, setCompanyToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [insights, setInsights] = useState<WellnessInsights | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [preferencesForm, setPreferencesForm] = useState({
    notifications: {
      email: user?.preferences?.notifications?.email ?? true,
      push: user?.preferences?.notifications?.push ?? true,
      moodReminders: user?.preferences?.notifications?.moodReminders ?? true,
      appointmentReminders: user?.preferences?.notifications?.appointmentReminders ?? true,
    },
    privacy: {
      shareAnonymousData: user?.preferences?.privacy?.shareAnonymousData ?? true,
      allowAnalytics: user?.preferences?.privacy?.allowAnalytics ?? true,
    },
    wellness: {
      dailyMoodTracking: user?.preferences?.wellness?.dailyMoodTracking ?? true,
      weeklyReports: user?.preferences?.wellness?.weeklyReports ?? true,
      preferredSessionType: user?.preferences?.wellness?.preferredSessionType || 'video' as const,
    },
    theme: user?.preferences?.theme || 'system' as const,
  });
  const [loading, setLoading] = useState(false);

  // Fetch user insights when component mounts or user changes
  useEffect(() => {
    const fetchInsights = async () => {
      if (user?.id) {
        try {
          const userInsights = await getUserInsights(user.id);
          setInsights(userInsights);
        } catch (error) {
          console.error('Failed to fetch insights:', error);
          // Set default insights if fetch fails
          setInsights({
            streakDays: 0,
            moodAverage: 0,
            totalSessions: 0,
            riskLevel: 'low'
          });
        }
      }
    };

    fetchInsights();
  }, [user?.id, getUserInsights]);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };

  const handleLinkCompany = async () => {
    if (!companyToken.trim()) {
      Alert.alert('Error', 'Please enter a valid company token');
      return;
    }

    setLoading(true);
    const success = await linkCompanyToken(companyToken.trim());
    setLoading(false);
    
    if (success) {
      Alert.alert('Success', 'Company benefits linked successfully!');
      setShowTokenInput(false);
      setCompanyToken('');
    } else {
      Alert.alert('Error', 'Invalid company token. Please check with your HR department.');
    }
  };

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    const success = await updateUserProfile({
      name: profileForm.name.trim(),
      email: profileForm.email.trim() || undefined
    });
    setLoading(false);

    if (success) {
      setIsEditingProfile(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } else {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    const success = await updateUserPreferences(preferencesForm);
    setLoading(false);

    if (success) {
      setIsEditingPreferences(false);
      Alert.alert('Success', 'Preferences updated successfully!');
    } else {
      Alert.alert('Error', 'Failed to update preferences. Please try again.');
    }
  };

  const handleCancelProfileEdit = () => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditingProfile(false);
  };

  const handleCancelPreferencesEdit = () => {
    setPreferencesForm({
      notifications: {
        email: user?.preferences?.notifications?.email ?? true,
        push: user?.preferences?.notifications?.push ?? true,
        moodReminders: user?.preferences?.notifications?.moodReminders ?? true,
        appointmentReminders: user?.preferences?.notifications?.appointmentReminders ?? true,
      },
      privacy: {
        shareAnonymousData: user?.preferences?.privacy?.shareAnonymousData ?? true,
        allowAnalytics: user?.preferences?.privacy?.allowAnalytics ?? true,
      },
      wellness: {
        dailyMoodTracking: user?.preferences?.wellness?.dailyMoodTracking ?? true,
        weeklyReports: user?.preferences?.wellness?.weeklyReports ?? true,
        preferredSessionType: user?.preferences?.wellness?.preferredSessionType || 'video' as const,
      },
      theme: user?.preferences?.theme || 'system' as const,
    });
    setIsEditingPreferences(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>
            Manage your account and privacy settings
          </Text>
        </View>

        {/* User Info */}
        <View style={styles.section}>
          <Card style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.avatar}>
                <User size={32} color="#6366f1" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {user?.isAnonymous ? 'Anonymous User' : user?.name || 'User'}
                </Text>
                <Text style={styles.userEmail}>
                  {user?.isAnonymous ? 'Anonymous Account' : user?.email}
                </Text>
                <View style={styles.anonymousId}>
                  <Shield size={16} color="#10b981" />
                  <Text style={styles.anonymousIdText}>
                    ID: {user?.anonymousId}
                  </Text>
                </View>
              </View>
              {!user?.isAnonymous && (
                <Pressable 
                  style={styles.editButton}
                  onPress={() => setIsEditingProfile(true)}
                >
                  <Edit size={20} color="#6b7280" />
                </Pressable>
              )}
            </View>

            {isEditingProfile && (
              <View style={styles.editForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={profileForm.name}
                    onChangeText={(text) => setProfileForm({ ...profileForm, name: text })}
                    placeholder="Enter your name"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={profileForm.email}
                    onChangeText={(text) => setProfileForm({ ...profileForm, email: text })}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.editActions}>
                  <Button
                    title="Cancel"
                    onPress={handleCancelProfileEdit}
                    variant="ghost"
                    style={styles.editAction}
                  />
                  <Button
                    title="Save"
                    onPress={handleSaveProfile}
                    style={styles.editAction}
                    disabled={loading}
                  />
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Wellness Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Wellness Journey</Text>
          <Card style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{insights?.streakDays || 0}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{(insights?.moodAverage || 0).toFixed(1)}</Text>
                <Text style={styles.statLabel}>Avg Mood</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{insights?.totalSessions || 0}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
            </View>
            <View style={styles.riskLevel}>
              <Text style={styles.riskLevelText}>
                Risk Level: <Text style={[
                  styles.riskLevelValue,
                  { color: (insights?.riskLevel || 'low') === 'low' ? '#10b981' : 
                           (insights?.riskLevel || 'low') === 'medium' ? '#f59e0b' : '#ef4444' }
                ]}>
                  {(insights?.riskLevel || 'low').toUpperCase()}
                </Text>
              </Text>
            </View>
          </Card>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <Pressable 
              style={styles.editButton}
              onPress={() => setIsEditingPreferences(true)}
            >
              <Settings size={20} color="#6b7280" />
            </Pressable>
          </View>
          
          <Card style={styles.preferencesCard}>
            {isEditingPreferences ? (
              <View style={styles.preferencesForm}>
                {/* Notifications */}
                <View style={styles.preferenceSection}>
                  <View style={styles.preferenceSectionHeader}>
                    <Bell size={20} color="#6366f1" />
                    <Text style={styles.preferenceSectionTitle}>Notifications</Text>
                  </View>
                  
                  <View style={styles.preferenceItems}>
                    {Object.entries(preferencesForm.notifications).map(([key, value]) => (
                      <Pressable
                        key={key}
                        style={styles.preferenceItem}
                        onPress={() => setPreferencesForm({
                          ...preferencesForm,
                          notifications: {
                            ...preferencesForm.notifications,
                            [key]: !value
                          }
                        })}
                      >
                        <Text style={styles.preferenceLabel}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Text>
                        <View style={[
                          styles.toggle,
                          value && styles.toggleActive
                        ]}>
                          <View style={[
                            styles.toggleThumb,
                            value && styles.toggleThumbActive
                          ]} />
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Privacy */}
                <View style={styles.preferenceSection}>
                  <View style={styles.preferenceSectionHeader}>
                    <Shield size={20} color="#10b981" />
                    <Text style={styles.preferenceSectionTitle}>Privacy</Text>
                  </View>
                  
                  <View style={styles.preferenceItems}>
                    {Object.entries(preferencesForm.privacy).map(([key, value]) => (
                      <Pressable
                        key={key}
                        style={styles.preferenceItem}
                        onPress={() => setPreferencesForm({
                          ...preferencesForm,
                          privacy: {
                            ...preferencesForm.privacy,
                            [key]: !value
                          }
                        })}
                      >
                        <Text style={styles.preferenceLabel}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Text>
                        <View style={[
                          styles.toggle,
                          value && styles.toggleActive
                        ]}>
                          <View style={[
                            styles.toggleThumb,
                            value && styles.toggleThumbActive
                          ]} />
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Theme */}
                <View style={styles.preferenceSection}>
                  <View style={styles.preferenceSectionHeader}>
                    <Palette size={20} color="#f59e0b" />
                    <Text style={styles.preferenceSectionTitle}>Theme</Text>
                  </View>
                  
                  <View style={styles.themeOptions}>
                    {(['light', 'dark', 'system'] as const).map((theme) => (
                      <Pressable
                        key={theme}
                        style={[
                          styles.themeOption,
                          preferencesForm.theme === theme && styles.themeOptionActive
                        ]}
                        onPress={() => setPreferencesForm({
                          ...preferencesForm,
                          theme
                        })}
                      >
                        <Text style={[
                          styles.themeOptionText,
                          preferencesForm.theme === theme && styles.themeOptionTextActive
                        ]}>
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.editActions}>
                  <Button
                    title="Cancel"
                    onPress={handleCancelPreferencesEdit}
                    variant="ghost"
                    style={styles.editAction}
                  />
                  <Button
                    title="Save"
                    onPress={handleSavePreferences}
                    style={styles.editAction}
                    disabled={loading}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.preferencesDisplay}>
                <Text style={styles.preferencesText}>
                  Notifications: {user?.preferences?.notifications?.email ? 'Enabled' : 'Disabled'}
                </Text>
                <Text style={styles.preferencesText}>
                  Privacy: {user?.preferences?.privacy?.shareAnonymousData ? 'Data sharing enabled' : 'Data sharing disabled'}
                </Text>
                <Text style={styles.preferencesText}>
                  Theme: {user?.preferences?.theme || 'System'}
                </Text>
              </View>
            )}
          </Card>
        </View>

        {/* Company Connection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Benefits</Text>
          {user?.companyConnection ? (
            <Card style={styles.companyCard}>
              <View style={styles.companyHeader}>
                <Building size={24} color="#10b981" />
                <Text style={styles.companyTitle}>Connected to Company</Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>VERIFIED</Text>
                </View>
              </View>
              <Text style={styles.companyToken}>
                Token: {user.companyConnection.token}
              </Text>
              <View style={styles.benefitsList}>
                <Text style={styles.benefitsTitle}>Your Benefits:</Text>
                {user.companyConnection.benefits.map((benefit, index) => (
                  <Text key={index} style={styles.benefitItem}>• {benefit}</Text>
                ))}
              </View>
            </Card>
          ) : (
            <Card style={styles.linkCompanyCard}>
              <View style={styles.linkCompanyHeader}>
                <Link size={24} color="#6366f1" />
                <Text style={styles.linkCompanyTitle}>Link Company Benefits</Text>
              </View>
              <Text style={styles.linkCompanyText}>
                Connect your company wellness program to access additional benefits and resources.
              </Text>
              
              {showTokenInput ? (
                <View style={styles.tokenInputContainer}>
                  <TextInput
                    style={styles.tokenInput}
                    placeholder="Enter company token (e.g., ABC-1234-DEMO-5678)"
                    value={companyToken}
                    onChangeText={setCompanyToken}
                    autoCapitalize="characters"
                  />
                  <View style={styles.tokenActions}>
                    <Button
                      title="Cancel"
                      onPress={() => {
                        setShowTokenInput(false);
                        setCompanyToken('');
                      }}
                      variant="ghost"
                      style={styles.tokenAction}
                    />
                    <Button
                      title="Link"
                      onPress={handleLinkCompany}
                      style={styles.tokenAction}
                      disabled={loading}
                    />
                  </View>
                </View>
              ) : (
                <Button
                  title="Link Company"
                  onPress={() => setShowTokenInput(true)}
                  style={styles.linkButton}
                />
              )}
            </Card>
          )}
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <Card style={styles.privacyCard}>
            <View style={styles.privacyHeader}>
              <Shield size={24} color="#6366f1" />
              <Text style={styles.privacyTitle}>Your Data is Protected</Text>
            </View>
            <Text style={styles.privacyText}>
              All your data is encrypted and anonymized. We use advanced privacy techniques 
              to ensure your personal information remains completely confidential.
            </Text>
            <View style={styles.privacyFeatures}>
              <Text style={styles.privacyFeature}>✓ End-to-end encryption</Text>
              <Text style={styles.privacyFeature}>✓ Anonymous data processing</Text>
              <Text style={styles.privacyFeature}>✓ No personal data storage</Text>
              <Text style={styles.privacyFeature}>✓ HIPAA compliant</Text>
            </View>
          </Card>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.accountActions}>
            <Pressable 
              style={[styles.accountAction, styles.signOutAction]}
              onPress={handleSignOut}
            >
              <LogOut size={20} color="#ef4444" />
              <Text style={[styles.accountActionText, styles.signOutText]}>Sign Out</Text>
            </Pressable>
          </View>
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
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  userCard: {
    padding: 20,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 8,
  },
  anonymousId: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anonymousIdText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10b981',
    marginLeft: 6,
  },
  editForm: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    backgroundColor: '#fafafa',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  editAction: {
    flex: 1,
  },
  statsCard: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  riskLevel: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  riskLevelText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  riskLevelValue: {
    fontFamily: 'Inter-Bold',
  },
  preferencesCard: {
    padding: 20,
  },
  preferencesForm: {
    gap: 24,
  },
  preferenceSection: {
    gap: 12,
  },
  preferenceSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  preferenceSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 8,
  },
  preferenceItems: {
    gap: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  preferenceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    flex: 1,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#6366f1',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  themeOptionActive: {
    backgroundColor: '#6366f1',
  },
  themeOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  themeOptionTextActive: {
    color: '#ffffff',
  },
  preferencesDisplay: {
    gap: 8,
  },
  preferencesText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  companyCard: {
    padding: 20,
    backgroundColor: '#f0fdf4',
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
  companyToken: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginBottom: 16,
  },
  benefitsList: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#bbf7d0',
  },
  benefitsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  benefitItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginBottom: 4,
  },
  linkCompanyCard: {
    padding: 20,
  },
  linkCompanyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkCompanyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginLeft: 12,
  },
  linkCompanyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
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
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginLeft: 12,
  },
  privacyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  privacyFeatures: {
    gap: 4,
  },
  privacyFeature: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6366f1',
  },
  accountActions: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
  },
  accountAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  accountActionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 12,
  },
  signOutAction: {
    backgroundColor: '#fef2f2',
  },
  signOutText: {
    color: '#ef4444',
  },
  bottomSpacing: {
    height: 20,
  },
});