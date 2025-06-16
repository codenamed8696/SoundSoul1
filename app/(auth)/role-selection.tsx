import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { GradientBackground } from '@/components/common/GradientBackground';
import { Card } from '@/components/common/Card';
import { User, Heart, Briefcase, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Role = 'user' | 'counselor' | 'employer';

const RoleSelectionScreen = () => {
  const router = useRouter();
  const { updateUserRole, signOut } = useAuth();

  const handleRoleSelection = async (role: Role) => {
    if (!updateUserRole) {
      Alert.alert("Error", "Could not update role at this time.");
      return;
    }
    
    const { error } = await updateUserRole(role);

    if (error) {
        Alert.alert('Error Updating Role', error.message);
    } else {
        // The layout will automatically redirect to the correct dashboard now
        Alert.alert('Profile Updated!', 'Your role has been set. Redirecting you now.');
    }
  };

  const handleSignOut = async () => {
      await signOut();
      router.replace('/(auth)/welcome');
  }

  return (
    <View style={styles.container}>
        <GradientBackground colors={['#667eea', '#764ba2', '#f093fb']} />
        <SafeAreaView style={styles.safeArea}>
            <View>
                <Text style={styles.title}>One Last Step</Text>
                <Text style={styles.subtitle}>Choose your role to personalize your experience.</Text>
            </View>
            <View style={styles.cardContainer}>
                <RoleCard
                    icon={User}
                    title="I'm a User"
                    description="Access wellness tools and therapy."
                    onPress={() => handleRoleSelection('user')}
                />
                <RoleCard
                    icon={Heart}
                    title="I'm a Counselor"
                    description="Manage clients and appointments."
                    onPress={() => handleRoleSelection('counselor')}
                />
                <RoleCard
                    icon={Briefcase}
                    title="I'm an Employer"
                    description="View anonymous wellness insights."
                    onPress={() => handleRoleSelection('employer')}
                />
            </View>
            <TouchableOpacity onPress={handleSignOut}>
                <Text style={styles.signOutText}>Not right now? Sign out</Text>
            </TouchableOpacity>
        </SafeAreaView>
    </View>
  );
};

const RoleCard = ({ icon: Icon, title, description, onPress }) => (
    <TouchableOpacity onPress={onPress}>
        <Card style={styles.card}>
            <View style={styles.cardIcon}>
                <Icon size={24} color="#4f46e5" />
            </View>
            <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDescription}>{description}</Text>
            </View>
            <ArrowRight size={20} color="#9ca3af" />
        </Card>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1, justifyContent: 'space-between', padding: 20 },
    title: { fontSize: 32, fontFamily: 'Inter-Bold', color: '#fff', textAlign: 'center', marginTop: 40 },
    subtitle: { fontSize: 16, color: '#e0e7ff', textAlign: 'center', marginTop: 8 },
    cardContainer: { gap: 16 },
    card: { flexDirection: 'row', alignItems: 'center', padding: 20 },
    cardIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
    cardTextContainer: { flex: 1, marginLeft: 16 },
    cardTitle: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#111827' },
    cardDescription: { fontSize: 14, color: '#6b7280', marginTop: 2 },
    signOutText: { textAlign: 'center', color: '#e0e7ff', padding: 16 }
});

export default RoleSelectionScreen;