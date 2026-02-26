import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import InputField from '../components/InputField';
import LoadingOverlay from '../components/LoadingOverlay';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const errs = {};
        if (!email.trim()) errs.email = 'Email is required';
        if (!password) errs.password = 'Password is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await login(email.trim(), password);
        } catch (e) {
            Alert.alert('Login Failed', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />
            <LoadingOverlay visible={loading} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                >
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome back</Text>
                        <Text style={styles.subtitle}>
                            Sign in to continue finding your perfect home
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <InputField
                            label="EMAIL"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="your@email.com"
                            icon="mail-outline"
                            error={errors.email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <InputField
                            label="PASSWORD"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            icon="lock-closed-outline"
                            error={errors.password}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.loginBtn}
                        onPress={handleLogin}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.loginBtnText}>Sign In</Text>
                    </TouchableOpacity>

                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.divider} />
                    </View>

                    <View style={styles.demoSection}>
                        <Text style={styles.demoLabel}>QUICK DEMO ACCESS</Text>
                        <TouchableOpacity
                            style={styles.demoBtn}
                            onPress={() => {
                                setEmail('owner@demo.com');
                                setPassword('password');
                            }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="key-outline" size={18} color={colors.textSecondary} />
                            <Text style={styles.demoBtnText}>Use Demo Owner Account</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.registerLink}
                        onPress={() => navigation.replace('Register')}
                    >
                        <Text style={styles.registerText}>
                            Don't have an account?{' '}
                            <Text style={styles.registerBold}>Create one</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: 60,
        paddingBottom: spacing.xxl,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.elevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xxl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        marginBottom: spacing.xxl,
    },
    title: {
        ...typography.h1,
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        color: colors.textMuted,
    },
    form: {
        marginBottom: spacing.xl,
    },
    loginBtn: {
        backgroundColor: colors.text,
        height: 56,
        borderRadius: borderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    loginBtnText: {
        color: colors.background,
        fontSize: 17,
        fontWeight: '700',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        ...typography.small,
        marginHorizontal: spacing.lg,
        color: colors.textMuted,
    },
    demoSection: {
        marginBottom: spacing.xxl,
    },
    demoLabel: {
        ...typography.small,
        marginBottom: spacing.sm,
    },
    demoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.elevated,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    demoBtnText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    registerLink: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    registerText: {
        ...typography.body,
        color: colors.textMuted,
    },
    registerBold: {
        color: colors.text,
        fontWeight: '600',
    },
});

export default LoginScreen;
