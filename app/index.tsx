import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { loading, user, profile } = useAuth();

  // 1. Show a loading indicator while the AuthContext is checking the user's session and profile.
  if (loading || (user && !profile)) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // 2. Once loading is complete, redirect based on the user's auth state and role.
  if (user && profile) {
    // Redirect based on the user's role from their profile
    switch (profile.role) {
      case 'user':
        // THE FIX: Redirect to the (tabs) layout group, which defaults to its own index.tsx
        return <Redirect href="/(tabs)" />;
      case 'counselor':
        return <Redirect href="/(counselor)" />;
      case 'employer':
        return <Redirect href="/(employer)" />;
      default:
        // Fallback for any unexpected roles
        return <Redirect href="/(auth)/welcome" />;
    }
  } else {
    // If the user is not logged in, redirect to the welcome screen.
    return <Redirect href="/(auth)/welcome" />;
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})
