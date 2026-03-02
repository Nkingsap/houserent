import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme';
import HouseCard from '../../components/HouseCard';
import EmptyState from '../../components/EmptyState';
import { apiGetFavoriteListings, apiToggleFavorite, apiGetFavorites } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const SavedScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [savedListings, setSavedListings] = useState([]);

    const loadSaved = async () => {
        if (!user) return;
        const { listings } = await apiGetFavoriteListings(user.id);
        setSavedListings(listings);
    };

    useFocusEffect(
        useCallback(() => {
            loadSaved();
        }, [])
    );

    const handleRemove = async (listingId) => {
        await apiToggleFavorite(user.id, listingId);
        loadSaved();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            <View style={styles.header}>
                <Text style={styles.title}>Saved</Text>
                <Text style={styles.count}>{savedListings.length} properties</Text>
            </View>

            {savedListings.length === 0 ? (
                <EmptyState
                    icon="heart-outline"
                    title="No saved properties"
                    subtitle="Tap the heart icon on any listing to save it here"
                />
            ) : (
                <FlatList
                    data={savedListings}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <HouseCard
                            listing={item}
                            onPress={() => navigation.navigate('HouseDetail', { listing: item })}
                            onFavorite={() => handleRemove(item.id)}
                            isFavorited={true}
                        />
                    )}
                />
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
        paddingHorizontal: spacing.xl,
        paddingTop: 60,
        paddingBottom: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    title: {
        ...typography.h1,
    },
    count: {
        ...typography.caption,
        color: colors.textMuted,
    },
    listContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxl,
    },
});

export default SavedScreen;
