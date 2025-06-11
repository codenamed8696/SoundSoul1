import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { DataProvider } from '@/context/DataContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const InitialLayout = () => {
  const { session, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAppGroup = segments[0] === '(app)';

    if (session && !inAppGroup) {
      // User is signed in but not in the (app) group, redirect them inside.
      router.replace('/(app)');
    } else if (!session) {
      // User is not signed in, redirect them to the auth flow.
      router.replace('/(auth)/login');
    }
  }, [session, initialized, segments, router]);

  // While the session is being checked, show a loading spinner.
  // If initialized, Slot will render either the (app) or (auth) layout.
  return initialized ? <Slot /> : <View style={styles.centered}><ActivityIndicator size="large" /></View>;
};

// The RootLayout now only sets up providers and renders the InitialLayout.
// This prevents the providers from ever being re-mounted during a navigation change.
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