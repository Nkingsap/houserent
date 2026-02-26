import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme';

const SearchBar = ({ value, onChangeText, onSubmit, placeholder, style }) => {
    const [focused, setFocused] = useState(false);

    return (
        <View style={[styles.container, focused && styles.focused, style]}>
            <Ionicons
                name="search"
                size={20}
                color={focused ? colors.text : colors.textMuted}
                style={styles.icon}
            />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmit}
                placeholder={placeholder || 'Search location, property...'}
                placeholderTextColor={colors.textMuted}
                returnKeyType="search"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                selectionColor={colors.text}
            />
            {value ? (
                <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearBtn}>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.elevated,
        borderRadius: borderRadius.xl,
        paddingHorizontal: spacing.lg,
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
    },
    focused: {
        borderColor: colors.textMuted,
    },
    icon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        color: colors.text,
        fontSize: 15,
        height: '100%',
    },
    clearBtn: {
        marginLeft: spacing.sm,
    },
});

export default SearchBar;
