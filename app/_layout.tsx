import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

function RootLayoutNav() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Wait until the initial loading is complete before doing any navigation.
    if (loading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    // Condition 1: If the user is not signed in and they are NOT in the auth group,
    // redirect them to the welcome screen.
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } 
    // Condition 2: If the user IS signed in and has a profile, and they ARE in the auth group,
    // redirect them to their correct home portal.
    else if (user && profile && inAuthGroup) {
      // Determine the home route based on the user's role from their profile.
      const homeRoute =
        profile.role === 'user' ? '/(tabs)' :
        profile.role === 'counselor' ? '/(counselor)/dashboard' :
        profile.role === 'employer' ? '/(employer)/dashboard' :
        '/(auth)/welcome'; // Fallback to welcome screen if role is unknown
      router.replace(homeRoute);
    }
  }, [user, profile, loading, segments, router]); // This effect depends on all these values

  // While loading, show a full-screen spinner to prevent UI flashes.
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }
  
  // Once loading is complete, render the current route.
  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <DataProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
        </GestureHandlerRootView>
      </DataProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc' // Match your app's background color
  }
});