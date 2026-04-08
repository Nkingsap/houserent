import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
    ActivityIndicator,
    Animated,
    Image,
    Platform,
    TextInput,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from '../../components/MapViewWrapper';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { apiGetListings, apiGetFavorites } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

// Haversine distance in km
const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const MapScreen = ({ navigation }) => {
    const { user } = useAuth();
    const mapRef = useRef(null);
    const [listings, setListings] = useState([]);
    const [mapType, setMapType] = useState('hybrid');
    const [selectedListing, setSelectedListing] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [locating, setLocating] = useState(false);
    const cardAnim = useRef(new Animated.Value(0)).current;

    // Search location state
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchedLocation, setSearchedLocation] = useState(null);
    const searchInputRef = useRef(null);

    // Default region (Bangalore)
    const defaultRegion = {
        latitude: 12.9716,
        longitude: 77.5946,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
    };

    const loadListings = async () => {
        const { listings: data } = await apiGetListings();
        const available = data.filter((l) => l.available);
        setListings(available);
    };

    useFocusEffect(
        useCallback(() => {
            loadListings();
        }, [])
    );

    // Fit map to all markers once listings are loaded
    useEffect(() => {
        if (listings.length > 0 && mapRef.current) {
            const coords = listings.map((l) => ({
                latitude: l.latitude,
                longitude: l.longitude,
            }));
            setTimeout(() => {
                mapRef.current?.fitToCoordinates(coords, {
                    edgePadding: { top: 120, right: 60, bottom: 200, left: 60 },
                    animated: true,
                });
            }, 500);
        }
    }, [listings]);

    // Animate card in/out
    useEffect(() => {
        Animated.spring(cardAnim, {
            toValue: selectedListing ? 1 : 0,
            useNativeDriver: true,
            friction: 8,
            tension: 65,
        }).start();
    }, [selectedListing]);

    const locateUser = async () => {
        setLocating(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Location permission is required.');
                return;
            }
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const { latitude, longitude } = loc.coords;
            setUserLocation({ latitude, longitude });
            mapRef.current?.animateToRegion(
                { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 },
                800
            );
        } catch (e) {
            alert('Unable to get location');
        } finally {
            setLocating(false);
        }
    };

    const handleMarkerPress = (listing, e) => {
        // Stop propagation so the map's onPress (handleMapPress) doesn't fire
        if (e && e.stopPropagation) e.stopPropagation();
        setSelectedListing(listing);
        mapRef.current?.animateToRegion(
            {
                latitude: listing.latitude - 0.012,
                longitude: listing.longitude,
                latitudeDelta: 0.025,
                longitudeDelta: 0.025,
            },
            600
        );
    };

    const handleMapPress = () => {
        setSelectedListing(null);
    };

    const navigateToDetail = (listing) => {
        navigation.navigate('HouseDetail', { listing });
    };

    // Search location handler
    const handleSearchLocation = async () => {
        const q = searchQuery.trim();
        if (!q) return;
        Keyboard.dismiss();
        setSearching(true);
        try {
            const results = await Location.geocodeAsync(q);
            if (results && results.length > 0) {
                const { latitude, longitude } = results[0];
                setSearchedLocation({ latitude, longitude });
                setSelectedListing(null);
                mapRef.current?.animateToRegion(
                    {
                        latitude,
                        longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    },
                    800
                );
            } else {
                alert('Location not found. Try a different search term.');
            }
        } catch (e) {
            alert('Unable to search location. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchedLocation(null);
    };

    const mapRegion = listings.length > 0
        ? {
            latitude: listings.reduce((s, l) => s + l.latitude, 0) / listings.length,
            longitude: listings.reduce((s, l) => s + l.longitude, 0) / listings.length,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
        }
        : defaultRegion;

    const cardTranslateY = cardAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [200, 0],
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Full-screen map */}
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                initialRegion={mapRegion}
                mapType={mapType}
                pitchEnabled={true}
                rotateEnabled={true}
                showsPointsOfInterest={true}
                showsBuildings={true}
                showsCompass={false}
                showsUserLocation={true}
                showsMyLocationButton={false}
                onPress={handleMapPress}
                toolbarEnabled={false}
                moveOnMarkerPress={false}
            >
                {listings.map((listing) => (
                    <Marker
                        key={listing.id}
                        coordinate={{
                            latitude: listing.latitude,
                            longitude: listing.longitude,
                        }}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleMarkerPress(listing, e);
                        }}
                        stopPropagation={true}
                        tracksViewChanges={selectedListing?.id === listing.id}
                    >
                        <View style={[
                            styles.markerContainer,
                            selectedListing?.id === listing.id && styles.markerContainerSelected,
                        ]}>
                            <View style={[
                                styles.marker,
                                selectedListing?.id === listing.id && styles.markerSelected,
                            ]}>
                                <Ionicons
                                    name="home"
                                    size={11}
                                    color={selectedListing?.id === listing.id ? '#fff' : colors.primary}
                                    style={{ marginRight: 3 }}
                                />
                                <Text style={[
                                    styles.markerText,
                                    selectedListing?.id === listing.id && styles.markerTextSelected,
                                ]}>
                                    ₹{listing.price >= 1000 ? `${Math.round(listing.price / 1000)}K` : listing.price}
                                </Text>
                            </View>
                            <View style={[
                                styles.markerArrow,
                                selectedListing?.id === listing.id && styles.markerArrowSelected,
                            ]} />
                        </View>
                        <Callout tooltip>
                            <View />
                        </Callout>
                    </Marker>
                ))}
                {/* Search pin marker */}
                {searchedLocation && (
                    <Marker
                        coordinate={searchedLocation}
                        anchor={{ x: 0.5, y: 1 }}
                    >
                        <View style={styles.searchPinContainer}>
                            <View style={styles.searchPin}>
                                <Ionicons name="search" size={14} color="#FFFFFF" />
                            </View>
                            <View style={styles.searchPinStem} />
                        </View>
                    </Marker>
                )}
            </MapView>

            {/* Top overlay: Search bar + controls */}
            <SafeAreaView style={styles.topOverlay} edges={['top']}>
                <View style={styles.topBar}>
                    {/* Search input */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={18} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
                        <TextInput
                            ref={searchInputRef}
                            style={styles.searchInput}
                            placeholder="Search location..."
                            placeholderTextColor="rgba(255,255,255,0.45)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearchLocation}
                            returnKeyType="search"
                            autoCorrect={false}
                        />
                        {searching && (
                            <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" style={{ marginRight: 8 }} />
                        )}
                        {searchQuery.length > 0 && !searching && (
                            <TouchableOpacity onPress={clearSearch} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* My Location button */}
                    <TouchableOpacity
                        style={styles.locateBtn}
                        onPress={locateUser}
                        disabled={locating}
                        activeOpacity={0.8}
                    >
                        {locating ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Ionicons name="locate" size={20} color={colors.primary} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Property count chip */}
                <View style={styles.countRow}>
                    <View style={styles.titleChip}>
                        <Ionicons name="home" size={13} color={colors.primary} />
                        <Text style={styles.titleText}>
                            {listings.length} {listings.length === 1 ? 'Property' : 'Properties'}
                        </Text>
                    </View>
                </View>
            </SafeAreaView>

            {/* Map type selector */}
            <View style={styles.mapTypeRow}>
                {['standard', 'hybrid', 'satellite'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.mapTypeBtn, mapType === type && styles.mapTypeBtnActive]}
                        onPress={() => setMapType(type)}
                    >
                        <Ionicons
                            name={type === 'standard' ? 'map-outline' : type === 'hybrid' ? 'layers-outline' : 'globe-outline'}
                            size={14}
                            color={mapType === type ? '#fff' : 'rgba(255,255,255,0.8)'}
                        />
                        <Text style={[styles.mapTypeTxt, mapType === type && styles.mapTypeTxtActive]}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Selected listing card */}
            <Animated.View
                style={[
                    styles.cardWrapper,
                    {
                        transform: [{ translateY: cardTranslateY }],
                        opacity: cardAnim,
                    },
                ]}
                pointerEvents={selectedListing ? 'auto' : 'none'}
            >
                {selectedListing && (
                    <View style={styles.listingCard}>
                        {/* Close button */}
                        <TouchableOpacity
                            style={styles.cardCloseBtn}
                            onPress={() => setSelectedListing(null)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="close" size={18} color="rgba(255,255,255,0.9)" />
                        </TouchableOpacity>

                        {/* Thumbnail */}
                        {selectedListing.images && selectedListing.images.length > 0 ? (
                            <Image
                                source={{ uri: selectedListing.images[0] }}
                                style={styles.cardImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                                <Ionicons name="image-outline" size={36} color="rgba(255,255,255,0.4)" />
                            </View>
                        )}

                        <View style={styles.cardContent}>
                            {/* Top chips */}
                            <View style={styles.cardTop}>
                                <View style={styles.cardTypeChip}>
                                    <Ionicons
                                        name={selectedListing.type === 'villa' ? 'home' : selectedListing.type === 'house' ? 'storefront' : 'business'}
                                        size={11}
                                        color={colors.primary}
                                    />
                                    <Text style={styles.cardTypeText}>
                                        {selectedListing.type?.charAt(0).toUpperCase() + selectedListing.type?.slice(1)}
                                    </Text>
                                </View>
                                {selectedListing.furnished && (
                                    <View style={styles.furnishedChip}>
                                        <Text style={styles.furnishedText}>Furnished</Text>
                                    </View>
                                )}
                                {userLocation && (
                                    <View style={styles.distanceChip}>
                                        <Ionicons name="navigate-outline" size={11} color={colors.primary} />
                                        <Text style={styles.distanceText}>
                                            {haversine(
                                                userLocation.latitude,
                                                userLocation.longitude,
                                                selectedListing.latitude,
                                                selectedListing.longitude
                                            ).toFixed(1)} km
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <Text style={styles.cardTitle} numberOfLines={1}>
                                {selectedListing.title}
                            </Text>

                            <View style={styles.cardLocationRow}>
                                <Ionicons name="location" size={13} color={colors.primary} />
                                <Text style={styles.cardAddress} numberOfLines={1}>
                                    {selectedListing.address}, {selectedListing.city}
                                </Text>
                            </View>

                            {/* Price + Meta row */}
                            <View style={styles.cardBottom}>
                                <Text style={styles.cardPrice}>
                                    ₹{selectedListing.price?.toLocaleString()}
                                    <Text style={styles.cardPriceUnit}>/mo</Text>
                                </Text>

                                <View style={styles.cardMeta}>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="bed-outline" size={13} color={colors.textMuted} />
                                        <Text style={styles.metaText}>{selectedListing.bedrooms}</Text>
                                    </View>
                                    <View style={styles.metaDot} />
                                    <View style={styles.metaItem}>
                                        <Ionicons name="water-outline" size={13} color={colors.textMuted} />
                                        <Text style={styles.metaText}>{selectedListing.bathrooms}</Text>
                                    </View>
                                    <View style={styles.metaDot} />
                                    <View style={styles.metaItem}>
                                        <Ionicons name="resize-outline" size={13} color={colors.textMuted} />
                                        <Text style={styles.metaText}>{selectedListing.area} ft²</Text>
                                    </View>
                                </View>
                            </View>

                            {/* View Details button */}
                            <TouchableOpacity
                                style={styles.viewDetailBtn}
                                onPress={() => navigateToDetail(selectedListing)}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.viewDetailBtnText}>View Details</Text>
                                <Ionicons name="arrow-forward" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // ── Top overlay ──
    topOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: 4,
        gap: 8,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(20,20,30,0.78)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        height: 48,
        ...(Platform.OS === 'ios' ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
        } : { elevation: 6 }),
    },
    searchIcon: {
        marginLeft: 14,
        marginRight: 2,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        paddingVertical: 0,
        paddingHorizontal: 8,
        height: 48,
    },
    clearBtn: {
        marginRight: 12,
    },
    countRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingBottom: 4,
    },
    titleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(20,20,30,0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    titleText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.85)',
        letterSpacing: 0.2,
    },
    locateBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(20,20,30,0.78)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        ...(Platform.OS === 'ios' ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
        } : { elevation: 6 }),
    },

    // ── Map type selector ──
    // ── Search pin marker ──
    searchPinContainer: {
        alignItems: 'center',
    },
    searchPin: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FF6B6B',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        ...(Platform.OS === 'ios' ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.35,
            shadowRadius: 4,
        } : { elevation: 6 }),
    },
    searchPinStem: {
        width: 3,
        height: 10,
        backgroundColor: '#FF6B6B',
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
        marginTop: -1,
    },

    mapTypeRow: {
        position: 'absolute',
        top: 155,
        right: spacing.lg,
        backgroundColor: 'rgba(15,15,25,0.8)',
        borderRadius: 16,
        padding: 4,
        gap: 2,
        zIndex: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    mapTypeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    mapTypeBtnActive: {
        backgroundColor: colors.primary,
    },
    mapTypeTxt: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.75)',
    },
    mapTypeTxtActive: {
        color: '#fff',
        fontWeight: '700',
    },

    // ── Markers ──
    markerContainer: {
        alignItems: 'center',
    },
    markerContainerSelected: {
        transform: [{ scale: 1.2 }],
    },
    marker: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: colors.primary,
        ...(Platform.OS === 'ios' ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
        } : { elevation: 6 }),
    },
    markerSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primaryDark || colors.primary,
    },
    markerText: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.primary,
    },
    markerTextSelected: {
        color: '#FFFFFF',
    },
    markerArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 7,
        borderRightWidth: 7,
        borderTopWidth: 9,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: colors.primary,
        marginTop: -1,
    },
    markerArrowSelected: {
        borderTopColor: colors.primaryDark || colors.primary,
    },

    // ── Bottom listing card ──
    cardWrapper: {
        position: 'absolute',
        bottom: 95,
        left: spacing.md,
        right: spacing.md,
        zIndex: 10,
    },
    listingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        overflow: 'hidden',
        ...(Platform.OS === 'ios' ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 24,
        } : { elevation: 14 }),
    },
    cardCloseBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 5,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardImage: {
        width: '100%',
        height: 130,
        backgroundColor: 'rgba(0,0,0,0.08)',
    },
    cardImagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.06)',
    },
    cardContent: {
        padding: 14,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
        flexWrap: 'wrap',
    },
    cardTypeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: `${colors.primary}12`,
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 8,
    },
    cardTypeText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    furnishedChip: {
        backgroundColor: `${colors.success}15`,
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 8,
    },
    furnishedText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.success,
    },
    distanceChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: `${colors.primary}10`,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    distanceText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.primary,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 3,
        letterSpacing: -0.2,
    },
    cardLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 10,
    },
    cardAddress: {
        fontSize: 12,
        color: colors.textMuted,
        flex: 1,
    },
    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardPrice: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.text,
    },
    cardPriceUnit: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.textMuted,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    metaDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: colors.textMuted,
        opacity: 0.4,
    },
    metaText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    viewDetailBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: 14,
    },
    viewDetailBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
});

export default MapScreen;
