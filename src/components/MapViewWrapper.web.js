// Web version – react-native-maps is NOT imported here (native-only package)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';

// Stub Marker and Callout for web so importing them doesn't break anything
export const Marker = () => null;
export const Callout = () => null;

/**
 * Web placeholder shown instead of an interactive map.
 * Props: latitude, longitude, address, style
 * (All other MapView props are safely ignored on web.)
 */
const MapViewWrapper = ({
    style,
    latitude,
    longitude,
    address,
    children,
    // absorb all other native MapView props silently
    ...rest
}) => (
    <View style={[styles.placeholder, style]}>
        <Ionicons name="map-outline" size={36} color={colors.textMuted} />
        <Text style={styles.title}>Map not available on web</Text>
        {latitude != null && longitude != null ? (
            <Text style={styles.coords}>
                {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
            </Text>
        ) : null}
        {address ? <Text style={styles.address}>{address}</Text> : null}
    </View>
);

export default MapViewWrapper;

const styles = StyleSheet.create({
    placeholder: {
        backgroundColor: colors.elevated,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.xl,
        minHeight: 160,
    },
    title: {
        ...typography.bodyBold,
        color: colors.textMuted,
        textAlign: 'center',
    },
    coords: {
        ...typography.caption,
        color: colors.textMuted,
        fontFamily: 'monospace',
    },
    address: {
        ...typography.caption,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: spacing.lg,
    },
});
