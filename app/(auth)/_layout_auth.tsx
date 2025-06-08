import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to their appropriate dashboard
      switch (user.role) {
        case 'employer':
          router.replace('/(employer)');
          break;
        case 'counselor':
          router.replace('/(counselor)');
          break;
        default:
          router.replace('/(tabs)');
          break;
      }
    }
  }, [user, loading]);

  // Don't render auth screens if user is already authenticated
  if (loading) {
    return null;
  }

  if (user) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
    </Stack>
  );
}