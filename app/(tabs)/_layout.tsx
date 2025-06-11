import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Home, MessageCircle, Calendar, User, Heart } from 'lucide-react-native';

export default function TabLayout() {
  // All redirect and loading logic has been removed from this file.
  // It is now only responsible for rendering the tabs for a standard user.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ size, color }) => (<Home size={size} color={color} />) }} />
      <Tabs.Screen name="wellness" options={{ title: 'Wellness', tabBarIcon: ({ size, color }) => (<Heart size={size} color={color} />) }} />
      <Tabs.Screen name="chat" options={{ title: 'AI Chat', tabBarIcon: ({ size, color }) => (<MessageCircle size={size} color={color} />) }} />
      <Tabs.Screen name="appointments" options={{ title: 'Therapy', tabBarIcon: ({ size, color }) => (<Calendar size={size} color={color} />) }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ size, color }) => (<User size={size} color={color} />) }} />
    </Tabs>
  );
}