import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows } from '../theme';

const { width } = Dimensions.get('window');

const ShimmerBlock = ({ style }) => {
    const shimmer = useSharedValue(0);

    useEffect(() => {
        shimmer.value = withRepeat(
            withTiming(1, { duration: 1200 }),
            -1,   // infinite
            false  // don't reverse — restart from 0
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.7, 0.3]),
    }));

    return (
        <Animated.View style={[styles.shimmerBase, style, animatedStyle]} />
    );
};

const SkeletonCard = ({ compact }) => {
    if (compact) {
        return (
            <View style={styles.compactCard}>
                <ShimmerBlock style={styles.compactImage} />
                <View style={styles.compactInfo}>
                    <View style={styles.compactTitleRow}>
                        <ShimmerBlock style={styles.compactTitleBlock} />
                        <ShimmerBlock style={styles.compactPriceBlock} />
                    </View>
                    <ShimmerBlock style={styles.compactAddressBlock} />
                    <View style={styles.compactSpecsRow}>
                        <ShimmerBlock style={styles.compactSpecBlock} />
                        <ShimmerBlock style={styles.compactSpecBlock} />
                        <ShimmerBlock style={styles.compactSpecBlock} />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            {/* Image placeholder */}
            <ShimmerBlock style={styles.imageBlock} />

            {/* Info section */}
            <View style={styles.info}>
                {/* Title + price row */}
                <View style={styles.titleRow}>
                    <ShimmerBlock style={styles.titleBlock} />
                    <ShimmerBlock style={styles.priceBlock} />
                </View>

                {/* Address row */}
                <ShimmerBlock style={styles.addressBlock} />

                {/* Divider */}
                <View style={styles.divider} />

                {/* Specs row */}
                <View style={styles.specsRow}>
                    <ShimmerBlock style={styles.specBlock} />
                    <ShimmerBlock style={styles.specBlock} />
                    <ShimmerBlock style={styles.specBlock} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    shimmerBase: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.sm,
    },

    // ─── Full Card ───
    card: {
        backgroundColor: colors.cardDark,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
        overflow: 'hidden',
        ...shadows.medium,
    },
    imageBlock: {
        height: 200,
        borderRadius: 0,
    },
    info: {
        padding: spacing.lg,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    titleBlock: {
        width: '55%',
        height: 20,
    },
    priceBlock: {
        width: 80,
        height: 32,
        borderRadius: borderRadius.sm,
    },
    addressBlock: {
        width: '70%',
        height: 14,
        marginBottom: spacing.xs,
    },
    divider: {
        height: 1,
        backgroundColor: colors.cardDarkBorder || colors.surface,
        marginVertical: spacing.md,
    },
    specsRow: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    specBlock: {
        width: 60,
        height: 14,
    },

    // ─── Compact Card ───
    compactCard: {
        width: 200,
        backgroundColor: colors.cardDark,
        borderRadius: borderRadius.md,
        marginRight: spacing.md,
        overflow: 'hidden',
        ...shadows.small,
    },
    compactImage: {
        height: 130,
        borderRadius: 0,
    },
    compactInfo: {
        padding: spacing.sm,
    },
    compactTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    compactTitleBlock: {
        width: '55%',
        height: 14,
    },
    compactPriceBlock: {
        width: 40,
        height: 18,
        borderRadius: borderRadius.sm,
    },
    compactAddressBlock: {
        width: '80%',
        height: 12,
        marginBottom: spacing.xs,
    },
    compactSpecsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    compactSpecBlock: {
        width: 30,
        height: 12,
    },
});

export default SkeletonCard;
