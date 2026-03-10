import React, { useState, useEffect, useRef } from 'react';
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
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from '../../components/MapViewWrapper';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import AmenityTag from '../../components/AmenityTag';
import { apiGetFavorites, apiToggleFavorite } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');



const HouseDetailScreen = ({ navigation, route }) => {
    const { listing } = route.params;
    const { user } = useAuth();
    const [favorited, setFavorited] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [fullscreenMap, setFullscreenMap] = useState(false);
    const [mapType, setMapType] = useState('hybrid');

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
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

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

                            {/* Fullscreen button */}
                            <TouchableOpacity
                                style={styles.mapFullscreenBtn}
                                onPress={() => setFullscreenMap(true)}
                            >
                                <Ionicons name="expand" size={18} color="#fff" />
                            </TouchableOpacity>

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
                                style={StyleSheet.absoluteFillObject}
                                initialRegion={{
                                    latitude: listing.latitude,
                                    longitude: listing.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                mapType={mapType}
                                pitchEnabled={true}
                                rotateEnabled={true}
                                showsPointsOfInterest={true}
                                showsBuildings={true}
                                showsCompass={true}
                                showsUserLocation={true}
                                showsMyLocationButton={false}
                                showsScale={true}
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
                        </SafeAreaView>
                    </Modal>

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
                        <Ionicons name="call" size={18} color={"#FFFFFF"} />
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
        color: colors.textSecondary,
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
        color: colors.textSecondary,
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
    mapFullscreenBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 38,
        height: 38,
        borderRadius: 9,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
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
        bottom: 40,
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
    mapMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.text,
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
        color: colors.textSecondary,
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
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default HouseDetailScreen;
