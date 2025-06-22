import React, { useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { DataProvider, useData } from '../context/DataContext';
import { ActivityIndicator, View } from 'react-native';
import { Profile } from '../types';

const LayoutController = () => {
  const { profile, loading: authLoading } = useAuth();
  const { dataLoading } = useData();
  const router = useRouter();

  const isLoading = authLoading || dataLoading;

  useEffect(() => {
    if (isLoading) return;

    if (profile?.role) {
      switch ((profile as Profile).role) {
        case 'employer':
          // Redirect employer to their dashboard (assuming it exists)
          router.replace('/(employer)/dashboard');
          break;
        case 'counselor':
          // ** THIS IS THE FIX **
          // We now redirect to the specific dashboard screen
          router.replace('/(counselor)/dashboard');
          break;
        case 'user':
        default:
          // Redirect user to the main tabs
          router.replace('/(tabs)');
          break;
      }
    } else {
      // If there's no profile (and thus no user), go to the auth flow.
      router.replace('/(auth)/welcome');
    }
  }, [profile, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <DataProvider>
        <LayoutController />
      </DataProvider>
    </AuthProvider>
  );
}