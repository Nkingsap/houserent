import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker } from '../../components/MapViewWrapper';
import { colors, spacing, borderRadius, typography } from '../../theme';
import SearchBar from '../../components/SearchBar';
import FilterPanel from '../../components/FilterPanel';
import HouseCard from '../../components/HouseCard';
import EmptyState from '../../components/EmptyState';
import { apiGetListings, apiGetFavorites, apiToggleFavorite } from '../../services/apiService';
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
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

    const doSearch = async () => {
        const { listings: data } = await apiGetListings({
            q: query || undefined,
            type: filters.type || undefined,
            minPrice: filters.minPrice || undefined,
            maxPrice: filters.maxPrice || undefined,
            bedrooms: filters.bedrooms || undefined,
        });
        setResults(data.filter((l) => l.available));
        if (user) {
            const { favorites } = await apiGetFavorites(user.id);
            setFavorites(favorites);
        }
    };

    useFocusEffect(
        useCallback(() => {
            doSearch();
        }, [query, filters])
    );

    const handleFavorite = async (listingId) => {
        if (!user) return;
        await apiToggleFavorite(user.id, listingId);
        const { favorites } = await apiGetFavorites(user.id);
        setFavorites(favorites);
    };

    const activeFiltersCount = [filters.type, filters.minPrice, filters.bedrooms].filter(Boolean).length;

    const mapRegion = results.length > 0
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
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Explore</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={[styles.viewToggle, viewMode === 'list' && styles.viewToggleActive]}
                        onPress={() => setViewMode('list')}
                    >
                        <Ionicons name="list" size={18} color={viewMode === 'list' ? colors.background : colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewToggle, viewMode === 'map' && styles.viewToggleActive]}
                        onPress={() => setViewMode('map')}
                    >
                        <Ionicons name="map" size={18} color={viewMode === 'map' ? colors.background : colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchRow}>
                <View style={{ flex: 1 }}>
                    <SearchBar
                        value={query}
                        onChangeText={setQuery}
                        onSubmit={doSearch}
                    />
                </View>
                <TouchableOpacity
                    style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <Ionicons
                        name="options"
                        size={20}
                        color={showFilters ? colors.background : colors.text}
                    />
                    {activeFiltersCount > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Filters */}
            {showFilters && (
                <FilterPanel filters={filters} onFilterChange={setFilters} />
            )}

            {/* Results Count */}
            <View style={styles.resultBar}>
                <Text style={styles.resultCount}>{results.length} properties found</Text>
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
                        icon="search-outline"
                        title="No properties found"
                        subtitle="Try adjusting your search or filters"
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
                            />
                        )}
                    />
                )
            ) : (
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        latitude={mapRegion.latitude}
                        longitude={mapRegion.longitude}
                        initialRegion={mapRegion}
                        customMapStyle={colorMapStyle}
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
                </View>
            )}
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
        paddingBottom: spacing.md,
    },
    title: {
        ...typography.h1,
    },
    headerActions: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    viewToggle: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: colors.elevated,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    viewToggleActive: {
        backgroundColor: colors.text,
        borderColor: colors.text,
    },
    searchRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.md,
        gap: spacing.sm,
        alignItems: 'center',
    },
    filterBtn: {
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
    filterBtnActive: {
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
        color: colors.text,
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
    markerContainer: {
        alignItems: 'center',
    },
    marker: {
        backgroundColor: '#3949ab',
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
        color: '#ffffff',
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
        borderTopColor: '#3949ab',
    },
});

export default ExploreScreen;
