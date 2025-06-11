import { Tabs } from 'expo-router';
import { BarChart, FileText, Settings } from 'lucide-react-native';
import { useData } from '@/context/DataContext';
import { useEffect } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';

export default function EmployerTabLayout() {
  // 1. Get the analytics data AND the specific loading state for analytics
  const { companyAnalytics, loading, getCompanyAnalytics } = useData();

  // 2. Fetch the data when the component loads
  useEffect(() => {
    getCompanyAnalytics();
  }, []);

  // 3. CRITICAL FIX: Add a loading check. While loading, show a spinner.
  if (loading.analytics) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // 4. Add a check for after loading is done but no data was found.
  if (!companyAnalytics) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Could not load company analytics.</Text>
      </View>
    );
  }

  // 5. It is now safe to render the layout and access analytics data.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <BarChart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}