import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import SearchBar from '../../components/SearchBar';
import HouseCard from '../../components/HouseCard';
import { apiGetListings, apiGetFavorites, apiToggleFavorite } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const HomeScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        const { listings: all } = await apiGetListings();
        const available = all.filter((l) => l.available);
        setListings(available);
        setFeatured(available.filter((l) => l.price >= 30000).slice(0, 5));
        if (user) {
            const { favorites } = await apiGetFavorites(user.id);
            setFavorites(favorites);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleFavorite = async (listingId) => {
        if (!user) return;
        await apiToggleFavorite(user.id, listingId);
        const { favorites } = await apiGetFavorites(user.id);
        setFavorites(favorites);
    };

    const handleSearch = () => {
        navigation.navigate('Explore', { query: search });
    };

    const quickFilters = [
        { label: 'Apartments', icon: 'business-outline', type: 'apartment' },
        { label: 'Villas', icon: 'home-outline', type: 'villa' },
        { label: 'Houses', icon: 'storefront-outline', type: 'house' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.text}
                        colors={[colors.text]}
                        progressBackgroundColor={colors.card}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>
                            Hello, {user?.name?.split(' ')[0] || 'there'}
                        </Text>
                        <Text style={styles.headerSubtitle}>Find your perfect rental</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.notifBtn}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchSection}>
                    <SearchBar
                        value={search}
                        onChangeText={setSearch}
                        onSubmit={handleSearch}
                        placeholder="Search by location, name..."
                    />
                </View>

                {/* Quick Category Filters */}
                <View style={styles.categorySection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.categoryRow}>
                            {quickFilters.map((f) => (
                                <TouchableOpacity
                                    key={f.type}
                                    style={styles.categoryBtn}
                                    onPress={() => navigation.navigate('Explore', { type: f.type })}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.categoryIcon}>
                                        <Ionicons name={f.icon} size={22} color={colors.text} />
                                    </View>
                                    <Text style={styles.categoryLabel}>{f.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Featured Listings */}
                {featured.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Featured</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
                                <Text style={styles.seeAll}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={featured}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: spacing.xl }}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <HouseCard
                                    listing={item}
                                    compact
                                    onPress={() => navigation.navigate('HouseDetail', { listing: item })}
                                />
                            )}
                        />
                    </View>
                )}

                {/* All Listings */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Nearby Rentals</Text>
                        <Text style={styles.countBadge}>{listings.length}</Text>
                    </View>
                    <View style={styles.listingsList}>
                        {listings.slice(0, 6).map((item) => (
                            <HouseCard
                                key={item.id}
                                listing={item}
                                onPress={() => navigation.navigate('HouseDetail', { listing: item })}
                                onFavorite={() => handleFavorite(item.id)}
                                isFavorited={favorites.includes(item.id)}
                            />
                        ))}
                    </View>
                    {listings.length > 6 && (
                        <TouchableOpacity
                            style={styles.viewMoreBtn}
                            onPress={() => navigation.navigate('Explore')}
                        >
                            <Text style={styles.viewMoreText}>View All Listings</Text>
                            <Ionicons name="arrow-forward" size={18} color={colors.text} />
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
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
        paddingBottom: spacing.lg,
    },
    greeting: {
        ...typography.h1,
        marginBottom: 2,
    },
    headerSubtitle: {
        ...typography.body,
        color: colors.textMuted,
    },
    notifBtn: {
        position: 'relative',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.elevated,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    avatarText: {
        ...typography.h3,
        color: colors.text,
    },
    searchSection: {
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.xl,
    },
    categorySection: {
        marginBottom: spacing.xl,
    },
    categoryRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        gap: spacing.md,
    },
    categoryBtn: {
        alignItems: 'center',
        gap: spacing.sm,
    },
    categoryIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    categoryLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    section: {
        marginBottom: spacing.xxl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        ...typography.h2,
    },
    seeAll: {
        ...typography.body,
        color: colors.textMuted,
        fontWeight: '500',
    },
    countBadge: {
        ...typography.caption,
        color: colors.textMuted,
        backgroundColor: colors.elevated,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    listingsList: {
        paddingHorizontal: spacing.xl,
    },
    viewMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.md,
        backgroundColor: colors.elevated,
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    viewMoreText: {
        ...typography.bodyBold,
    },
});

export default HomeScreen;
