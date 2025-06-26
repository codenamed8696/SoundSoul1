import React from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Home, Calendar, MessageSquare, Heart, Book, User } from 'lucide-react-native';

// Helper component to style the icons and add a focus indicator
const TabBarIcon = (IconComponent: React.ElementType) => ({ color, focused }: { color: string; focused: boolean }) => (
    <View style={{ 
        alignItems: 'center', 
        justifyContent: 'center',
        borderTopColor: focused ? '#6366f1' : 'transparent', // Highlight for focused tab
        borderTopWidth: 2,
        paddingTop: 4,
        width: '100%',
        height: '100%'
    }}>
        <IconComponent color={color} size={24} />
    </View>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true, // Show labels for clarity
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60, // Standard height for better touch targets
          paddingBottom: 5,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: TabBarIcon(Home) }} />
      <Tabs.Screen name="appointments" options={{ title: "Appointments", tabBarIcon: TabBarIcon(Calendar) }} />
      <Tabs.Screen name="chat" options={{ title: "Chat", tabBarIcon: TabBarIcon(MessageSquare) }} />
      <Tabs.Screen name="wellness" options={{ title: "Wellness", tabBarIcon: TabBarIcon(Heart) }} />
      <Tabs.Screen name="journal" options={{ title: "Journal", tabBarIcon: TabBarIcon(Book) }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: TabBarIcon(User) }} />
    </Tabs>
  );
}