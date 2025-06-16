import { Stack, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { Profile } from '@/types';
import { ActivityIndicator, View } from 'react-native';

export default function AuthLayout() {
  const { user, loading, profile } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.is_anonymous) {
        router.replace('/(tabs)');
        return;
      }
      if (profile && profile.role) {
        switch ((profile as Profile).role) {
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
      // If a registered user has no role, they will remain in the auth flow
      // to be directed to the role selection screen.
    }
  }, [user, loading, profile]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      {/* All routes for the different auth flows are now included */}
      <Stack.Screen name="link-employer" />
      <Stack.Screen name="anonymous-welcome" />
      <Stack.Screen name="role-selection" />
    </Stack>
  );
}