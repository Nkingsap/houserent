import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme';

const LoadingOverlay = ({ visible }) => {
    if (!visible) return null;
    return (
        <View style={styles.overlay}>
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={colors.text} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    loader: {
        width: 72,
        height: 72,
        borderRadius: 16,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LoadingOverlay;
