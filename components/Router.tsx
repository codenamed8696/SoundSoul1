import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';

export function Router() {
  const { session, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    // If the authentication state is still loading, do nothing.
    if (loading) {
      return;
    }

    const inTabsGroup = segments[0] === '(tabs)';

    // --- Redirection Logic ---

    // 1. If the user is logged in AND has a role...
    if (session && profile?.role) {
      // ...and they are NOT in the main app group, send them there.
      if (!inTabsGroup) {
        router.replace('/(tabs)');
      }
    } 
    // 2. If the user is logged in BUT has NO role...
    else if (session && !profile?.role) {
      // ...send them to the role selection screen.
      router.replace('/(auth)/role-selection');
    } 
    // 3. If the user is NOT logged in...
    else if (!session) {
      // ...send them to the welcome screen.
      router.replace('/(auth)/welcome');
    }
  }, [session, profile, loading]);

  // While the useEffect is figuring out where to send the user,
  // show a loading spinner.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Once loading is complete, the `Slot` will render the screen that the
  // useEffect has navigated to.
  return <Slot />;
}