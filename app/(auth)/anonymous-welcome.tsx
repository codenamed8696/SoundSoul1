import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { GradientBackground } from '@/components/common/GradientBackground';
import { Button } from '@/components/common/Button';
import { ShieldCheck, MessageSquare, Calendar } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const AnonymousWelcomeScreen = () => {
  const handleContinue = () => {
    // Navigate to the main app, where the layout will direct to the user tabs
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <GradientBackground colors={['#1e3a8a', '#3b0764']} />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View entering={FadeInUp.delay(200).duration(800)}>
          <Text style={styles.title}>You are now anonymous</Text>
          <Text style={styles.subtitle}>
            Here’s how we protect your privacy while you explore the app.
          </Text>
        </Animated.View>

        <View style={styles.featuresContainer}>
          <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.feature}>
            <ShieldCheck size={32} color="#34d399" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Your Session is Secure</Text>
              <Text style={styles.featureDescription}>
                Your data is tied only to this device. No personal details are stored.
              </Text>
            </View>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.feature}>
            <MessageSquare size={32} color="#60a5fa" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Access Core Features</Text>
              <Text style={styles.featureDescription}>
                You can explore wellness tools and chat with our AI companion.
              </Text>
            </View>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(800).duration(800)} style={styles.feature}>
            <Calendar size={32} color="#f472b6" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Unlock More by Registering</Text>
              <Text style={styles.featureDescription}>
                To book therapy sessions or save your data across devices, you can create an account or add an employer code later.
              </Text>
            </View>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInUp.delay(1000).duration(800)}>
          <Button title="Got it, let's go!" onPress={handleContinue} />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#e0e7ff',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 26,
  },
  featuresContainer: {
    marginTop: -40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  featureText: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  featureDescription: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#d1d5db',
    marginTop: 4,
    lineHeight: 22,
  },
});

export default AnonymousWelcomeScreen;