import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Redirect } from 'expo-router';

export default function StartPage() {
  const { loading, user, profile } = useAuth();

  // While the AuthContext is figuring out if a user is logged in, show a spinner.
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // If loading is finished and there's no user, go to the welcome screen.
  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // If there IS a user and we have their profile, go to the correct portal.
  if (profile) {
    const targetPath = profile.role === 'user' ? '/(tabs)' : `/${profile.role}/dashboard`;
    return <Redirect href={targetPath as `/${string}`} />;
  }

  // This is a fallback case if the user exists but the profile is still loading.
  // It keeps the spinner on screen, preventing a crash.
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
});