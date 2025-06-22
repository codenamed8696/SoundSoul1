import { Stack, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { Profile } from '../../types';
import { ActivityIndicator, View } from 'react-native';

export default function AuthLayout() {
  const { user, loading, profile } = useAuth();

  useEffect(() => {
    // This logic correctly redirects authenticated users out of the auth flow
    if (!loading && profile?.role) {
        router.replace('/(tabs)'); // or counselor/employer dashboards
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
        {/* THIS HIDES HEADERS FOR ALL AUTH SCREENS */}
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="anonymous-welcome" />
    </Stack>
  );
}