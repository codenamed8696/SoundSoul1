import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Heart, MessageSquare, Calendar, User, Book } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // <-- THIS LINE HIDES ALL HEADERS IN THE TABS
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 5,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ color }) => <Home color={color} /> }} />
      <Tabs.Screen name="wellness" options={{ tabBarIcon: ({ color }) => <Heart color={color} /> }} />
      <Tabs.Screen name="chat" options={{ tabBarIcon: ({ color }) => <MessageSquare color={color} /> }} />
      <Tabs.Screen name="journal" options={{ title: 'Journal', tabBarIcon: ({ color }) => <Book color={color} /> }} />
      <Tabs.Screen name="appointments" options={{ title: 'Appointments', tabBarIcon: ({ color }) => <Calendar color={color} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ color }) => <User color={color} /> }} />
    </Tabs>
  );
}