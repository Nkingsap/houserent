import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    StatusBar,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const btnAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(btnAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            {/* Background decorative elements */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />
            <View style={styles.bgLine1} />
            <View style={styles.bgLine2} />

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <View style={styles.logoContainer}>
                    <View style={styles.logoOuter}>
                        <View style={styles.logoInner}>
                            <Ionicons name="home" size={36} color={colors.background} />
                        </View>
                    </View>
                </View>

                <Text style={styles.brand}>RentHouse</Text>
                <Text style={styles.tagline}>Find your perfect home</Text>

                <View style={styles.features}>
                    {[
                        { icon: 'search-outline', text: 'Search thousands of listings' },
                        { icon: 'map-outline', text: 'Explore on an interactive map' },
                        { icon: 'heart-outline', text: 'Save your favorite homes' },
                        { icon: 'person-outline', text: 'Connect directly with owners' },
                    ].map((f, i) => (
                        <View key={i} style={styles.featureRow}>
                            <View style={styles.featureIcon}>
                                <Ionicons name={f.icon} size={18} color={colors.text} />
                            </View>
                            <Text style={styles.featureText}>{f.text}</Text>
                        </View>
                    ))}
                </View>
            </Animated.View>

            <Animated.View style={[styles.bottomSection, { opacity: btnAnim }]}>
                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => navigation.navigate('Register')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.primaryBtnText}>Get Started</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.background} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.secondaryBtnText}>
                        Already have an account? <Text style={styles.loginLink}>Log In</Text>
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'space-between',
        paddingTop: 80,
        paddingBottom: 40,
    },
    bgCircle1: {
        position: 'absolute',
        top: -100,
        right: -80,
        width: 300,
        height: 300,
        borderRadius: 150,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
    },
    bgCircle2: {
        position: 'absolute',
        bottom: -50,
        left: -100,
        width: 250,
        height: 250,
        borderRadius: 125,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    bgLine1: {
        position: 'absolute',
        top: 150,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    bgLine2: {
        position: 'absolute',
        top: 350,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    content: {
        paddingHorizontal: spacing.xxl,
    },
    logoContainer: {
        marginBottom: spacing.xl,
    },
    logoOuter: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    logoInner: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: colors.text,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brand: {
        ...typography.hero,
        fontSize: 38,
        marginBottom: spacing.sm,
    },
    tagline: {
        ...typography.body,
        fontSize: 17,
        color: colors.textMuted,
        marginBottom: spacing.xxxl,
    },
    features: {
        gap: spacing.lg,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.elevated,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    featureText: {
        ...typography.body,
        color: colors.textSecondary,
        flex: 1,
    },
    bottomSection: {
        paddingHorizontal: spacing.xxl,
    },
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.text,
        height: 56,
        borderRadius: borderRadius.xl,
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    primaryBtnText: {
        color: colors.background,
        fontSize: 17,
        fontWeight: '700',
    },
    secondaryBtn: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    secondaryBtnText: {
        ...typography.body,
        color: colors.textMuted,
    },
    loginLink: {
        color: colors.text,
        fontWeight: '600',
    },
});

export default WelcomeScreen;
