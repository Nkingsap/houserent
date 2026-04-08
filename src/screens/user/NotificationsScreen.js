import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

const NotificationsScreen = ({ navigation }) => {
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [newListings, setNewListings] = useState(true);
    const [priceDrops, setPriceDrops] = useState(true);
    const [messages, setMessages] = useState(true);
    const [appUpdates, setAppUpdates] = useState(false);

    const ToggleRow = ({ icon, label, description, value, onValueChange }) => (
        <View style={styles.toggleRow}>
            <View style={styles.toggleIcon}>
                <Ionicons name={icon} size={20} color={colors.text} />
            </View>
            <View style={styles.toggleContent}>
                <Text style={styles.toggleLabel}>{label}</Text>
                {description && (
                    <Text style={styles.toggleDescription}>{description}</Text>
                )}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: colors.surface, true: colors.primary }}
                thumbColor={colors.card}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: spacing.xxxl }}
            >
                {/* General */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General</Text>
                    <ToggleRow
                        icon="notifications-outline"
                        label="Push Notifications"
                        description="Receive notifications on your device"
                        value={pushEnabled}
                        onValueChange={setPushEnabled}
                    />
                    <ToggleRow
                        icon="mail-outline"
                        label="Email Notifications"
                        description="Receive updates via email"
                        value={emailEnabled}
                        onValueChange={setEmailEnabled}
                    />
                </View>

                {/* Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <ToggleRow
                        icon="home-outline"
                        label="New Listings"
                        description="Properties matching your search"
                        value={newListings}
                        onValueChange={setNewListings}
                    />
                    <ToggleRow
                        icon="pricetag-outline"
                        label="Price Drops"
                        description="Price changes on saved properties"
                        value={priceDrops}
                        onValueChange={setPriceDrops}
                    />
                    <ToggleRow
                        icon="chatbubble-outline"
                        label="Messages"
                        description="New messages from owners"
                        value={messages}
                        onValueChange={setMessages}
                    />
                    <ToggleRow
                        icon="refresh-outline"
                        label="App Updates"
                        description="News and feature announcements"
                        value={appUpdates}
                        onValueChange={setAppUpdates}
                    />
                </View>
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
        marginBottom: spacing.sm,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.surface,
        gap: spacing.lg,
    },
    toggleIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.elevated,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleContent: {
        flex: 1,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    toggleDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
});

export default NotificationsScreen;
