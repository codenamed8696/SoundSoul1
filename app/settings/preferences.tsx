import React, { useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function PreferencesScreen() {
  const { preferences, fetchPreferences, updatePreferences } = useAuth();

  useEffect(() => { fetchPreferences(); }, []);

  if (!preferences) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Enable Mood Reminders</Text>
        <Switch
          value={preferences.mood_reminders_enabled}
          onValueChange={val => updatePreferences({ mood_reminders_enabled: val })}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Enable Journal Prompts</Text>
        <Switch
          value={preferences.journal_prompts_enabled}
          onValueChange={val => updatePreferences({ journal_prompts_enabled: val })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  label: { fontSize: 16, color: '#222' },
}); 