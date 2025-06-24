//
// NAME: app/_layout.tsx
//
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DataProvider, useData } from '@/context/DataContext';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

const LayoutController = () => {
  const { user, profile, authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const dataContext = useData();

  useEffect(() => {
    if (authLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inCounselorGroup = segments[0] === '(counselor)';
    const inEmployerGroup = segments[0] === '(employer)';

    if (user && profile) {
      if (dataContext?.dataLoading) return;
      
      // Only redirect if not already in the correct group
      if (profile.role === 'counselor' && !inCounselorGroup) {
        console.log('Redirecting counselor to dashboard');
        router.replace('/(counselor)/dashboard');
      } else if (profile.role === 'employer' && !inEmployerGroup) {
        console.log('Redirecting employer to dashboard');
        router.replace('/(employer)/dashboard');
      } else if (profile.role === 'user' && !inTabsGroup) {
        console.log('Redirecting user to tabs');
        router.replace('/(tabs)');
      }
    } else if (!user && !inAuthGroup) {
      console.log('Redirecting to auth');
      router.replace('/(auth)/welcome');
    }
  }, [user, profile, authLoading, dataContext?.dataLoading, segments]);

  // THE FIX: This is the core rendering logic change.
  // If the initial auth check is still running, show a full-screen loader.
  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Once auth is checked, show the correct screen group.
  return <Slot />;
};

export default function RootLayout() {
  return (
    // THE FIX: The DataProvider now wraps the LayoutController.
    // This ensures that the DataProvider is ONLY mounted when the user
    // is authenticated, breaking the deadlock.
    <AuthProvider>
      <DataProvider>
        <LayoutController />
      </DataProvider>
    </AuthProvider>
  );
}