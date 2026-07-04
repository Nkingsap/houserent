import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
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
    const [total, setTotal] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Near Me
    const [nearMe, setNearMe] = useState(false);
    const [locating, setLocating] = useState(false);
    const [locationRefreshing, setLocationRefreshing] = useState(false); // silent bg GPS refresh
    const [userLocation, setUserLocation] = useState(null);
    const [nearMeRadius, setNearMeRadius] = useState(20);

    const PAGE_SIZE = 20;

    // Sync query from HomeScreen navigation param
    useEffect(() => {
        if (route.params?.query !== undefined) {
            setQuery(route.params.query);
        }
    }, [route.params?.query]);

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

    const doSearch = async (append = false) => {
        const offset = append ? results.length : 0;

        // Fetch listings and favorites in PARALLEL
        const [listingsRes, favRes] = await Promise.all([
            apiGetListings({
                q: query || undefined,
                type: filters.type || undefined,
                minPrice: filters.minPrice || undefined,
                maxPrice: filters.maxPrice || undefined,
                bedrooms: filters.bedrooms || undefined,
                limit: PAGE_SIZE,
                offset,
            }),
            !append && user ? apiGetFavorites(user.id) : { favorites: favorites },
        ]);

        let data = listingsRes.listings;
        setTotal(listingsRes.total || 0);
        setHasMore(data.length >= PAGE_SIZE);

        // Filter & sort by distance when Near Me is on
        if (nearMe && userLocation) {
            data = data
                .map((l) => ({
                    ...l,
                    _dist: haversine(userLocation.latitude, userLocation.longitude, l.latitude, l.longitude),
                }))
                .filter((l) => l._dist <= nearMeRadius)   // ← only within radius
                .sort((a, b) => a._dist - b._dist);
        }

        if (append) {
            setResults((prev) => [...prev, ...data]);
        } else {
            setResults(data);
        }

        if (!append) {
            setFavorites(favRes.favorites);
        }
    };

    useFocusEffect(
        useCallback(() => {
            doSearch();
        }, [query, filters, nearMe, userLocation, nearMeRadius])
    );

    // Infinite scroll — load next page
    const handleLoadMore = async () => {
        if (loadingMore || !hasMore || nearMe) return; // disable pagination for nearMe (client-side distance filter)
        setLoadingMore(true);
        await doSearch(true);
        setLoadingMore(false);
    };

    // Optimistic favorite toggle — no extra API call to re-fetch
    const handleFavorite = async (listingId) => {
        if (!user) return;
        const { favorited } = await apiToggleFavorite(user.id, listingId);
        setFavorites((prev) =>
            favorited ? [...prev, listingId] : prev.filter((id) => id !== listingId)
        );
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

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Explore</Text>
                </View>
                {/* Nearby toggle */}
                <TouchableOpacity
                    style={[styles.nearbyChip, nearMe && styles.nearbyChipActive]}
                    onPress={toggleNearMe}
                    disabled={locating}
                    activeOpacity={0.75}
                >
                    {locating ? (
                        <ActivityIndicator size="small" color={nearMe ? '#FFFFFF' : colors.textSecondary} style={{ width: 15, height: 15 }} />
                    ) : (
                        <Ionicons name={nearMe ? 'location' : 'location-outline'} size={15} color={nearMe ? '#FFFFFF' : colors.textSecondary} />
                    )}
                    <Text style={[styles.nearbyChipText, nearMe && styles.nearbyChipTextActive]}>Nearby</Text>
                </TouchableOpacity>
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
                    {nearMe ? results.length : total} {(nearMe ? results.length : total) === 1 ? 'property' : 'properties'} found
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

            {/* List Content */}
            {results.length === 0 ? (
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
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={loadingMore ? (
                        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                            <ActivityIndicator size="small" color={colors.textMuted} />
                        </View>
                    ) : null}
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
            )}
        </SafeAreaView>
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
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.elevated,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        ...typography.h1,
    },
    nearbyChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: colors.elevated,
    },
    nearbyChipActive: {
        backgroundColor: colors.primary,
    },
    nearbyChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    nearbyChipTextActive: {
        color: '#FFFFFF',
    },
    // Near Me banner (shown when Near Me is active)
    nearMeBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
        backgroundColor: colors.elevated,
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
        backgroundColor: colors.surface,
    },
    radiusChipActive: {
        backgroundColor: colors.primary,
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
    // Shared style for Filter icon button
    iconBtn: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        backgroundColor: colors.elevated,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    iconBtnActive: {
        backgroundColor: colors.primary,
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
});

export default ExploreScreen;
