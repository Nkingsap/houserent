import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
    Linking,
    Alert,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from '../../components/MapViewWrapper';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import AmenityTag from '../../components/AmenityTag';
import { apiGetFavorites, apiToggleFavorite } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const colorMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#e8f5e9' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#3e3e3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#fdd835' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f9a825' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#64b5f6' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#1565c0' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#a5d6a7' }] },
    { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#c8e6c9' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#dcedc8' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#b0bec5' }] },
];

const HouseDetailScreen = ({ navigation, route }) => {
    const { listing } = route.params;
    const { user } = useAuth();
    const [favorited, setFavorited] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        checkFavorite();
    }, []);

    const checkFavorite = async () => {
        if (user) {
            const { favorites } = await apiGetFavorites(user.id);
            setFavorited(favorites.includes(listing.id));
        }
    };

    const handleFavorite = async () => {
        if (!user) return;
        await apiToggleFavorite(user.id, listing.id);
        setFavorited(!favorited);
    };

    const handleCall = () => {
        Linking.openURL(`tel:${listing.ownerPhone || '+919876543210'}`);
    };

    const handleMessage = () => {
        Linking.openURL(`sms:${listing.ownerPhone || '+919876543210'}`);
    };

    const specs = [
        { icon: 'bed-outline', label: 'Bedrooms', value: listing.bedrooms },
        { icon: 'water-outline', label: 'Bathrooms', value: listing.bathrooms },
        { icon: 'resize-outline', label: 'Area', value: `${listing.area} ft²` },
        { icon: 'home-outline', label: 'Type', value: listing.type?.charAt(0).toUpperCase() + listing.type?.slice(1) },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Image Gallery */}
                <View style={styles.imageSection}>
                    {listing.images && listing.images.length > 0 ? (
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(e) => {
                                const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                                setCurrentImageIndex(idx);
                            }}
                        >
                            {listing.images.map((img, i) => (
                                <Image key={i} source={{ uri: img }} style={styles.galleryImage} />
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Ionicons name="image-outline" size={56} color={colors.textMuted} />
                            <Text style={styles.placeholderText}>No photos available</Text>
                        </View>
                    )}

                    {/* Back & Actions Overlay */}
                    <View style={styles.topBar}>
                        <TouchableOpacity style={styles.topBtn} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={22} color={colors.text} />
                        </TouchableOpacity>
                        <View style={styles.topActions}>
                            <TouchableOpacity style={styles.topBtn} onPress={handleFavorite}>
                                <Ionicons
                                    name={favorited ? 'heart' : 'heart-outline'}
                                    size={22}
                                    color={favorited ? colors.danger : colors.text}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.topBtn}
                                onPress={() => Alert.alert('Shared!', 'Share functionality coming soon.')}
                            >
                                <Ionicons name="share-outline" size={22} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Dots */}
                    {listing.images && listing.images.length > 1 && (
                        <View style={styles.dots}>
                            {listing.images.map((_, i) => (
                                <View
                                    key={i}
                                    style={[styles.dot, i === currentImageIndex && styles.dotActive]}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Price & Title */}
                    <View style={styles.titleSection}>
                        <View style={styles.priceRow}>
                            <Text style={styles.price}>₹{listing.price.toLocaleString()}</Text>
                            <Text style={styles.priceUnit}>/month</Text>
                        </View>
                        <Text style={styles.title}>{listing.title}</Text>
                        <View style={styles.addressRow}>
                            <Ionicons name="location" size={16} color={colors.textMuted} />
                            <Text style={styles.address}>
                                {listing.address}, {listing.city}
                            </Text>
                        </View>
                    </View>

                    {/* Status Badges */}
                    <View style={styles.badgeRow}>
                        {listing.furnished && (
                            <View style={styles.badge}>
                                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                                <Text style={styles.badgeText}>Furnished</Text>
                            </View>
                        )}
                        <View style={styles.badge}>
                            <View style={[styles.statusDot, { backgroundColor: listing.available ? colors.success : colors.danger }]} />
                            <Text style={styles.badgeText}>
                                {listing.available ? 'Available' : 'Not Available'}
                            </Text>
                        </View>
                    </View>

                    {/* Specs List */}
                    <View style={styles.specsList}>
                        {specs.map((spec, i) => (
                            <View key={i} style={[styles.specRow, i < specs.length - 1 && styles.specRowDivider]}>
                                <View style={styles.specLeft}>
                                    <Ionicons name={spec.icon} size={18} color={colors.textMuted} />
                                    <Text style={styles.specLabel}>{spec.label}</Text>
                                </View>
                                <Text style={styles.specValue}>{spec.value}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{listing.description}</Text>
                    </View>

                    {/* Amenities */}
                    {listing.amenities && listing.amenities.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Amenities</Text>
                            <View style={styles.amenitiesGrid}>
                                {listing.amenities.map((a, i) => (
                                    <AmenityTag key={i} name={a} />
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Map */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Location</Text>
                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                latitude={listing.latitude}
                                longitude={listing.longitude}
                                address={`${listing.address}, ${listing.city}`}
                                initialRegion={{
                                    latitude: listing.latitude,
                                    longitude: listing.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                customMapStyle={colorMapStyle}
                                scrollEnabled={false}
                                zoomEnabled={false}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: listing.latitude,
                                        longitude: listing.longitude,
                                    }}
                                >
                                    <View style={styles.mapMarker}>
                                        <Ionicons name="home" size={16} color={colors.background} />
                                    </View>
                                </Marker>
                            </MapView>
                        </View>
                        <Text style={styles.mapAddress}>
                            {listing.address}, {listing.city}
                        </Text>
                    </View>

                    {/* Spacer for bottom bar */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.bottomPrice}>
                    <Text style={styles.bottomPriceText}>₹{listing.price.toLocaleString()}</Text>
                    <Text style={styles.bottomPriceUnit}>/month</Text>
                </View>
                <View style={styles.bottomActions}>
                    <TouchableOpacity style={styles.callBtn} onPress={handleMessage}>
                        <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                        <Ionicons name="call" size={18} color={colors.background} />
                        <Text style={styles.contactBtnText}>Call Owner</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    imageSection: {
        height: 300,
        backgroundColor: colors.card,
        position: 'relative',
    },
    galleryImage: {
        width: width,
        height: 300,
        resizeMode: 'cover',
    },
    placeholderImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
    },
    placeholderText: {
        ...typography.caption,
    },
    topBar: {
        position: 'absolute',
        top: 50,
        left: spacing.lg,
        right: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    topActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    dots: {
        position: 'absolute',
        bottom: spacing.lg,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    dotActive: {
        backgroundColor: colors.text,
        width: 20,
    },
    content: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
    },
    titleSection: {
        marginBottom: spacing.lg,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: spacing.xs,
    },
    price: {
        ...typography.hero,
        fontSize: 28,
    },
    priceUnit: {
        ...typography.body,
        color: colors.textMuted,
        marginLeft: spacing.xs,
    },
    title: {
        ...typography.h2,
        marginBottom: spacing.sm,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    address: {
        ...typography.body,
        color: colors.textMuted,
        flex: 1,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: colors.elevated,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
    },
    badgeText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    specsList: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.xl,
        overflow: 'hidden',
    },
    specRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    specRowDivider: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    specLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    specLabel: {
        ...typography.body,
        color: colors.textMuted,
        fontSize: 14,
    },
    specValue: {
        ...typography.bodyBold,
        fontSize: 14,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.md,
    },
    description: {
        ...typography.body,
        lineHeight: 24,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    mapContainer: {
        height: 200,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    map: {
        flex: 1,
    },
    mapMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e53935',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
        elevation: 6,
    },
    mapAddress: {
        ...typography.caption,
        marginTop: spacing.sm,
        color: colors.textMuted,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.card,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xxl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        ...shadows.large,
    },
    bottomPrice: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    bottomPriceText: {
        ...typography.price,
    },
    bottomPriceUnit: {
        ...typography.caption,
        marginLeft: 2,
    },
    bottomActions: {
        flexDirection: 'row',
        gap: spacing.sm,
        alignItems: 'center',
    },
    callBtn: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: colors.elevated,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    contactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.text,
        paddingHorizontal: spacing.xl,
        height: 48,
        borderRadius: 14,
        gap: spacing.sm,
    },
    contactBtnText: {
        color: colors.background,
        fontSize: 15,
        fontWeight: '700',
    },
});

export default HouseDetailScreen;
