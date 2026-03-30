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

const RegisterScreen = ({ navigation }) => {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const errs = {};
        if (!name.trim()) errs.name = 'Name is required';
        if (!email.trim()) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
        if (!phone.trim()) errs.phone = 'Phone number is required';
        if (!password) errs.password = 'Password is required';
        else if (password.length < 6) errs.password = 'Minimum 6 characters';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password, role });
        } catch (e) {
            Alert.alert('Registration Failed', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
                        <Text style={styles.title}>Create account</Text>
                        <Text style={styles.subtitle}>
                            Join RentHouse to find or list rental properties
                        </Text>
                    </View>

                    {/* Role Selector */}
                    <View style={styles.roleSection}>
                        <Text style={styles.roleLabel}>I AM A</Text>
                        <View style={styles.roleRow}>
                            <TouchableOpacity
                                style={[styles.roleCard, role === 'user' && styles.roleCardActive]}
                                onPress={() => setRole('user')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.roleIcon, role === 'user' && styles.roleIconActive]}>
                                    <Ionicons
                                        name="search"
                                        size={24}
                                        color={role === 'user' ? colors.card : colors.textMuted}
                                    />
                                </View>
                                <Text style={[styles.roleTitle, role === 'user' && styles.roleTitleActive]}>
                                    Tenant
                                </Text>
                                <Text style={styles.roleDesc}>Looking for a rental</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.roleCard, role === 'owner' && styles.roleCardActive]}
                                onPress={() => setRole('owner')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.roleIcon, role === 'owner' && styles.roleIconActive]}>
                                    <Ionicons
                                        name="business"
                                        size={24}
                                        color={role === 'owner' ? colors.card : colors.textMuted}
                                    />
                                </View>
                                <Text style={[styles.roleTitle, role === 'owner' && styles.roleTitleActive]}>
                                    Owner
                                </Text>
                                <Text style={styles.roleDesc}>Listing my property</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.form}>
                        <InputField
                            label="FULL NAME"
                            value={name}
                            onChangeText={setName}
                            placeholder="John Doe"
                            icon="person-outline"
                            error={errors.name}
                        />
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
                            label="PHONE NUMBER"
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="+91 98765 43210"
                            icon="call-outline"
                            error={errors.phone}
                            keyboardType="phone-pad"
                        />
                        <InputField
                            label="PASSWORD"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Minimum 6 characters"
                            icon="lock-closed-outline"
                            error={errors.password}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.registerBtn}
                        onPress={handleRegister}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.registerBtnText}>Create Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.replace('Login')}
                    >
                        <Text style={styles.loginText}>
                            Already have an account?{' '}
                            <Text style={styles.loginBold}>Sign In</Text>
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
    },
    header: {
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h1,
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        color: colors.textMuted,
    },
    roleSection: {
        marginBottom: spacing.xl,
    },
    roleLabel: {
        ...typography.small,
        marginBottom: spacing.sm,
        color: colors.textSecondary,
    },
    roleRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    roleCard: {
        flex: 1,
        backgroundColor: colors.elevated,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        alignItems: 'center',
    },
    roleCardActive: {
        backgroundColor: colors.surface,
    },
    roleIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    roleIconActive: {
        backgroundColor: colors.primary,
    },
    roleTitle: {
        ...typography.bodyBold,
        marginBottom: 2,
        color: colors.textSecondary,
    },
    roleTitleActive: {
        color: colors.text,
    },
    roleDesc: {
        ...typography.caption,
        fontSize: 11,
    },
    form: {
        marginBottom: spacing.xl,
    },
    registerBtn: {
        backgroundColor: colors.primary,
        height: 56,
        borderRadius: borderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    registerBtnText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    loginLink: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    loginText: {
        ...typography.body,
        color: colors.textMuted,
    },
    loginBold: {
        color: colors.primary,
        fontWeight: '600',
    },
});

export default RegisterScreen;
