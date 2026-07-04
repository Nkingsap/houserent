import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
    Linking,
    Alert,
    Modal,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import FullscreenGallery from '../../components/FullscreenGallery';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from '../../components/MapViewWrapper';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import AmenityTag from '../../components/AmenityTag';
import { apiGetFavorites, apiToggleFavorite, getThumbnailUrl } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const { width, height: screenHeight } = Dimensions.get('window');
const IMAGE_SECTION_HEIGHT = screenHeight * 0.45;

const HouseDetailScreen = ({ navigation, route }) => {
    const { listing } = route.params;
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [favorited, setFavorited] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [fullscreenMap, setFullscreenMap] = useState(false);
    const [fullscreenGallery, setFullscreenGallery] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);
    const [mapType, setMapType] = useState('hybrid');
    const [userLocation, setUserLocation] = useState(null);
    const [locatingUser, setLocatingUser] = useState(false);
    const fullscreenMapRef = useRef(null);
    const galleryListRef = useRef(null);

    useEffect(() => {
        // Parallelize initial data fetches — was previously sequential
        Promise.all([
            checkFavorite(),
            getUserLocation(),
        ]);
    }, []);

    const checkFavorite = async () => {
        if (user) {
            const { favorites } = await apiGetFavorites(user.id);
            setFavorited(favorites.includes(listing.id));
        }
    };

    const getUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            setUserLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
        } catch (_) {
            // silently ignore
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

    const openDirectionsInGoogleMaps = () => {
        const destination = `${listing.latitude},${listing.longitude}`;
        const label = encodeURIComponent(listing.title || 'Property');

        // Use Google Maps directions URL with destination pre-set
        // This will automatically use the user's current location as origin
        const url = Platform.select({
            ios: `comgooglemaps://?daddr=${destination}&directionsmode=driving`,
            android: `google.navigation:q=${destination}`,
        });

        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=&travelmode=driving`;

        Linking.canOpenURL(url).then((supported) => {
            if (supported) {
                Linking.openURL(url);
            } else {
                // Fallback to web Google Maps
                Linking.openURL(webUrl);
            }
        }).catch(() => {
            Linking.openURL(webUrl);
        });
    };

    const specs = [
        { icon: 'bed-outline', label: 'Bedrooms', value: listing.bedrooms },
        { icon: 'water-outline', label: 'Bathrooms', value: listing.bathrooms },
        { icon: 'resize-outline', label: 'Area', value: `${listing.area} ft²` },
        { icon: 'home-outline', label: 'Type', value: listing.type?.charAt(0).toUpperCase() + listing.type?.slice(1) },
    ];

    // Calculate the map region to show both user and property
    const getMapRegion = () => {
        if (userLocation) {
            const minLat = Math.min(userLocation.latitude, listing.latitude);
            const maxLat = Math.max(userLocation.latitude, listing.latitude);
            const minLng = Math.min(userLocation.longitude, listing.longitude);
            const maxLng = Math.max(userLocation.longitude, listing.longitude);
            const latDelta = (maxLat - minLat) * 1.5 || 0.01;
            const lngDelta = (maxLng - minLng) * 1.5 || 0.01;
            return {
                latitude: (minLat + maxLat) / 2,
                longitude: (minLng + maxLng) / 2,
                latitudeDelta: Math.max(latDelta, 0.01),
                longitudeDelta: Math.max(lngDelta, 0.01),
            };
        }
        return {
            latitude: listing.latitude,
            longitude: listing.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };
    };

    const openGallery = (index) => {
        setGalleryIndex(index);
        setFullscreenGallery(true);
    };

    const images = listing.images || [];
    const totalImages = images.length;



    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Image Gallery — half screen */}
                <View style={styles.imageSection}>
                    {totalImages > 0 ? (
                        <FlatList
                            ref={galleryListRef}
                            data={images}
                            keyExtractor={(_, i) => String(i)}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={width}
                            snapToAlignment="start"
                            decelerationRate="fast"
                            bounces={false}
                            overScrollMode="never"
                            getItemLayout={(_, index) => ({
                                length: width,
                                offset: width * index,
                                index,
                            })}
                            onMomentumScrollEnd={(e) => {
                                const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                                setCurrentImageIndex(idx);
                            }}
                            renderItem={({ item: img, index: i }) => (
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => openGallery(i)}
                                >
                                    <Image source={getThumbnailUrl(img, 800, Math.round(IMAGE_SECTION_HEIGHT))} style={styles.galleryImage} cachePolicy="memory-disk" transition={200} contentFit="cover" />
                                </TouchableOpacity>
                            )}
                        />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Ionicons name="image-outline" size={56} color={colors.textMuted} />
                            <Text style={styles.placeholderText}>No photos available</Text>
                        </View>
                    )}

                    {/* Dark gradient at top & bottom for readability */}
                    <View style={styles.imageGradientTop} pointerEvents="none" />
                    <View style={styles.imageGradientBottom} pointerEvents="none" />

                    {/* Back & Actions Overlay */}
                    <View style={styles.topBar}>
                        <TouchableOpacity style={styles.topBtn} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.topActions}>
                            <TouchableOpacity style={styles.topBtn} onPress={handleFavorite}>
                                <Ionicons
                                    name={favorited ? 'heart' : 'heart-outline'}
                                    size={22}
                                    color={favorited ? colors.danger : '#FFFFFF'}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.topBtn}
                                onPress={() => Alert.alert('Shared!', 'Share functionality coming soon.')}
                            >
                                <Ionicons name="share-outline" size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Bottom overlay: dots + image counter + tap hint */}
                    <View style={styles.imageBottomOverlay}>
                        {/* Dots */}
                        {totalImages > 1 && (
                            <View style={styles.dots}>
                                {images.map((_, i) => (
                                    <View
                                        key={i}
                                        style={[styles.dot, i === currentImageIndex && styles.dotActive]}
                                    />
                                ))}
                            </View>
                        )}

                        {/* Image counter + tap hint */}
                        <View style={styles.imageOverlayRow}>
                            {totalImages > 0 && (
                                <View style={styles.imageCountChip}>
                                    <Ionicons name="images-outline" size={13} color="#fff" />
                                    <Text style={styles.imageCountText}>
                                        {currentImageIndex + 1} / {totalImages}
                                    </Text>
                                </View>
                            )}
                            {totalImages > 0 && (
                                <TouchableOpacity
                                    style={styles.tapToViewChip}
                                    onPress={() => openGallery(currentImageIndex)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="expand-outline" size={13} color="#fff" />
                                    <Text style={styles.tapToViewText}>Tap to view</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Title & Price */}
                    <View style={styles.titleSection}>
                        <View style={styles.titlePriceRow}>
                            <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
                            <View style={styles.detailPriceBadge}>
                                <Text style={styles.detailPriceText}>₹{listing.price.toLocaleString()}</Text>
                                <Text style={styles.detailPriceUnit}>/month</Text>
                            </View>
                        </View>
                        <View style={styles.addressRow}>
                            <Ionicons name="location" size={20} color={colors.primary} />
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

                    {/* Location & Directions Section */}
                    <View style={styles.section}>
                        <View style={styles.locationHeader}>
                            <Text style={styles.sectionTitle}>Location</Text>
                            <TouchableOpacity
                                style={styles.expandMapBtn}
                                onPress={() => setFullscreenMap(true)}
                            >
                                <Ionicons name="expand-outline" size={16} color={colors.primary} />
                                <Text style={styles.expandMapText}>Expand</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Map */}
                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: listing.latitude,
                                    longitude: listing.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                mapType={mapType}
                                pitchEnabled={true}
                                rotateEnabled={true}
                                scrollEnabled={true}
                                zoomEnabled={true}
                                showsPointsOfInterest={true}
                                showsBuildings={true}
                                showsCompass={true}
                                showsUserLocation={true}
                                showsMyLocationButton={false}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: listing.latitude,
                                        longitude: listing.longitude,
                                    }}
                                >
                                    <View style={styles.mapMarker}>
                                        <Ionicons name="home" size={16} color={colors.card} />
                                    </View>
                                </Marker>
                            </MapView>

                            {/* Map type toggle */}
                            <View style={styles.mapTypeRow}>
                                {['standard', 'hybrid', 'satellite'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.mapTypeBtn, mapType === type && styles.mapTypeBtnActive]}
                                        onPress={() => setMapType(type)}
                                    >
                                        <Text style={[styles.mapTypeTxt, mapType === type && styles.mapTypeTxtActive]}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <Text style={styles.mapAddress}>
                            {listing.address}, {listing.city}
                        </Text>

                        {/* ★ Get Directions Button — prominent and clear */}
                        <TouchableOpacity
                            style={styles.directionsBtn}
                            onPress={openDirectionsInGoogleMaps}
                            activeOpacity={0.85}
                        >
                            <View style={styles.directionsBtnIcon}>
                                <Ionicons name="navigate" size={20} color="#FFFFFF" />
                            </View>
                            <View style={styles.directionsBtnContent}>
                                <Text style={styles.directionsBtnTitle}>Get Directions</Text>
                                <Text style={styles.directionsBtnSubtitle}>Open in Google Maps</Text>
                            </View>
                            <Ionicons name="open-outline" size={18} color="rgba(255,255,255,0.7)" />
                        </TouchableOpacity>
                    </View>

                    {/* Fullscreen Map Modal */}
                    <Modal
                        visible={fullscreenMap}
                        animationType="slide"
                        statusBarTranslucent
                        onRequestClose={() => setFullscreenMap(false)}
                    >
                        <SafeAreaView style={styles.fsContainer}>
                            <StatusBar barStyle="light-content" backgroundColor="#000" translucent />

                            <MapView
                                ref={fullscreenMapRef}
                                style={StyleSheet.absoluteFillObject}
                                initialRegion={getMapRegion()}
                                mapType={mapType}
                                pitchEnabled={true}
                                rotateEnabled={true}
                                showsPointsOfInterest={true}
                                showsBuildings={true}
                                showsCompass={true}
                                showsUserLocation={true}
                                showsMyLocationButton={true}
                                showsScale={true}
                                showsTraffic={true}
                            >
                                {/* Property marker */}
                                <Marker
                                    coordinate={{
                                        latitude: listing.latitude,
                                        longitude: listing.longitude,
                                    }}
                                >
                                    <View style={styles.mapMarker}>
                                        <Ionicons name="home" size={16} color={colors.card} />
                                    </View>
                                </Marker>
                            </MapView>

                            {/* Close */}
                            <TouchableOpacity
                                style={styles.fsCloseBtn}
                                onPress={() => setFullscreenMap(false)}
                            >
                                <Ionicons name="close" size={22} color="#fff" />
                            </TouchableOpacity>

                            {/* Address chip */}
                            <View style={styles.fsAddressChip}>
                                <Ionicons name="location" size={14} color="#fff" />
                                <Text style={styles.fsAddressText} numberOfLines={1}>
                                    {listing.address}, {listing.city}
                                </Text>
                            </View>

                            {/* Map type strip */}
                            <View style={styles.fsMapTypeRow}>
                                {['standard', 'hybrid', 'satellite'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.fsMapTypeBtn, mapType === type && styles.fsMapTypeBtnActive]}
                                        onPress={() => setMapType(type)}
                                    >
                                        <Text style={[styles.fsMapTypeTxt, mapType === type && styles.fsMapTypeTxtActive]}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Directions button on fullscreen map */}
                            <TouchableOpacity
                                style={styles.fsDirectionsBtn}
                                onPress={openDirectionsInGoogleMaps}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="navigate" size={20} color="#FFFFFF" />
                                <Text style={styles.fsDirectionsBtnText}>Directions</Text>
                            </TouchableOpacity>
                        </SafeAreaView>
                    </Modal>

                    {/* Spacer for bottom bar */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* ═══════ Fullscreen Photo Gallery ═══════ */}
            <FullscreenGallery
                images={images}
                initialIndex={galleryIndex}
                visible={fullscreenGallery}
                onClose={() => setFullscreenGallery(false)}
            />

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
                <View style={styles.bottomPrice}>
                    <Text style={styles.bottomPriceText}>₹{listing.price.toLocaleString()}</Text>
                    <Text style={styles.bottomPriceUnit}>/month</Text>
                </View>
                <View style={styles.bottomActions}>
                    <TouchableOpacity style={styles.callBtn} onPress={handleMessage}>
                        <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                        <Ionicons name="call" size={18} color={"#FFFFFF"} />
                        <Text style={styles.contactBtnText}>Call Owner</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    imageSection: {
        height: IMAGE_SECTION_HEIGHT,
        backgroundColor: '#000',
        position: 'relative',
    },
    galleryImage: {
        width: width,
        height: IMAGE_SECTION_HEIGHT,
    },
    imageGradientTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        backgroundColor: 'transparent',
        // Simulated gradient with layered opacity
        borderTopWidth: 0,
    },
    imageGradientBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    placeholderImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.card,
    },
    placeholderText: {
        ...typography.caption,
    },
    topBar: {
        position: 'absolute',
        top: spacing.sm,
        left: spacing.lg,
        right: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    topBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    topActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    imageBottomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        zIndex: 5,
    },
    imageOverlayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    imageCountChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    imageCountText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    tapToViewChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    tapToViewText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    dots: {
        alignSelf: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.45)',
    },
    dotActive: {
        backgroundColor: '#FFFFFF',
        width: 20,
    },


    content: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
    },
    titleSection: {
        marginBottom: spacing.lg,
    },
    titlePriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    detailPriceBadge: {
        flexDirection: 'row',
        alignItems: 'baseline',
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
    },
    detailPriceText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
    detailPriceUnit: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginLeft: 2,
    },
    title: {
        ...typography.h2,
        flex: 1,
        marginRight: spacing.sm,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    address: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
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
        backgroundColor: colors.elevated,
        borderRadius: borderRadius.md,
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
        borderBottomColor: colors.surface,
    },
    specLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    specLabel: {
        ...typography.body,
        color: colors.textSecondary,
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

    // ── Location header ──
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    expandMapBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: `${colors.primary}15`,
    },
    expandMapText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
    },

    // ── Map ──
    mapContainer: {
        height: 200,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    map: {
        flex: 1,
    },
    mapTypeRow: {
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 18,
        padding: 3,
        gap: 2,
    },
    mapTypeBtn: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
    },
    mapTypeBtnActive: {
        backgroundColor: '#fff',
    },
    mapTypeTxt: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.75)',
    },
    mapTypeTxtActive: {
        color: '#111',
    },
    mapAddress: {
        ...typography.caption,
        marginTop: spacing.sm,
        color: colors.textSecondary,
    },

    // ── Directions Button (in-page) ──
    directionsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: 16,
        padding: 14,
        marginTop: spacing.md,
        gap: 12,
        ...(Platform.OS === 'ios' ? {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
        } : { elevation: 8 }),
    },
    directionsBtnIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    directionsBtnContent: {
        flex: 1,
    },
    directionsBtnTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    directionsBtnSubtitle: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 1,
    },

    // ── Fullscreen Modal ──
    fsContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    fsCloseBtn: {
        position: 'absolute',
        top: 52,
        left: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    fsAddressChip: {
        position: 'absolute',
        top: 62,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.65)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        zIndex: 10,
        maxWidth: '75%',
    },
    fsAddressText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        flexShrink: 1,
    },
    fsMapTypeRow: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.65)',
        borderRadius: 24,
        padding: 4,
        gap: 2,
        zIndex: 10,
    },
    fsMapTypeBtn: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
    },
    fsMapTypeBtnActive: {
        backgroundColor: '#fff',
    },
    fsMapTypeTxt: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.75)',
    },
    fsMapTypeTxtActive: {
        color: '#111',
    },
    fsDirectionsBtn: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.primary,
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 28,
        zIndex: 10,
        ...(Platform.OS === 'ios' ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
        } : { elevation: 8 }),
    },
    fsDirectionsBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    // ── Map marker ──
    mapMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
        elevation: 6,
    },

    // ── Bottom Bar ──
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
    directionsSmallBtn: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: `${colors.primary}15`,
        borderWidth: 1.5,
        borderColor: `${colors.primary}30`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    callBtn: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: colors.elevated,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        height: 48,
        borderRadius: 14,
        gap: spacing.sm,
    },
    contactBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default HouseDetailScreen;
