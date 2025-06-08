import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // Redirect unauthenticated users to auth
      router.replace('/(auth)/welcome');
    } else if (user.role !== 'user') {
      // Redirect non-user roles to their appropriate dashboards
      switch (user.role) {
        case 'employer':
          router.replace('/(employer)/dashboard');
          break;
        case 'counselor':
          router.replace('/(counselor)/dashboard');
          break;
        default:
          break;
      }
    }
  }, [user]);

  // Don't render if user is not authenticated or has wrong role
  if (!user || user.role !== 'user') {
    return null;
  }

  return <>{children}</>;
}