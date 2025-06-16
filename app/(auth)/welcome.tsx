import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Shield, Heart, Brain, Users, ArrowRight, Sparkles } from 'lucide-react-native';
import { GradientBackground } from '@/components/common/GradientBackground';
import { Button } from '@/components/common/Button';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { signInAnonymously, loading } = useAuth();

  const handleGetStarted = () => {
    router.push('/(auth)/signup');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleAnonymous = async () => {
    const { error } = await signInAnonymously();
    if (error) {
      Alert.alert('Error', 'Could not proceed anonymously. Please try again.');
    } else {
      // On success, navigate to the new informational screen
      router.push('/(auth)/anonymous-welcome');
    }
  };

  return (
    <View style={styles.container}>
      <GradientBackground 
        colors={['#667eea', '#764ba2', '#f093fb']} 
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea}>
          <Animated.View 
            entering={FadeInUp.delay(200).duration(800)}
            style={styles.heroSection}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoBackground}>
                <Sparkles size={32} color="#ffffff" />
              </View>
            </View>
            <Text style={styles.heroTitle}>
              Your Mental Health,{'\n'}
              <Text style={styles.heroTitleAccent}>Completely Private</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Anonymous wellness support powered by AI and professional therapists.
            </Text>
          </Animated.View>
        </SafeAreaView>
      </GradientBackground>

      <View style={styles.featuresSection}>
        <SafeAreaView edges={['bottom']}>
          <Animated.View 
            entering={FadeInDown.delay(600).duration(800)}
            style={styles.featuresContent}
          >
            <Text style={styles.featuresTitle}>How would you like to start?</Text>
            
            <Animated.View 
              entering={FadeInDown.delay(800).duration(600)}
              style={styles.ctaSection}
            >
              <Button
                title="Create a Personal Account"
                onPress={handleGetStarted}
                style={styles.ctaButton}
                textStyle={styles.ctaButtonText}
              />
              <Button
                title={loading ? '' : "Continue Anonymously"}
                onPress={handleAnonymous}
                style={[styles.ctaButton, styles.secondaryButton]}
                textStyle={[styles.ctaButtonText, styles.secondaryButtonText]}
                disabled={loading}
              >
                {loading && <ActivityIndicator color="#4f46e5"/>}
              </Button>
              
              <Pressable 
                style={styles.learnMoreButton}
                onPress={handleLogin}
              >
                <Text style={styles.learnMoreText}>Already have an account? Log In</Text>
                <ArrowRight size={16} color="#6b7280" />
              </Pressable>
            </Animated.View>
          </Animated.View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
      },
      background: {
        flex: 1,
      },
      safeArea: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
      },
      heroSection: {
        alignItems: 'center',
        paddingBottom: 20,
      },
      logoContainer: {
        marginBottom: 32,
      },
      logoBackground: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
      heroTitle: {
        fontSize: 36,
        fontFamily: 'Inter-Bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 44,
      },
      heroTitleAccent: {
        color: '#fbbf24',
      },
      heroSubtitle: {
        fontSize: 18,
        fontFamily: 'Inter-Regular',
        color: '#e0e7ff',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 20,
      },
      featuresSection: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -32,
        paddingTop: 32,
      },
      featuresContent: {
        paddingHorizontal: 20,
      },
      featuresTitle: {
        fontSize: 28,
        fontFamily: 'Inter-Bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 32,
      },
      ctaSection: {
        alignItems: 'center',
        marginBottom: 32,
      },
      ctaButton: {
        width: '100%',
        paddingVertical: 18,
        backgroundColor: '#6366f1',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
      },
      secondaryButton: {
        backgroundColor: '#f8fafc',
        shadowColor: '#9ca3af',
        elevation: 4,
      },
      ctaButtonText: {
        fontSize: 18,
        fontFamily: 'Inter-SemiBold',
      },
      secondaryButtonText: {
        color: '#4f46e5',
      },
      learnMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 8,
      },
      learnMoreText: {
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        color: '#6b7280',
        marginRight: 8,
      },
});