import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { GradientBackground } from '@/components/common/GradientBackground';
import { Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { GoogleIcon } from '@/components/common/GoogleIcon'; // Import icon
import { AppleIcon } from '@/components/common/AppleIcon'; // Import icon

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useAuth(); // Removed social methods for now
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    const { error } = await signIn(email, password);
    if (error) {
      Alert.alert('Login Error', error.message);
    }
  };

  // Placeholder function for social logins
  const handleComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature will be available soon.');
  };

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#667eea', '#764ba2', '#f093fb']} />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color="#ffffff" />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to continue your journey</Text>
        <Card style={styles.card}>
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={handleComingSoon}>
              <GoogleIcon />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={[styles.socialButton, styles.appleButton]} onPress={handleComingSoon}>
                <AppleIcon color="white" />
                <Text style={[styles.socialButtonText, styles.appleButtonText]}>Continue with Apple</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>
          <View style={styles.inputContainer}>
            <Mail size={20} color="#6b7280" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <Lock size={20} color="#6b7280" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <Button
            title={loading ? 'Logging In...' : 'Log In'}
            onPress={handleLogin}
            disabled={loading}
            style={styles.button}
          >
             {loading && <ActivityIndicator color="#ffffff" style={{ marginRight: 8 }} />}
          </Button>
        </Card>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <Text style={styles.link}>Sign Up</Text>
          </Link>
        </View>
      </View>
    </View>
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
    icon: { marginRight: 8 },
    input: { flex: 1, height: 50, color: '#111827', fontSize: 16 },
    button: { marginTop: 8 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    footerText: { color: '#e0e7ff' },
    link: { color: '#fbbf24', fontWeight: 'bold' },
});

export default LoginScreen;