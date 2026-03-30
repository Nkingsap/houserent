import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

const FilterChip = ({ label, selected, onPress, icon }) => (
    <TouchableOpacity
        style={[styles.chip, selected && styles.chipSelected]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        {icon && (
            <Ionicons
                name={icon}
                size={14}
                color={selected ? '#FFFFFF' : colors.textSecondary}
                style={{ marginRight: 4 }}
            />
        )}
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
            {label}
        </Text>
    </TouchableOpacity>
);

const FilterPanel = ({ filters, onFilterChange }) => {
    const priceRanges = [
        { label: 'Under ₹10K', min: 0, max: 10000 },
        { label: '₹10K–25K', min: 10000, max: 25000 },
        { label: '₹25K–50K', min: 25000, max: 50000 },
        { label: '₹50K+', min: 50000, max: 999999 },
    ];

    const types = [
        { label: 'All', value: null },
        { label: 'Apartment', value: 'apartment' },
        { label: 'Villa', value: 'villa' },
        { label: 'House', value: 'house' },
    ];

    const bedroomOptions = [
        { label: 'Any', value: null },
        { label: '1+', value: 1 },
        { label: '2+', value: 2 },
        { label: '3+', value: 3 },
        { label: '4+', value: 4 },
    ];

    return (
        <View style={styles.panel}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>PROPERTY TYPE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                        {types.map((t) => (
                            <FilterChip
                                key={t.label}
                                label={t.label}
                                selected={filters.type === t.value}
                                onPress={() => onFilterChange({ ...filters, type: t.value })}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>PRICE RANGE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                        {priceRanges.map((r) => (
                            <FilterChip
                                key={r.label}
                                label={r.label}
                                selected={
                                    filters.minPrice === r.min && filters.maxPrice === r.max
                                }
                                onPress={() =>
                                    onFilterChange({
                                        ...filters,
                                        minPrice:
                                            filters.minPrice === r.min && filters.maxPrice === r.max
                                                ? null
                                                : r.min,
                                        maxPrice:
                                            filters.minPrice === r.min && filters.maxPrice === r.max
                                                ? null
                                                : r.max,
                                    })
                                }
                                icon="cash-outline"
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>BEDROOMS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                        {bedroomOptions.map((b) => (
                            <FilterChip
                                key={b.label}
                                label={b.label}
                                selected={filters.bedrooms === b.value}
                                onPress={() => onFilterChange({ ...filters, bedrooms: b.value })}
                                icon="bed-outline"
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    panel: {
        paddingVertical: spacing.md,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        ...typography.small,
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.xl,
    },
    chipRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        gap: spacing.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.elevated,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
    },
    chipSelected: {
        backgroundColor: colors.primary,
    },
    chipText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    chipTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});

export { FilterChip };
export default FilterPanel;
