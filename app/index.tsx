import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, Text, StyleSheet } from 'react-native';
import { Shield } from 'lucide-react-native';

export default function IndexScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
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
      } else {
        // Redirect unauthenticated users to welcome screen
        router.replace('/(auth)/welcome');
      }
    }
  }, [user, loading]);

  // Show loading while determining where to redirect
  return (
    <View style={styles.container}>
      <Shield size={48} color="#6366f1" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginTop: 16,
  },
});