import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    icon,
    error,
    secureTextEntry,
    keyboardType,
    multiline,
    numberOfLines,
    style,
    ...props
}) => {
    const [focused, setFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <View style={[styles.wrapper, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.container,
                    focused && styles.focused,
                    error && styles.error,
                    multiline && styles.multiline,
                ]}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={18}
                        color={focused ? colors.text : colors.textMuted}
                        style={styles.icon}
                    />
                )}
                 <TextInput
                    style={[styles.input, multiline && styles.multilineInput]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    keyboardType={keyboardType}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    selectionColor={colors.text}
                    {...props}
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.eyeIcon}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={focused ? colors.text : colors.textMuted}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <View style={styles.errorRow}>
                    <Ionicons name="alert-circle" size={14} color={colors.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: spacing.lg,
    },
    label: {
        ...typography.small,
        marginBottom: spacing.sm,
        color: colors.textSecondary,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.lg,
        height: 52,
    },
    focused: {
        backgroundColor: colors.elevated,
    },
    error: {
        backgroundColor: 'rgba(192,57,43,0.06)',
    },
    multiline: {
        height: 120,
        alignItems: 'flex-start',
        paddingVertical: spacing.md,
    },
    icon: {
        marginRight: spacing.md,
    },
    input: {
        flex: 1,
        color: colors.text,
        fontSize: 15,
        height: '100%',
    },
    multilineInput: {
        textAlignVertical: 'top',
    },
    eyeIcon: {
        padding: spacing.xs,
        marginLeft: spacing.xs,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
        gap: spacing.xs,
    },
    errorText: {
        color: colors.danger,
        fontSize: 13,
    },
});

export default InputField;
