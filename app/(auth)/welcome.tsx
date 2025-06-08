import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Shield, Heart, Brain, Users, ArrowRight, Sparkles } from 'lucide-react-native';
import { GradientBackground } from '@/components/common/GradientBackground';
import { Button } from '@/components/common/Button';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const features = [
  {
    icon: Shield,
    title: 'Complete Privacy',
    description: 'Anonymous support with end-to-end encryption',
    color: '#10b981',
  },
  {
    icon: Brain,
    title: 'AI Companion',
    description: '24/7 intelligent wellness support',
    color: '#6366f1',
  },
  {
    icon: Heart,
    title: 'Professional Care',
    description: 'Licensed therapists when you need them',
    color: '#ec4899',
  },
  {
    icon: Users,
    title: 'Workplace Wellness',
    description: 'Employer-sponsored mental health benefits',
    color: '#f59e0b',
  },
];

export default function WelcomeScreen() {
  const handleGetStarted = () => {
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <GradientBackground 
        colors={['#667eea', '#764ba2', '#f093fb']} 
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Hero Section */}
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
              No judgment, no records, just care.
            </Text>
          </Animated.View>

          {/* Hero Image */}
          <Animated.View 
            entering={FadeInUp.delay(400).duration(800)}
            style={styles.imageContainer}
          >
            <Image
              source={{ 
                uri: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
              }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay} />
          </Animated.View>
        </SafeAreaView>
      </GradientBackground>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <SafeAreaView edges={['bottom']}>
          <Animated.View 
            entering={FadeInDown.delay(600).duration(800)}
            style={styles.featuresContent}
          >
            <Text style={styles.featuresTitle}>Why Choose Our Platform?</Text>
            
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(800 + index * 100).duration(600)}
                  style={styles.featureCard}
                >
                  <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                    <feature.icon size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </Animated.View>
              ))}
            </View>

            <Animated.View 
              entering={FadeInDown.delay(1200).duration(600)}
              style={styles.ctaSection}
            >
              <Button
                title="Get Started"
                onPress={handleGetStarted}
                style={styles.ctaButton}
                textStyle={styles.ctaButtonText}
              />
              
              <Pressable 
                style={styles.learnMoreButton}
                onPress={handleGetStarted}
              >
                <Text style={styles.learnMoreText}>Learn more about privacy</Text>
                <ArrowRight size={16} color="#6b7280" />
              </Pressable>
            </Animated.View>

            {/* Trust Indicators */}
            <Animated.View 
              entering={FadeInDown.delay(1400).duration(600)}
              style={styles.trustSection}
            >
              <View style={styles.trustIndicators}>
                <View style={styles.trustItem}>
                  <Shield size={16} color="#10b981" />
                  <Text style={styles.trustText}>HIPAA Compliant</Text>
                </View>
                <View style={styles.trustItem}>
                  <Shield size={16} color="#10b981" />
                  <Text style={styles.trustText}>End-to-End Encrypted</Text>
                </View>
                <View style={styles.trustItem}>
                  <Shield size={16} color="#10b981" />
                  <Text style={styles.trustText}>Anonymous by Design</Text>
                </View>
              </View>
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
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 40,
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
  imageContainer: {
    flex: 1,
    marginTop: 20,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderRadius: 24,
  },
  featuresSection: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingTop: 32,
    minHeight: height * 0.6,
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
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 40,
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
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
  ctaButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  learnMoreText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginRight: 8,
  },
  trustSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  trustIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  trustText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10b981',
    marginLeft: 6,
  },
});