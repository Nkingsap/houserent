import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

const faqData = [
    {
        question: 'How do I search for a rental property?',
        answer: 'Use the Explore tab to browse listings. You can apply filters like location, price range, and property type to find the perfect home.',
    },
    {
        question: 'How do I contact a property owner?',
        answer: 'Open any listing and tap the "Contact Owner" button. You can reach them via phone or in-app messaging.',
    },
    {
        question: 'How do I save a property?',
        answer: 'Tap the heart icon on any listing to save it. You can view all saved properties in the Saved tab.',
    },
    {
        question: 'How do I list my property?',
        answer: 'Switch to an owner account from the Profile screen, then use the "Add Listing" button on your dashboard to list your property.',
    },
    {
        question: 'How do I delete my account?',
        answer: 'Go to Profile → Privacy & Security → Delete Account. Please note this action is permanent and cannot be undone.',
    },
];

const HelpSupportScreen = ({ navigation }) => {
    const [expandedIndex, setExpandedIndex] = useState(null);

    const toggleFaq = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: spacing.xxxl }}
            >
                {/* Contact Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Get in Touch</Text>

                    <TouchableOpacity
                        style={styles.contactItem}
                        onPress={() => Linking.openURL('mailto:support@houserent.app')}
                        activeOpacity={0.6}
                    >
                        <View style={styles.contactIcon}>
                            <Ionicons name="mail-outline" size={20} color={colors.text} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.contactLabel}>Email Us</Text>
                            <Text style={styles.contactHint}>support@houserent.app</Text>
                        </View>
                        <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.contactItem}
                        onPress={() => Linking.openURL('tel:+911234567890')}
                        activeOpacity={0.6}
                    >
                        <View style={styles.contactIcon}>
                            <Ionicons name="call-outline" size={20} color={colors.text} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.contactLabel}>Call Us</Text>
                            <Text style={styles.contactHint}>Mon–Sat, 9am–6pm</Text>
                        </View>
                        <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* FAQ */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                    {faqData.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.faqItem}
                            onPress={() => toggleFaq(index)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.faqHeader}>
                                <Text style={styles.faqQuestion}>{item.question}</Text>
                                <Ionicons
                                    name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                                    size={18}
                                    color={colors.textSecondary}
                                />
                            </View>
                            {expandedIndex === index && (
                                <Text style={styles.faqAnswer}>{item.answer}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Useful Links */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Useful Links</Text>

                    {[
                        { icon: 'document-text-outline', label: 'Privacy Policy', url: 'https://houserent.app/privacy' },
                        { icon: 'reader-outline', label: 'Terms of Service', url: 'https://houserent.app/terms' },
                        { icon: 'star-outline', label: 'Rate the App', url: 'https://play.google.com/store' },
                    ].map((link, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.linkItem}
                            onPress={() => Linking.openURL(link.url)}
                            activeOpacity={0.6}
                        >
                            <Ionicons name={link.icon} size={20} color={colors.text} />
                            <Text style={styles.linkLabel}>{link.label}</Text>
                            <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
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
        paddingTop: 60,
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
        marginBottom: spacing.lg,
    },
    // Contact
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.surface,
        gap: spacing.lg,
    },
    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.elevated,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    contactHint: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    // FAQ
    faqItem: {
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.surface,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
        marginRight: spacing.md,
        lineHeight: 22,
    },
    faqAnswer: {
        fontSize: 15,
        color: colors.textSecondary,
        marginTop: spacing.sm,
        lineHeight: 23,
    },
    // Links
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.surface,
        gap: spacing.lg,
    },
    linkLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
    },
});

export default HelpSupportScreen;
