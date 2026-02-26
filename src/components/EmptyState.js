import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

const EmptyState = ({ icon, title, subtitle }) => (
    <View style={styles.container}>
        <View style={styles.iconCircle}>
            <Ionicons name={icon || 'folder-open-outline'} size={48} color={colors.textMuted} />
        </View>
        <Text style={styles.title}>{title || 'Nothing here yet'}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.xxxl,
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.elevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: {
        ...typography.h3,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        textAlign: 'center',
        color: colors.textMuted,
    },
});

export default EmptyState;
