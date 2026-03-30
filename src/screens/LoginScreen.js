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
        backgroundColor: colors.primary,
        height: 56,
        borderRadius: borderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    loginBtnText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
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
        color: colors.primary,
        fontWeight: '600',
    },
});

export default LoginScreen;
