import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/context/supabaseClient';

export default function CompanyScreen() {
  const { profile } = useAuth();
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      if (profile?.organization_id) {
        const { data } = await supabase.from('organizations').select('*').eq('id', profile.organization_id).single();
        setCompany(data);
      }
    };
    fetchCompany();
  }, [profile?.organization_id]);

  if (!profile?.organization_id) {
    return <View style={styles.container}><Text>You are not currently part of a company plan.</Text></View>;
  }

  if (!company) {
    return <View style={styles.container}><Text>Loading company info...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Company Name</Text>
      <Text style={styles.value}>{company.name}</Text>
      <Text style={styles.label}>Plan Type</Text>
      <Text style={styles.value}>{company.plan_type || 'Standard'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  label: { fontSize: 16, color: '#222', marginTop: 16 },
  value: { fontSize: 16, color: '#6366f1', marginBottom: 8 },
}); 