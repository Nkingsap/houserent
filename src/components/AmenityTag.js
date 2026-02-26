import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

const AmenityTag = ({ name, size = 'normal' }) => {
    const iconMap = {
        WiFi: 'wifi',
        AC: 'snow-outline',
        Parking: 'car-outline',
        Gym: 'barbell-outline',
        Pool: 'water-outline',
        Security: 'shield-checkmark-outline',
        Garden: 'leaf-outline',
        Elevator: 'arrow-up-outline',
        'Power Backup': 'flash-outline',
        Terrace: 'sunny-outline',
        'Smart Home': 'phone-portrait-outline',
        'Lake View': 'eye-outline',
    };

    const iconName = iconMap[name] || 'checkmark-circle-outline';

    if (size === 'small') {
        return (
            <View style={styles.tagSmall}>
                <Ionicons name={iconName} size={12} color={colors.textSecondary} />
                <Text style={styles.tagTextSmall}>{name}</Text>
            </View>
        );
    }

    return (
        <View style={styles.tag}>
            <Ionicons name={iconName} size={16} color={colors.textSecondary} />
            <Text style={styles.tagText}>{name}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.elevated,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
        gap: spacing.xs,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tagText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    tagSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: borderRadius.sm,
        gap: 3,
        backgroundColor: colors.surface,
    },
    tagTextSmall: {
        fontSize: 11,
        color: colors.textMuted,
        fontWeight: '500',
    },
});

export default AmenityTag;
