import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext'; // Corrected import path
import { GradientBackground } from '@/components/common/GradientBackground';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { GoogleIcon } from '@/components/common/GoogleIcon';
import { AppleIcon } from '@/components/common/AppleIcon';

const SignupScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, loading } = useAuth();
  const router = useRouter();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    const { error } = await signUp(email, password, name);
    if (error) {
      Alert.alert('Registration Error', error.message);
    } else {
      // ** CHANGE HERE: The user is now automatically redirected by the root layout. **
      // We no longer need to navigate manually from here.
      Alert.alert('Account Created!', 'Please check your email to verify your account. Redirecting you now...');
    }
  };

  const handleComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature is not yet implemented.');
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your journey with SoundSoul today.</Text>
          <Card style={styles.card}>
            {/* Social Logins */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton} onPress={handleComingSoon}>
                <GoogleIcon size={22} />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, styles.appleButton]} onPress={handleComingSoon}>
                <AppleIcon size={22} />
                <Text style={[styles.socialButtonText, styles.appleButtonText]}>Continue with Apple</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            {/* Form Inputs */}
            <View style={styles.inputContainer}>
                <User color="#9CA3AF" size={20} />
                <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#9CA3AF" value={name} onChangeText={setName} />
            </View>
            <View style={styles.inputContainer}>
                <Mail color="#9CA3AF" size={20} />
                <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#9CA3AF" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.inputContainer}>
                <Lock color="#9CA3AF" size={20} />
                <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#9CA3AF" value={password} onChangeText={setPassword} secureTextEntry />
            </View>
            
            <Button onPress={handleSignup} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : 'Create Account'}
            </Button>
          </Card>
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}> Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center' },
    content: { padding: 20 },
    backButton: { position: 'absolute', top: 60, left: 16, zIndex: 1 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#e0e7ff', textAlign: 'center', marginBottom: 24 },
    card: { padding: 24 },
    socialContainer: { marginBottom: 16 },
    socialButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 14, marginBottom: 12 },
    socialButtonText: { color: '#374151', fontWeight: '600', marginLeft: 12, fontSize: 16 },
    appleButton: { backgroundColor: '#000000' },
    appleButtonText: { color: '#ffffff' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    divider: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
    dividerText: { marginHorizontal: 12, color: '#6b7280' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, marginBottom: 16, paddingHorizontal: 12 },
    input: { flex: 1, paddingVertical: Platform.OS === 'ios' ? 14 : 10, paddingHorizontal: 8, color: '#111827', fontSize: 16 },
    loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
    loginText: { color: '#e0e7ff' },
    loginLink: { color: '#fff', fontWeight: 'bold' }
});

export default SignupScreen;