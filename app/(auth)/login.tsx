import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Shield, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { GradientBackground } from '@/components/common/GradientBackground';
import { useAuth } from '@/context/AuthContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function LoginScreen() {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // This is the core function that handles the login logic.
    // It has been updated to be more robust.
    const onLoginPress = async () => {
        // 1. Validate input fields
        if (!email || !password) {
            Alert.alert('Missing Information', 'Please enter both your email and password.');
            return;
        }

        setLoading(true);
        try {
            // 2. Call the signIn function from the context and await its result.
            const { error } = await signIn(email, password);

            // 3. Check if an error was returned from the signIn function.
            if (error) {
                // If there's an error, show it to the user in an alert.
                Alert.alert('Sign In Failed', error.message);
            }
            // If sign-in is successful, the `useEffect` in `_layout.tsx` will automatically handle redirection.
            // We don't need to do anything here on success.

        } catch (e: any) {
            // Catch any unexpected errors during the process.
            Alert.alert('An Unexpected Error Occurred', e.message);
        } finally {
            // 4. IMPORTANT: Always set loading to false in a `finally` block.
            // This ensures the loading spinner stops even if an error occurs.
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <GradientBackground />
            <Pressable onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color="#ffffff" />
            </Pressable>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Animated.View entering={FadeInUp.duration(500)}>
                    <View style={styles.header}>
                        <Shield size={48} color="#ffffff" />
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue your wellness journey</Text>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.cardContainer}>
                    <Card style={styles.authCard}>
                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email Address</Text>
                                <View style={styles.inputContainer}>
                                    <Mail size={20} color="#6b7280" />
                                    <TextInput
                                        style={styles.input}
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="you@example.com"
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <View style={styles.inputContainer}>
                                    <Lock size={20} color="#6b7280" />
                                    <TextInput
                                        style={styles.input}
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Your password"
                                        secureTextEntry={!isPasswordVisible}
                                    />
                                    <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeButton}>
                                        {isPasswordVisible ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                                    </Pressable>
                                </View>
                            </View>

                            {/* The Button component now shows a loading indicator when processing */}
                            <Button
                                title="Sign In"
                                onPress={onLoginPress}
                                disabled={loading}
                                style={styles.authButton}
                            >
                                {loading && <ActivityIndicator color="#ffffff" style={{ marginRight: 8 }} />}
                            </Button>
                        </View>
                        <Pressable>
                            <Text style={styles.forgotPassword}>Forgot Password?</Text>
                        </Pressable>
                    </Card>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}


// All of your original styles are preserved below
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 16,
        zIndex: 10,
        padding: 8,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontFamily: 'Inter-Bold',
        color: '#ffffff',
        marginTop: 16,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 8,
        textAlign: 'center',
    },
    cardContainer: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    authCard: {
        padding: 24,
    },
    form: {
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        color: '#374151',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        minHeight: 52,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingLeft: 12,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: '#111827',
    },
    eyeButton: {
        padding: 4,
    },
    authButton: {
        marginTop: 8,
    },
    forgotPassword: {
        fontFamily: 'Inter-SemiBold',
        color: '#6366f1',
        textAlign: 'center',
        paddingVertical: 8,
    },
});