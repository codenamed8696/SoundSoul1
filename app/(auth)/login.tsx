import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Shield, Mail, Lock, User, Building, Stethoscope, Settings, ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { GradientBackground } from '@/components/common/GradientBackground';
import { useAuth } from '@/context/AuthContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const userTypes = [
  {
    id: 'user',
    title: 'Employee/Individual',
    description: 'Access wellness tools and therapy',
    icon: User,
    color: '#6366f1',
  },
  {
    id: 'employer',
    title: 'Employer/HR',
    description: 'View company wellness analytics',
    icon: Building,
    color: '#10b981',
  },
  {
    id: 'counselor',
    title: 'Therapist/Counselor',
    description: 'Manage clients and sessions',
    icon: Stethoscope,
    color: '#f59e0b',
  },
  {
    id: 'admin',
    title: 'System Admin',
    description: 'Full system access',
    icon: Settings,
    color: '#ec4899',
  },
];

export default function LoginScreen() {
  const { signIn, signUp, signInAnonymously, loading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'anonymous'>('signin');
  const [selectedUserType, setSelectedUserType] = useState<string>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const success = await signIn(email, password);
    if (!success) {
      Alert.alert('Error', 'Invalid credentials. Try: demo@example.com / password');
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const success = await signUp(email, password, name);
    if (!success) {
      Alert.alert('Error', 'Failed to create account');
    }
  };

  const handleAnonymousSignIn = async () => {
    const success = await signInAnonymously();
    if (!success) {
      Alert.alert('Error', 'Failed to sign in anonymously');
    }
  };

  const getDemoCredentials = (userType: string) => {
    switch (userType) {
      case 'employer':
        return { email: 'employer@example.com', password: 'password' };
      case 'counselor':
        return { email: 'counselor@example.com', password: 'password' };
      case 'admin':
        return { email: 'admin@example.com', password: 'password' };
      default:
        return { email: 'demo@example.com', password: 'password' };
    }
  };

  const handleDemoLogin = () => {
    const credentials = getDemoCredentials(selectedUserType);
    setEmail(credentials.email);
    setPassword(credentials.password);
    setMode('signin');
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#667eea', '#764ba2']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Pressable style={styles.backButton} onPress={handleBack}>
              <ArrowLeft size={24} color="#ffffff" />
            </Pressable>
            <View style={styles.headerTitleContainer}>
              <Shield size={32} color="#ffffff" />
              <Text style={styles.headerTitle}>Welcome Back</Text>
              <Text style={styles.headerSubtitle}>
                Choose your account type and sign in
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </GradientBackground>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Type Selection */}
        <Animated.View 
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>I am a...</Text>
          <View style={styles.userTypesGrid}>
            {userTypes.map((type, index) => (
              <Animated.View
                key={type.id}
                entering={FadeInUp.delay(300 + index * 100).duration(600)}
              >
                <Pressable
                  style={[
                    styles.userTypeCard,
                    selectedUserType === type.id && styles.userTypeCardSelected,
                    { borderColor: selectedUserType === type.id ? type.color : 'transparent' }
                  ]}
                  onPress={() => setSelectedUserType(type.id)}
                >
                  <View
                    style={[styles.userTypeIcon, { backgroundColor: type.color }]}
                  >
                    <type.icon size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.userTypeTitle}>{type.title}</Text>
                  <Text style={styles.userTypeDescription}>{type.description}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Demo Login Button */}
        <Animated.View 
          entering={FadeInDown.delay(700).duration(600)}
          style={styles.section}
        >
          <Button
            title={`Demo Login as ${userTypes.find(t => t.id === selectedUserType)?.title}`}
            onPress={handleDemoLogin}
            style={[
              styles.demoButton,
              { backgroundColor: userTypes.find(t => t.id === selectedUserType)?.color }
            ]}
          />
        </Animated.View>

        {/* Authentication Forms */}
        <Animated.View 
          entering={FadeInDown.delay(800).duration(600)}
        >
          <Card style={styles.authCard}>
            <View style={styles.authTabs}>
              <Button
                title="Sign In"
                onPress={() => setMode('signin')}
                variant={mode === 'signin' ? 'primary' : 'ghost'}
                style={styles.authTab}
              />
              <Button
                title="Sign Up"
                onPress={() => setMode('signup')}
                variant={mode === 'signup' ? 'primary' : 'ghost'}
                style={styles.authTab}
              />
            </View>

            {mode !== 'anonymous' && (
              <View style={styles.form}>
                {mode === 'signup' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Name (Optional)</Text>
                    <View style={styles.inputContainer}>
                      <User size={20} color="#6b7280" />
                      <TextInput
                        style={styles.input}
                        placeholder="Your name"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <View style={styles.inputContainer}>
                    <Mail size={20} color="#6b7280" />
                    <TextInput
                      style={styles.input}
                      placeholder="your@email.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputContainer}>
                    <Lock size={20} color="#6b7280" />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholderTextColor="#9ca3af"
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#6b7280" />
                      ) : (
                        <Eye size={20} color="#6b7280" />
                      )}
                    </Pressable>
                  </View>
                </View>

                <Button
                  title={mode === 'signin' ? 'Sign In' : 'Create Account'}
                  onPress={mode === 'signin' ? handleSignIn : handleSignUp}
                  style={styles.authButton}
                />
              </View>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title="Continue Anonymously"
              onPress={handleAnonymousSignIn}
              variant="ghost"
              style={styles.anonymousButton}
            />

            <Text style={styles.privacyNote}>
              All data is encrypted and anonymized. We never store personally identifiable information.
            </Text>
          </Card>
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
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
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  header: {
    paddingBottom: 40,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#e0e7ff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 16,
  },
  userTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  userTypeCard: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userTypeCardSelected: {
    backgroundColor: '#f0f9ff',
    transform: [{ scale: 1.02 }],
  },
  userTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userTypeTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  userTypeDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
  demoButton: {
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  authCard: {
    padding: 24,
  },
  authTabs: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  authTab: {
    flex: 1,
  },
  form: {
    marginBottom: 24,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    minHeight: 52,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  eyeButton: {
    padding: 4,
  },
  authButton: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  anonymousButton: {
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderColor: '#e5e7eb',
  },
  privacyNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 40,
  },
});