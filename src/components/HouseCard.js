import React, { memo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { getThumbnailUrl } from '../services/apiService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.xl * 2;

// Default blurhash placeholder — shows a blurred color preview while image loads
const DEFAULT_BLURHASH = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';

// Moved outside component to avoid re-creation on every render
const formatPrice = (price) => {
    if (price >= 1000) return `₹${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K`;
    return `₹${price}`;
};

const HouseCard = ({ listing, onPress, onFavorite, isFavorited, compact, distanceKm }) => {

    if (compact) {
        return (
            <TouchableOpacity
                style={styles.compactCard}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <View style={styles.compactImageContainer}>
                    {listing.images && listing.images.length > 0 ? (
                        <Image source={getThumbnailUrl(listing.images[0], 200, 130)} style={styles.compactImage} cachePolicy="memory-disk" transition={200} contentFit="cover" placeholder={{ blurhash: DEFAULT_BLURHASH }} />
                    ) : (
                        <View style={styles.compactPlaceholder}>
                            <Ionicons name="home-outline" size={24} color={colors.cardDarkTextMuted} />
                        </View>
                    )}
                </View>
                <View style={styles.compactInfo}>
                    <View style={styles.compactTitleRow}>
                        <Text style={styles.compactTitle} numberOfLines={1}>
                            {listing.title}
                        </Text>
                        <View style={styles.compactPriceBadge}>
                            <Text style={styles.compactPriceText}>{formatPrice(listing.price)}/mo</Text>
                        </View>
                    </View>
                    <View style={styles.compactAddressRow}>
                        <Ionicons name="location" size={13} color={colors.primary} />
                        <Text style={styles.compactAddress} numberOfLines={1}>
                            {listing.address}
                        </Text>
                    </View>
                    <View style={styles.compactSpecs}>
                        <View style={styles.specItem}>
                            <Ionicons name="bed-outline" size={12} color={colors.cardDarkTextMuted} />
                            <Text style={styles.specText}>{listing.bedrooms}</Text>
                        </View>
                        <View style={styles.specItem}>
                            <Ionicons name="water-outline" size={12} color={colors.cardDarkTextMuted} />
                            <Text style={styles.specText}>{listing.bathrooms}</Text>
                        </View>
                        <View style={styles.specItem}>
                            <Ionicons name="resize-outline" size={12} color={colors.cardDarkTextMuted} />
                            <Text style={styles.specText}>{listing.area} ft²</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <View style={styles.imageContainer}>
                {listing.images && listing.images.length > 0 ? (
                    <Image source={getThumbnailUrl(listing.images[0])} style={styles.image} cachePolicy="memory-disk" transition={200} contentFit="cover" placeholder={{ blurhash: DEFAULT_BLURHASH }} />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="home-outline" size={40} color={colors.textMuted} />
                        <Text style={styles.placeholderText}>No photo</Text>
                    </View>
                )}



                {onFavorite && (
                    <TouchableOpacity
                        style={styles.favoriteBtn}
                        onPress={onFavorite}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name={isFavorited ? 'heart' : 'heart-outline'}
                            size={22}
                            color={isFavorited ? colors.danger : '#FFFFFF'}
                        />
                    </TouchableOpacity>
                )}

                {listing.furnished && (
                    <View style={styles.furnishedBadge}>
                        <Text style={styles.furnishedText}>Furnished</Text>
                    </View>
                )}

                {distanceKm != null && (
                    <View style={styles.distanceBadge}>
                        <Ionicons name="navigate" size={10} color="#FFFFFF" />
                        <Text style={styles.distanceText}>
                            {distanceKm < 1
                                ? `${Math.round(distanceKm * 1000)}m`
                                : `${distanceKm.toFixed(1)}km`}{' away'}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.info}>
                <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>
                        {listing.title}
                    </Text>
                    <View style={styles.priceBadge}>
                        <Text style={styles.priceText}>₹{listing.price.toLocaleString()}</Text>
                        <Text style={styles.priceUnit}>/month</Text>
                    </View>
                </View>
                <View style={styles.addressRow}>
                    <Ionicons name="location" size={18} color={colors.primary} />
                    <Text style={styles.address} numberOfLines={1}>
                        {listing.address}, {listing.city}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.specs}>
                    <View style={styles.specItem}>
                        <Ionicons name="bed-outline" size={16} color={colors.cardDarkTextSecondary} />
                        <Text style={styles.specValue}>{listing.bedrooms} Beds</Text>
                    </View>
                    <View style={styles.specDot} />
                    <View style={styles.specItem}>
                        <Ionicons name="water-outline" size={16} color={colors.cardDarkTextSecondary} />
                        <Text style={styles.specValue}>{listing.bathrooms} Baths</Text>
                    </View>
                    <View style={styles.specDot} />
                    <View style={styles.specItem}>
                        <Ionicons name="resize-outline" size={16} color={colors.cardDarkTextSecondary} />
                        <Text style={styles.specValue}>{listing.area} ft²</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // ─── Full Card ───
    card: {
        backgroundColor: colors.cardDark,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
        overflow: 'hidden',
        ...shadows.medium,
    },
    imageContainer: {
        height: 200,
        backgroundColor: colors.cardDarkElevated,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.cardDarkElevated,
    },
    placeholderText: {
        ...typography.caption,
        color: colors.cardDarkTextMuted,
        marginTop: spacing.xs,
    },
    priceBadge: {
        flexDirection: 'row',
        alignItems: 'baseline',
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    priceText: {
        ...typography.price,
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
    priceUnit: {
        ...typography.caption,
        marginLeft: 2,
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
    },
    favoriteBtn: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    furnishedBadge: {
        position: 'absolute',
        top: spacing.md,
        left: spacing.md,
        backgroundColor: colors.text,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    furnishedText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    distanceBadge: {
        position: 'absolute',
        bottom: spacing.md,
        right: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: 'rgba(0,0,0,0.72)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    distanceText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    info: {
        padding: spacing.lg,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    title: {
        ...typography.h3,
        color: colors.cardDarkText,
        flex: 1,
        marginRight: spacing.sm,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    address: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.cardDarkText,
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: colors.cardDarkBorder,
        marginVertical: spacing.md,
    },
    specs: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    specItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    specValue: {
        ...typography.caption,
        color: colors.cardDarkTextSecondary,
    },
    specDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: colors.cardDarkTextMuted,
        marginHorizontal: spacing.sm,
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
    compactImageContainer: {
        height: 130,
        backgroundColor: colors.cardDarkElevated,
        position: 'relative',
    },
    compactImage: {
        width: '100%',
        height: '100%',
    },
    compactPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    compactPriceBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    compactPriceText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    compactInfo: {
        padding: spacing.sm,
    },
    compactTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    compactTitle: {
        ...typography.bodyBold,
        color: colors.cardDarkText,
        fontSize: 14,
        flex: 1,
        marginRight: spacing.xs,
    },
    compactAddressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginBottom: spacing.xs,
    },
    compactAddress: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.cardDarkText,
        flex: 1,
    },
    compactSpecs: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    specText: {
        fontSize: 11,
        color: colors.cardDarkTextMuted,
        marginLeft: 2,
    },
});

// Custom comparator: only re-render when meaningful props change
export default memo(HouseCard, (prev, next) => {
    return (
        prev.listing.id === next.listing.id &&
        prev.isFavorited === next.isFavorited &&
        prev.distanceKm === next.distanceKm &&
        prev.compact === next.compact
    );
});
