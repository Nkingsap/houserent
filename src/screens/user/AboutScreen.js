import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Linking,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

const APP_VERSION = '1.0.0';

const AboutScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: spacing.xxxl }}
            >
                {/* App Icon & Name */}
                <View style={styles.aboutAppHeader}>
                    <Image
                        source={require('../../../assets/appicon.png')}
                        style={styles.aboutAppIconImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.aboutAppName}>RentHub</Text>
                    <Text style={styles.aboutVersion}>Version {APP_VERSION} </Text>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.description}>
                        RentHub is your trusted platform for finding the perfect rental home. Browse listings, connect with property owners, and find your next home — all in one place.
                    </Text>
                </View>

                {/* Features */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Features</Text>
                    {[
                        { icon: 'search-outline', text: 'Search & explore rental listings' },
                        { icon: 'heart-outline', text: 'Save your favourite properties' },
                        { icon: 'chatbubble-outline', text: 'Contact owners directly' },
                        { icon: 'filter-outline', text: 'Advanced filters for precise results' },
                        { icon: 'location-outline', text: 'Location-based recommendations' },
                    ].map((feature, idx) => (
                        <View key={idx} style={styles.featureRow}>
                            <Ionicons name={feature.icon} size={20} color={colors.text} />
                            <Text style={styles.featureText}>{feature.text}</Text>
                        </View>
                    ))}
                </View>

                {/* Developer */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Developer</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="code-slash-outline" size={20} color={colors.text} />
                        <Text style={styles.infoText}>Built by N.King</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="globe-outline" size={20} color={colors.text} />
                        <Text style={styles.infoText}>nkingsap.dev</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => Linking.openURL('mailto:support@renthub.app')}
                        activeOpacity={0.6}
                    >
                        <Ionicons name="mail-outline" size={20} color={colors.text} />
                        <Text style={styles.actionText}>Contact Us</Text>
                        <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => Linking.openURL('https://play.google.com/store')}
                        activeOpacity={0.6}
                    >
                        <Ionicons name="star-outline" size={20} color={colors.text} />
                        <Text style={styles.actionText}>Rate App</Text>
                        <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Legal */}
                <View style={styles.legalRow}>
                    <TouchableOpacity>
                        <Text style={styles.legalLink}>Privacy Policy</Text>
                    </TouchableOpacity>
                    <Text style={styles.legalDot}>•</Text>
                    <TouchableOpacity>
                        <Text style={styles.legalLink}>Terms of Service</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.copyright}>
                    © 2026 RentHub. All rights reserved.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    backBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.elevated,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...typography.h2,
    },
    aboutAppHeader: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    aboutAppIcon: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: colors.text,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    aboutAppIconImage: {
        width: 72,
        height: 72,
        borderRadius: 20,
        marginBottom: spacing.lg,
    },
    aboutAppName: {
        ...typography.h1,
        marginBottom: spacing.xs,
    },
    aboutVersion: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    section: {
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.xxl,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: spacing.md,
    },
    description: {
        fontSize: 16,
        color: colors.text,
        lineHeight: 25,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.surface,
    },
    featureText: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.text,
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.surface,
    },
    infoText: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.text,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.surface,
        gap: spacing.lg,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
    },
    legalRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    legalLink: {
        fontSize: 14,
        color: colors.textSecondary,
        textDecorationLine: 'underline',
    },
    legalDot: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    copyright: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default AboutScreen;
