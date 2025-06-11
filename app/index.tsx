import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const { session, initialized, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the authentication context is fully initialized.
    if (!initialized) {
      return;
    }

    if (session && profile) {
      // We have a session and a user profile, so redirect based on role.
      if (profile.role === 'employer') {
        router.replace('/(employer)/dashboard');
      } else if (profile.role === 'counselor') {
        router.replace('/(counselor)/dashboard');
      } else {
        // Default for 'user' role.
        router.replace('/(tabs)');
      }
    } else if (!session) {
      // No session, send the user to the login screen.
      router.replace('/(auth)/login');
    }
    // If there's a session but no profile yet, we just wait. The hook will re-run when profile loads.

  }, [initialized, session, profile, router]);

  // Show a loading spinner until the initial redirect happens.
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
  },
});