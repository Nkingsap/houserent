import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import InputField from '../../components/InputField';
import { useAuth } from '../../context/AuthContext';



const ProfileScreen = ({ navigation }) => {
    const { user, logout, updateProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');


    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }
        await updateProfile({ name: name.trim(), phone: phone.trim() });
        setEditing(false);
    };

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: logout },
        ]);
    };

    const menuItems = [
        { icon: 'notifications-outline', label: 'Notifications', onPress: () => navigation.navigate('Notifications') },
        { icon: 'shield-checkmark-outline', label: 'Privacy & Security', onPress: () => navigation.navigate('PrivacySecurity') },
        { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => navigation.navigate('HelpSupport') },
        { icon: 'information-circle-outline', label: 'About', onPress: () => navigation.navigate('About') },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarLargeText}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>
                            {user?.role === 'owner' ? 'Property Owner' : 'Tenant'}
                        </Text>
                    </View>
                </View>

                {/* Edit Profile */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <TouchableOpacity onPress={() => setEditing(!editing)}>
                            <Text style={styles.editBtn}>{editing ? 'Cancel' : 'Edit'}</Text>
                        </TouchableOpacity>
                    </View>

                    {editing ? (
                        <View style={styles.editForm}>
                            <InputField
                                label="FULL NAME"
                                value={name}
                                onChangeText={setName}
                                icon="person-outline"
                            />
                            <InputField
                                label="PHONE NUMBER"
                                value={phone}
                                onChangeText={setPhone}
                                icon="call-outline"
                                keyboardType="phone-pad"
                            />
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                <Text style={styles.saveBtnText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.infoCards}>
                            <View style={styles.infoCard}>
                                <Ionicons name="person-outline" size={18} color={colors.textMuted} />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Name</Text>
                                    <Text style={styles.infoValue}>{user?.name}</Text>
                                </View>
                            </View>
                            <View style={styles.infoCard}>
                                <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Email</Text>
                                    <Text style={styles.infoValue}>{user?.email}</Text>
                                </View>
                            </View>
                            <View style={styles.infoCard}>
                                <Ionicons name="call-outline" size={18} color={colors.textMuted} />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Phone</Text>
                                    <Text style={styles.infoValue}>{user?.phone || 'Not set'}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Menu */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <View style={styles.menuCard}>
                        {menuItems.map((item, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}
                                onPress={item.onPress}
                                activeOpacity={0.7}
                            >
                                <View style={styles.menuItemLeft}>
                                    <View style={styles.menuIcon}>
                                        <Ionicons name={item.icon} size={20} color={colors.text} />
                                    </View>
                                    <Text style={styles.menuLabel}>{item.label}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: spacing.xxxl }} />
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
        paddingHorizontal: spacing.xl,
        paddingTop: 60,
        paddingBottom: spacing.lg,
    },
    headerTitle: {
        ...typography.h1,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    avatarLarge: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: colors.text,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.border,
        marginBottom: spacing.lg,
    },
    avatarLargeText: {
        fontSize: 36,
        fontWeight: '700',
        color: colors.card,
    },
    userName: {
        ...typography.h2,
        marginBottom: spacing.xs,
    },
    userEmail: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    roleBadge: {
        backgroundColor: colors.elevated,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
    },
    roleText: {
        ...typography.small,
        color: colors.textSecondary,
    },
    section: {
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        ...typography.h3,
    },
    editBtn: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600',
    },
    editForm: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    saveBtn: {
        backgroundColor: colors.text,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    infoCards: {
        gap: spacing.sm,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        gap: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        ...typography.small,
        marginBottom: 2,
    },
    infoValue: {
        ...typography.bodyBold,
    },
    menuCard: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    menuLabel: {
        ...typography.bodyBold,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.md,
        backgroundColor: 'rgba(255,68,68,0.08)',
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,68,68,0.2)',
    },
    logoutText: {
        color: colors.danger,
        fontSize: 15,
        fontWeight: '600',
    },

});

export default ProfileScreen;
