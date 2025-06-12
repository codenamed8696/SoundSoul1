import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { DataProvider } from '@/context/DataContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const InitialLayout = () => {
  const { session, profile, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (session && profile) {
      // User is signed in and has a profile, redirect them to the correct portal
      if (profile.role === 'employer' && segments[0] !== '(employer)') {
        router.replace('/(employer)/dashboard');
      } else if (profile.role === 'counselor' && segments[0] !== '(counselor)') {
        router.replace('/(counselor)/dashboard');
      } else if (profile.role === 'user' && segments[0] !== '(tabs)') {
        router.replace('/(tabs)');
      }
    } else if (!session && !inAuthGroup) {
      // User is not signed in and not in the auth group, send them to login.
      router.replace('/(auth)/login');
    }
  }, [session, profile, initialized, segments, router]);

  // Show a loading spinner while the auth state is initializing.
  // Once initialized, Slot will render the correct navigator.
  return initialized ? <Slot /> : <View style={styles.centered}><ActivityIndicator size="large" /></View>;
};

// The RootLayout sets up all providers and uses InitialLayout as the gatekeeper.
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DataProvider>
          <InitialLayout />
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});