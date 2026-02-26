import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.xl * 2;

const HouseCard = ({ listing, onPress, onFavorite, isFavorited, compact }) => {
    const formatPrice = (price) => {
        if (price >= 1000) return `₹${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K`;
        return `₹${price}`;
    };

    if (compact) {
        return (
            <TouchableOpacity
                style={styles.compactCard}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <View style={styles.compactImageContainer}>
                    {listing.images && listing.images.length > 0 ? (
                        <Image source={{ uri: listing.images[0] }} style={styles.compactImage} />
                    ) : (
                        <View style={styles.compactPlaceholder}>
                            <Ionicons name="home-outline" size={24} color={colors.textMuted} />
                        </View>
                    )}
                    <View style={styles.compactPriceBadge}>
                        <Text style={styles.compactPriceText}>{formatPrice(listing.price)}/mo</Text>
                    </View>
                </View>
                <View style={styles.compactInfo}>
                    <Text style={styles.compactTitle} numberOfLines={1}>
                        {listing.title}
                    </Text>
                    <Text style={styles.compactAddress} numberOfLines={1}>
                        {listing.address}
                    </Text>
                    <View style={styles.compactSpecs}>
                        <View style={styles.specItem}>
                            <Ionicons name="bed-outline" size={12} color={colors.textMuted} />
                            <Text style={styles.specText}>{listing.bedrooms}</Text>
                        </View>
                        <View style={styles.specItem}>
                            <Ionicons name="water-outline" size={12} color={colors.textMuted} />
                            <Text style={styles.specText}>{listing.bathrooms}</Text>
                        </View>
                        <View style={styles.specItem}>
                            <Ionicons name="resize-outline" size={12} color={colors.textMuted} />
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
                    <Image source={{ uri: listing.images[0] }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="home-outline" size={40} color={colors.textMuted} />
                        <Text style={styles.placeholderText}>No photo</Text>
                    </View>
                )}

                <View style={styles.imageBadges}>
                    <View style={styles.priceBadge}>
                        <Text style={styles.priceText}>₹{listing.price.toLocaleString()}</Text>
                        <Text style={styles.priceUnit}>/month</Text>
                    </View>
                </View>

                {onFavorite && (
                    <TouchableOpacity
                        style={styles.favoriteBtn}
                        onPress={onFavorite}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name={isFavorited ? 'heart' : 'heart-outline'}
                            size={22}
                            color={isFavorited ? colors.danger : colors.text}
                        />
                    </TouchableOpacity>
                )}

                {listing.furnished && (
                    <View style={styles.furnishedBadge}>
                        <Text style={styles.furnishedText}>Furnished</Text>
                    </View>
                )}
            </View>

            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>
                    {listing.title}
                </Text>
                <View style={styles.addressRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                    <Text style={styles.address} numberOfLines={1}>
                        {listing.address}, {listing.city}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.specs}>
                    <View style={styles.specItem}>
                        <Ionicons name="bed-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.specValue}>{listing.bedrooms} Beds</Text>
                    </View>
                    <View style={styles.specDot} />
                    <View style={styles.specItem}>
                        <Ionicons name="water-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.specValue}>{listing.bathrooms} Baths</Text>
                    </View>
                    <View style={styles.specDot} />
                    <View style={styles.specItem}>
                        <Ionicons name="resize-outline" size={16} color={colors.textSecondary} />
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
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.medium,
    },
    imageContainer: {
        height: 200,
        backgroundColor: colors.elevated,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        ...typography.caption,
        marginTop: spacing.xs,
    },
    imageBadges: {
        position: 'absolute',
        bottom: spacing.md,
        left: spacing.md,
    },
    priceBadge: {
        flexDirection: 'row',
        alignItems: 'baseline',
        backgroundColor: 'rgba(0,0,0,0.85)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
    },
    priceText: {
        ...typography.price,
        fontSize: 18,
    },
    priceUnit: {
        ...typography.caption,
        marginLeft: 2,
        color: colors.textSecondary,
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
        color: colors.background,
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    info: {
        padding: spacing.lg,
    },
    title: {
        ...typography.h3,
        marginBottom: spacing.xs,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    address: {
        ...typography.caption,
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
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
        color: colors.textSecondary,
    },
    specDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: colors.textMuted,
        marginHorizontal: spacing.sm,
    },

    // ─── Compact Card ───
    compactCard: {
        width: 200,
        backgroundColor: colors.card,
        borderRadius: borderRadius.md,
        marginRight: spacing.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.small,
    },
    compactImageContainer: {
        height: 130,
        backgroundColor: colors.elevated,
        position: 'relative',
    },
    compactImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    compactPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    compactPriceBadge: {
        position: 'absolute',
        bottom: spacing.sm,
        left: spacing.sm,
        backgroundColor: 'rgba(0,0,0,0.85)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: borderRadius.sm,
    },
    compactPriceText: {
        color: colors.text,
        fontSize: 13,
        fontWeight: '700',
    },
    compactInfo: {
        padding: spacing.sm,
    },
    compactTitle: {
        ...typography.bodyBold,
        fontSize: 14,
        marginBottom: 2,
    },
    compactAddress: {
        ...typography.caption,
        fontSize: 11,
        marginBottom: spacing.xs,
    },
    compactSpecs: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    specText: {
        fontSize: 11,
        color: colors.textMuted,
        marginLeft: 2,
    },
});

export default HouseCard;
