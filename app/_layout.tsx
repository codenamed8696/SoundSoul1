import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, View } from 'react-native';

// This is the component that will now correctly handle all navigation logic.
function RootLayoutNav() {
  // We get the full auth state, including the user's profile.
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // 1. Wait until the authentication state is fully loaded from the context.
    if (loading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    // 2. If there is NO user, and we are not already in the authentication screens,
    //    force a redirect to the welcome screen.
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } 
    // 3. If there IS a user AND their profile is loaded, and they are stuck on an auth screen,
    //    redirect them to their correct home portal based on their role.
    else if (user && profile && inAuthGroup) {
      const homeRoute =
        profile.role === 'user' ? '/(tabs)' :
        profile.role === 'counselor' ? '/(counselor)/dashboard' :
        profile.role === 'employer' ? '/(employer)/dashboard' :
        '/(auth)/welcome'; // Fallback in case of an unknown role
      router.replace(homeRoute);
    }
  }, [user, profile, loading, segments, router]);

  // While the AuthContext is initializing, we show a loading screen.
  // This prevents the app from showing a broken screen before the redirection logic can run.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Once loading is complete, the <Slot /> component will render the correct screen
  // based on the navigation state determined by the useEffect hook above.
  return <Slot />;
}

// This is the main layout component for your entire app.
export default function RootLayout() {
  // The provider structure is critical and correct: AuthProvider wraps everything.
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