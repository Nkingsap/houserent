import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Switch,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

const PrivacySecurityScreen = ({ navigation }) => {
    const [locationAccess, setLocationAccess] = useState(true);
    const [profileVisible, setProfileVisible] = useState(true);
    const [showPhone, setShowPhone] = useState(false);

    const MenuItem = ({ icon, label, description, onPress, danger }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
            <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
                <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.text} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, danger && { color: colors.danger }]}>{label}</Text>
                {description && (
                    <Text style={styles.menuDescription}>{description}</Text>
                )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
    );

    const ToggleRow = ({ icon, label, description, value, onValueChange }) => (
        <View style={styles.toggleRow}>
            <View style={styles.menuIcon}>
                <Ionicons name={icon} size={20} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{label}</Text>
                {description && (
                    <Text style={styles.menuDescription}>{description}</Text>
                )}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: colors.border, true: colors.text }}
                thumbColor={colors.card}
            />
        </View>
    );

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
                <Text style={styles.headerTitle}>Privacy & Security</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: spacing.xxxl }}
            >
                {/* Privacy */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Privacy</Text>
                    <ToggleRow
                        icon="location-outline"
                        label="Location Access"
                        description="Allow app to access your location"
                        value={locationAccess}
                        onValueChange={setLocationAccess}
                    />
                    <ToggleRow
                        icon="eye-outline"
                        label="Profile Visibility"
                        description="Make your profile visible to others"
                        value={profileVisible}
                        onValueChange={setProfileVisible}
                    />
                    <ToggleRow
                        icon="call-outline"
                        label="Show Phone Number"
                        description="Display phone on your profile"
                        value={showPhone}
                        onValueChange={setShowPhone}
                    />
                </View>

                {/* Security */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Security</Text>
                    <MenuItem
                        icon="lock-closed-outline"
                        label="Change Password"
                        description="Update your account password"
                        onPress={() => Alert.alert('Change Password', 'This feature is coming soon.')}
                    />
                    <MenuItem
                        icon="finger-print-outline"
                        label="Biometric Login"
                        description="Use fingerprint or face ID"
                        onPress={() => Alert.alert('Biometric Login', 'This feature is coming soon.')}
                    />
                </View>

                {/* Data */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data</Text>
                    <MenuItem
                        icon="download-outline"
                        label="Download My Data"
                        description="Get a copy of your personal data"
                        onPress={() => Alert.alert('Download Data', 'This feature is coming soon.')}
                    />
                    <MenuItem
                        icon="trash-outline"
                        label="Delete Account"
                        description="Permanently remove your account"
                        onPress={() =>
                            Alert.alert(
                                'Delete Account',
                                'Are you sure? This action cannot be undone.',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Delete', style: 'destructive', onPress: () => { } },
                                ]
                            )
                        }
                        danger
                    />
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
        marginBottom: spacing.sm,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: spacing.lg,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: spacing.lg,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.elevated,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuIconDanger: {
        backgroundColor: 'rgba(255,68,68,0.08)',
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    menuDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
});

export default PrivacySecurityScreen;
