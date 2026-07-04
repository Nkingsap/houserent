import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import HouseCard from '../../components/HouseCard';
import EmptyState from '../../components/EmptyState';
import { apiGetListingsByOwner, apiDeleteListing } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const DashboardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const lastFetchRef = React.useRef(0);
    const STALE_MS = 30_000;

    const loadListings = async (force = false) => {
        if (!user) return;
        if (!force && Date.now() - lastFetchRef.current < STALE_MS && listings.length > 0) {
            return;
        }
        const { listings: data } = await apiGetListingsByOwner(user.id);
        setListings(data);
        lastFetchRef.current = Date.now();
    };

    useFocusEffect(
        useCallback(() => {
            loadListings();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadListings(true); // force refresh
        setRefreshing(false);
    };

    const handleDelete = (listing) => {
        Alert.alert(
            'Delete Listing',
            `Are you sure you want to delete "${listing.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await apiDeleteListing(listing.id);
                        loadListings(true); // force reload after delete
                    },
                },
            ]
        );
    };

    const totalViews = listings.length * 42; // mock views
    const availableCount = listings.filter((l) => l.available).length;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <FlatList
                data={listings}
                keyExtractor={(item) => item.id}
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
                ListHeaderComponent={() => (
                    <>
                        {/* Header */}
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.greeting}>Dashboard</Text>
                                <Text style={styles.subtitle}>Manage your properties</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => navigation.navigate('AddListing')}
                            >
                                <Ionicons name="add" size={24} color={"#FFFFFF"} />
                            </TouchableOpacity>
                        </View>

                        {/* Stats */}
                        <View style={styles.statsRow}>
                            <View style={styles.statCard}>
                                <View style={styles.statIconCircle}>
                                    <Ionicons name="home-outline" size={20} color={colors.text} />
                                </View>
                                <Text style={styles.statValue}>{listings.length}</Text>
                                <Text style={styles.statLabel}>Total Listings</Text>
                            </View>
                            <View style={styles.statCard}>
                                <View style={styles.statIconCircle}>
                                    <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
                                </View>
                                <Text style={styles.statValue}>{availableCount}</Text>
                                <Text style={styles.statLabel}>Available</Text>
                            </View>
                            <View style={styles.statCard}>
                                <View style={styles.statIconCircle}>
                                    <Ionicons name="eye-outline" size={20} color={colors.text} />
                                </View>
                                <Text style={styles.statValue}>{totalViews}</Text>
                                <Text style={styles.statLabel}>Views</Text>
                            </View>
                        </View>

                        {/* Section title */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>My Listings</Text>
                        </View>
                    </>
                )}
                ListEmptyComponent={() => (
                    <EmptyState
                        icon="add-circle-outline"
                        title="No listings yet"
                        subtitle="Tap the + button to add your first property"
                    />
                )}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.listingItem}>
                        <HouseCard
                            listing={item}
                            onPress={() => navigation.navigate('AddListing', { listing: item, editing: true })}
                        />
                        <View style={styles.listingActions}>
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => navigation.navigate('AddListing', { listing: item, editing: true })}
                            >
                                <Ionicons name="create-outline" size={16} color={colors.text} />
                                <Text style={styles.actionText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.deleteBtn]}
                                onPress={() => handleDelete(item)}
                            >
                                <Ionicons name="trash-outline" size={16} color={colors.danger} />
                                <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
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
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
    },
    greeting: {
        ...typography.h1,
        marginBottom: 2,
    },
    subtitle: {
        ...typography.body,
        color: colors.textMuted,
    },
    addBtn: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.xxl,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.elevated,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        alignItems: 'center',
    },
    statIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    statValue: {
        ...typography.h2,
        fontSize: 24,
        marginBottom: 2,
    },
    statLabel: {
        ...typography.caption,
        fontSize: 11,
    },
    sectionHeader: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        ...typography.h3,
    },
    listContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    listingItem: {
        marginBottom: spacing.sm,
    },
    listingActions: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: -spacing.sm,
        marginBottom: spacing.lg,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: colors.elevated,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
    },
    deleteBtn: {
        backgroundColor: 'rgba(255,68,68,0.05)',
    },
    actionText: {
        ...typography.caption,
        color: colors.text,
        fontWeight: '500',
    },
});

export default DashboardScreen;
