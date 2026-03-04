import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import MapView, { Marker } from '../../components/MapViewWrapper';
import { colors, spacing, borderRadius, typography } from '../../theme';
import SearchBar from '../../components/SearchBar';
import FilterPanel from '../../components/FilterPanel';
import HouseCard from '../../components/HouseCard';
import EmptyState from '../../components/EmptyState';
import { apiGetListings, apiGetFavorites, apiToggleFavorite } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');



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

// Step 1 – instant: last known (any age) or fast network fix
// Step 2 – background: full GPS accuracy, silently updates results
const getQuickLocation = async () => {
    const last = await Location.getLastKnownPositionAsync();
    if (last) return last;
    return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
};

const getAccurateLocation = () =>
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

const ExploreScreen = ({ navigation, route }) => {
    const { user } = useAuth();
    const [query, setQuery] = useState(route.params?.query || '');
    const [filters, setFilters] = useState({
        type: route.params?.type || null,
        minPrice: null,
        maxPrice: null,
        bedrooms: null,
    });
    const [results, setResults] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState(route.params?.viewMode || 'list'); // 'list' or 'map'
    const [fullscreenMap, setFullscreenMap] = useState(false);
    const [mapType, setMapType] = useState('hybrid');
    const mapRef = useRef(null);
    const fullscreenMapRef = useRef(null);

    // Near Me
    const [nearMe, setNearMe] = useState(false);
    const [locating, setLocating] = useState(false);
    const [locationRefreshing, setLocationRefreshing] = useState(false); // silent bg GPS refresh
    const [userLocation, setUserLocation] = useState(null);
    const [nearMeRadius, setNearMeRadius] = useState(20);

    // Sync query from HomeScreen navigation param
    useEffect(() => {
        if (route.params?.query !== undefined) {
            setQuery(route.params.query);
        }
    }, [route.params?.query]);

    // Sync viewMode from navigation param (e.g. Map button on HomeScreen)
    useEffect(() => {
        if (route.params?.viewMode) {
            setViewMode(route.params.viewMode);
        }
    }, [route.params?.viewMode]);

    // Auto-trigger Near Me if navigated with nearMe param
    useEffect(() => {
        if (route.params?.nearMe) {
            (async () => {
                setLocating(true);
                try {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') return;
                    // Step 1: show results fast
                    const quick = await getQuickLocation();
                    const { latitude, longitude } = quick.coords;
                    setUserLocation({ latitude, longitude });
                    setNearMe(true);
                    setTimeout(() => {
                        mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.1, longitudeDelta: 0.1 }, 600);
                        fullscreenMapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.1, longitudeDelta: 0.1 }, 600);
                    }, 300);
                } finally {
                    setLocating(false);
                }
                // Step 2: silently refresh with accurate GPS
                try {
                    setLocationRefreshing(true);
                    const accurate = await getAccurateLocation();
                    const { latitude, longitude } = accurate.coords;
                    setUserLocation({ latitude, longitude });
                } catch (_) {
                    // best-effort – ignore if GPS unavailable
                } finally {
                    setLocationRefreshing(false);
                }
            })();
        }
    }, [route.params?.nearMe]);

    const doSearch = async () => {
        const { listings: data } = await apiGetListings({
            q: query || undefined,
            type: filters.type || undefined,
            minPrice: filters.minPrice || undefined,
            maxPrice: filters.maxPrice || undefined,
            bedrooms: filters.bedrooms || undefined,
        });
        let available = data.filter((l) => l.available);
        // Filter & sort by distance when Near Me is on
        if (nearMe && userLocation) {
            available = available
                .map((l) => ({
                    ...l,
                    _dist: haversine(userLocation.latitude, userLocation.longitude, l.latitude, l.longitude),
                }))
                .filter((l) => l._dist <= nearMeRadius)   // ← only within radius
                .sort((a, b) => a._dist - b._dist);
        }
        setResults(available);
        if (user) {
            const { favorites } = await apiGetFavorites(user.id);
            setFavorites(favorites);
        }

        // When in map view with a search query, pan the map to that location
        if (viewMode === 'map' && query.trim() && !nearMe) {
            try {
                const geocoded = await Location.geocodeAsync(query.trim());
                if (geocoded.length > 0) {
                    const { latitude, longitude } = geocoded[0];
                    const region = { latitude, longitude, latitudeDelta: 0.08, longitudeDelta: 0.08 };
                    setTimeout(() => {
                        mapRef.current?.animateToRegion(region, 800);
                        fullscreenMapRef.current?.animateToRegion(region, 800);
                    }, 300);
                }
            } catch (_) {
                // geocoding unavailable – silently ignore
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            doSearch();
        }, [query, filters, nearMe, userLocation, nearMeRadius, viewMode])
    );

    const handleFavorite = async (listingId) => {
        if (!user) return;
        await apiToggleFavorite(user.id, listingId);
        const { favorites } = await apiGetFavorites(user.id);
        setFavorites(favorites);
    };

    const toggleNearMe = async () => {
        if (nearMe) {
            setNearMe(false);
            setUserLocation(null);
            setLocationRefreshing(false);
            return;
        }
        setLocating(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Location permission is required for Near Me.');
                return;
            }
            // Step 1: show results instantly with quick location
            const quick = await getQuickLocation();
            const { latitude, longitude } = quick.coords;
            setUserLocation({ latitude, longitude });
            setNearMe(true);
            const region = { latitude, longitude, latitudeDelta: 0.1, longitudeDelta: 0.1 };
            setTimeout(() => {
                mapRef.current?.animateToRegion(region, 600);
                fullscreenMapRef.current?.animateToRegion(region, 600);
            }, 300);
        } catch (e) {
            alert('Unable to get location: ' + (e.message || ''));
        } finally {
            setLocating(false);
        }
        // Step 2: silently fetch accurate GPS in background
        try {
            setLocationRefreshing(true);
            const accurate = await getAccurateLocation();
            const { latitude, longitude } = accurate.coords;
            setUserLocation({ latitude, longitude });
        } catch (_) {
            // best-effort – ignore if GPS unavailable
        } finally {
            setLocationRefreshing(false);
        }
    };

    const activeFiltersCount = [filters.type, filters.minPrice, filters.bedrooms].filter(Boolean).length;

    const mapRegion = userLocation && nearMe
        ? {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.12,
            longitudeDelta: 0.12,
        }
        : results.length > 0
            ? {
                latitude: results.reduce((s, l) => s + l.latitude, 0) / results.length,
                longitude: results.reduce((s, l) => s + l.longitude, 0) / results.length,
                latitudeDelta: 0.15,
                longitudeDelta: 0.15,
            }
            : {
                latitude: 12.9716,
                longitude: 77.5946,
                latitudeDelta: 0.15,
                longitudeDelta: 0.15,
            };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header: title + [Nearby | List | Map] segmented control */}
            <View style={styles.header}>
                <Text style={styles.title}>Explore</Text>
                <View style={styles.segmentedControl}>
                    {/* Near Me */}
                    <TouchableOpacity
                        style={[styles.segmentBtn, nearMe && styles.segmentBtnActive]}
                        onPress={toggleNearMe}
                        disabled={locating}
                        activeOpacity={0.75}
                    >
                        {locating ? (
                            <ActivityIndicator size="small" color={nearMe ? '#FFFFFF' : colors.textSecondary} style={{ width: 15, height: 15 }} />
                        ) : (
                            <Ionicons name={nearMe ? 'location' : 'location-outline'} size={15} color={nearMe ? '#FFFFFF' : colors.textSecondary} />
                        )}
                        <Text style={[styles.segmentBtnText, nearMe && styles.segmentBtnTextActive]}>Nearby</Text>
                    </TouchableOpacity>

                    <View style={styles.segmentDivider} />

                    {/* List */}
                    <TouchableOpacity
                        style={[styles.segmentBtn, viewMode === 'list' && styles.segmentBtnActive]}
                        onPress={() => setViewMode('list')}
                    >
                        <Ionicons name="list" size={15} color={viewMode === 'list' ? '#FFFFFF' : colors.textSecondary} />
                        <Text style={[styles.segmentBtnText, viewMode === 'list' && styles.segmentBtnTextActive]}>List</Text>
                    </TouchableOpacity>

                    {/* Map */}
                    <TouchableOpacity
                        style={[styles.segmentBtn, viewMode === 'map' && styles.segmentBtnActive]}
                        onPress={() => setViewMode('map')}
                    >
                        <Ionicons name="map" size={15} color={viewMode === 'map' ? '#FFFFFF' : colors.textSecondary} />
                        <Text style={[styles.segmentBtnText, viewMode === 'map' && styles.segmentBtnTextActive]}>Map</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search row: search bar + Filter button */}
            <View style={styles.searchRow}>
                <View style={{ flex: 1 }}>
                    <SearchBar
                        value={query}
                        onChangeText={setQuery}
                        onSubmit={doSearch}
                    />
                </View>

                {/* Filter button */}
                <TouchableOpacity
                    style={[styles.iconBtn, showFilters && styles.iconBtnActive]}
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <Ionicons
                        name="options"
                        size={20}
                        color={showFilters ? '#FFFFFF' : colors.text}
                    />
                    {activeFiltersCount > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Filters panel */}
            {showFilters && (
                <FilterPanel filters={filters} onFilterChange={setFilters} />
            )}

            {/* Near Me active banner: radius selector + optional location-refreshing chip */}
            {nearMe && (
                <View style={styles.nearMeBanner}>
                    <View style={styles.nearMeBannerLeft}>
                        <Ionicons name="location" size={13} color={colors.text} />
                        <Text style={styles.nearMeBannerLabel}>Within</Text>
                    </View>
                    <View style={styles.radiusChips}>
                        {[5, 10, 20, 50].map((km) => (
                            <TouchableOpacity
                                key={km}
                                style={[styles.radiusChip, nearMeRadius === km && styles.radiusChipActive]}
                                onPress={() => setNearMeRadius(km)}
                            >
                                <Text style={[styles.radiusChipText, nearMeRadius === km && styles.radiusChipTextActive]}>
                                    {km} km
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {locationRefreshing && (
                        <View style={styles.refreshingChip}>
                            <ActivityIndicator size="small" color={colors.textMuted} style={{ transform: [{ scale: 0.65 }] }} />
                            <Text style={styles.refreshingText}>Updating…</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Results count bar */}
            <View style={styles.resultBar}>
                <Text style={styles.resultCount}>
                    {results.length} {results.length === 1 ? 'property' : 'properties'} found
                    {nearMe ? ` within ${nearMeRadius} km` : ''}
                </Text>
                {activeFiltersCount > 0 && (
                    <TouchableOpacity
                        onPress={() => setFilters({ type: null, minPrice: null, maxPrice: null, bedrooms: null })}
                    >
                        <Text style={styles.clearFilters}>Clear filters</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Content */}
            {viewMode === 'list' ? (
                results.length === 0 ? (
                    <EmptyState
                        icon={nearMe ? 'location-outline' : 'search-outline'}
                        title={nearMe ? `No properties within ${nearMeRadius}km` : 'No properties found'}
                        subtitle={
                            nearMe
                                ? 'Try increasing the radius or disable Near Me to see all listings'
                                : 'Try adjusting your search or filters'
                        }
                    />
                ) : (
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <HouseCard
                                listing={item}
                                onPress={() => navigation.navigate('HouseDetail', { listing: item })}
                                onFavorite={() => handleFavorite(item.id)}
                                isFavorited={favorites.includes(item.id)}
                                distanceKm={nearMe && item._dist != null ? item._dist : null}
                            />
                        )}
                    />
                )
            ) : (
                <View style={styles.mapContainer}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={mapRegion}
                        mapType={mapType}
                        pitchEnabled={true}
                        rotateEnabled={true}
                        showsPointsOfInterest={true}
                        showsBuildings={true}
                        showsCompass={true}
                        showsUserLocation={true}
                        followsUserLocation={nearMe}
                        showsMyLocationButton={false}
                    >
                        {results.map((listing) => (
                            <Marker
                                key={listing.id}
                                coordinate={{
                                    latitude: listing.latitude,
                                    longitude: listing.longitude,
                                }}
                                title={listing.title}
                                description={`₹${listing.price.toLocaleString()}/mo`}
                                onCalloutPress={() => navigation.navigate('HouseDetail', { listing })}
                            >
                                <View style={styles.markerContainer}>
                                    <View style={styles.marker}>
                                        <Text style={styles.markerText}>
                                            ₹{listing.price >= 1000 ? `${Math.round(listing.price / 1000)}K` : listing.price}
                                        </Text>
                                    </View>
                                    <View style={styles.markerArrow} />
                                </View>
                            </Marker>
                        ))}
                    </MapView>

                    {/* Fullscreen button */}
                    <TouchableOpacity
                        style={styles.fullscreenBtn}
                        onPress={() => setFullscreenMap(true)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="expand-outline" size={16} color="#fff" />
                        <Text style={styles.fullscreenBtnText}>Full Screen</Text>
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
            )}

            {/* ───── Fullscreen Map Modal ───── */}
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
                        initialRegion={mapRegion}
                        mapType={mapType}
                        pitchEnabled={true}
                        rotateEnabled={true}
                        showsPointsOfInterest={true}
                        showsBuildings={true}
                        showsCompass={true}
                        showsUserLocation={true}
                        followsUserLocation={nearMe}
                        showsMyLocationButton={false}
                        showsScale={true}
                    >
                        {results.map((listing) => (
                            <Marker
                                key={listing.id}
                                coordinate={{
                                    latitude: listing.latitude,
                                    longitude: listing.longitude,
                                }}
                                title={listing.title}
                                description={`₹${listing.price.toLocaleString()}/mo`}
                                onCalloutPress={() => {
                                    setFullscreenMap(false);
                                    navigation.navigate('HouseDetail', { listing });
                                }}
                            >
                                <View style={styles.markerContainer}>
                                    <View style={styles.marker}>
                                        <Text style={styles.markerText}>
                                            ₹{listing.price >= 1000 ? `${Math.round(listing.price / 1000)}K` : listing.price}
                                        </Text>
                                    </View>
                                    <View style={styles.markerArrow} />
                                </View>
                            </Marker>
                        ))}
                    </MapView>

                    {/* Close button */}
                    <TouchableOpacity
                        style={styles.fsCloseBtn}
                        onPress={() => setFullscreenMap(false)}
                    >
                        <Ionicons name="close" size={22} color="#fff" />
                    </TouchableOpacity>

                    {/* Title chip */}
                    <View style={styles.fsTitleChip}>
                        <Ionicons name="map" size={14} color="#fff" />
                        <Text style={styles.fsTitleText}>{results.length} Properties</Text>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: 60,
        paddingBottom: spacing.sm,
    },
    title: {
        ...typography.h1,
    },
    // Near Me banner (shown when Near Me is active)
    nearMeBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
        backgroundColor: colors.elevated,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.xs,
    },
    nearMeBannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    nearMeBannerLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    radiusChips: {
        flexDirection: 'row',
        gap: 6,
        flex: 1,
    },
    radiusChip: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
    },
    radiusChipActive: {
        backgroundColor: colors.text,
        borderColor: colors.text,
    },
    radiusChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
    },
    radiusChipTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    refreshingChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    refreshingText: {
        fontSize: 11,
        color: colors.textMuted,
        fontWeight: '500',
    },
    searchRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.xs,
        gap: spacing.sm,
        alignItems: 'center',
    },
    // Shared style for Near Me and Filter icon buttons
    iconBtn: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        backgroundColor: colors.elevated,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        position: 'relative',
    },
    iconBtnActive: {
        backgroundColor: colors.text,
        borderColor: colors.text,
    },
    filterBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    resultBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.sm,
    },
    resultCount: {
        ...typography.caption,
        color: colors.textMuted,
    },
    clearFilters: {
        ...typography.caption,
        color: colors.text,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    mapContainer: {
        flex: 1,
        margin: spacing.xl,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    map: {
        flex: 1,
    },
    // List / Map segmented control
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: colors.elevated,
        borderRadius: 12,
        padding: 3,
        borderWidth: 1,
        borderColor: colors.border,
    },
    segmentBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 10,
    },
    segmentBtnActive: {
        backgroundColor: colors.text,
    },
    segmentBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    segmentBtnTextActive: {
        color: '#FFFFFF',
    },
    segmentDivider: {
        width: 1,
        height: 18,
        backgroundColor: colors.border,
        alignSelf: 'center',
        marginHorizontal: 2,
    },
    fullscreenBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.72)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
    },
    fullscreenBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    mapTypeRow: {
        position: 'absolute',
        bottom: 12,
        alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        padding: 3,
        gap: 2,
    },
    mapTypeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 16,
    },
    mapTypeBtnActive: {
        backgroundColor: '#fff',
    },
    mapTypeTxt: {
        fontSize: 12,
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
    fsTitleChip: {
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
    },
    fsTitleText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
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
    markerContainer: {
        alignItems: 'center',
    },
    marker: {
        backgroundColor: colors.text,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    markerText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    markerArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: colors.text,
    },
});

export default ExploreScreen;
