import React from 'react';
import { View, Text, Button, StyleSheet, Linking, Alert } from 'react-native';
import { supabase } from '@/context/supabaseClient';

const PRIVACY_POLICY_URL = 'https://your-privacy-policy-url.com'; // Replace with your actual privacy policy URL

export default function PrivacyScreen() {
  const handleExport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('export-data');
      if (error) throw error;
      Alert.alert('Success', 'Your data export has been initiated. You will receive an email with your data shortly.');
    } catch (e) {
      Alert.alert('Error', 'Could not export your data.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacy & Data</Text>
      <Button title="View Privacy Policy" onPress={() => Linking.openURL(PRIVACY_POLICY_URL)} />
      <View style={{ height: 24 }} />
      <Button title="Export My Data" onPress={handleExport} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 24 },
}); 