import React, { useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    StatusBar,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import PagerView from 'react-native-pager-view';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    Easing,
} from 'react-native-reanimated';
import {
    GestureDetector,
    Gesture,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ANIM = { duration: 200, easing: Easing.out(Easing.ease) };

/* ─── Single zoomable image ─── */
const ZoomableImage = ({ uri, panEnabled, onZoomChange }) => {
    const [isLoading, setIsLoading] = useState(true);
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTX = useSharedValue(0);
    const savedTY = useSharedValue(0);

    /* Pinch to zoom */
    const pinch = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = savedScale.value * e.scale;
        })
        .onEnd(() => {
            if (scale.value < 1) {
                scale.value = withTiming(1, ANIM);
                savedScale.value = 1;
                translateX.value = withTiming(0, ANIM);
                translateY.value = withTiming(0, ANIM);
                savedTX.value = 0;
                savedTY.value = 0;
                runOnJS(onZoomChange)(false);
            } else if (scale.value > 4) {
                scale.value = withTiming(4, ANIM);
                savedScale.value = 4;
                runOnJS(onZoomChange)(true);
            } else {
                savedScale.value = scale.value;
                runOnJS(onZoomChange)(scale.value > 1.05);
            }
        });

    /* Double tap to toggle zoom */
    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .onStart(() => {
            if (savedScale.value > 1.1) {
                scale.value = withTiming(1, ANIM);
                savedScale.value = 1;
                translateX.value = withTiming(0, ANIM);
                translateY.value = withTiming(0, ANIM);
                savedTX.value = 0;
                savedTY.value = 0;
                runOnJS(onZoomChange)(false);
            } else {
                scale.value = withTiming(2.5, ANIM);
                savedScale.value = 2.5;
                runOnJS(onZoomChange)(true);
            }
        });

    /* Pan to move when zoomed — only enabled when panEnabled=true */
    const pan = Gesture.Pan()
        .enabled(panEnabled)
        .onUpdate((e) => {
            translateX.value = savedTX.value + e.translationX;
            translateY.value = savedTY.value + e.translationY;
        })
        .onEnd(() => {
            savedTX.value = translateX.value;
            savedTY.value = translateY.value;
        });

    const gesture = Gesture.Simultaneous(pinch, doubleTap, pan);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
    }));

    return (
        <GestureDetector gesture={gesture}>
            <View style={styles.imageWrapper}>
                {isLoading && (
                    <View style={styles.loaderOverlay}>
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text style={styles.loaderText}>Loading...</Text>
                    </View>
                )}
                <Animated.View style={[styles.fullImageContainer, animatedStyle]}>
                    <Image
                        source={uri}
                        style={styles.fullImage}
                        contentFit="contain"
                        cachePolicy="memory-disk"
                        transition={300}
                        onLoadStart={() => setIsLoading(true)}
                        onLoadEnd={() => setIsLoading(false)}
                    />
                </Animated.View>
            </View>
        </GestureDetector>
    );
};

/* ─── Main Gallery ─── */
const FullscreenGallery = ({
    images = [],
    initialIndex = 0,
    visible = false,
    onClose,
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);

    const handleZoomChange = useCallback((zoomed) => {
        setIsZoomed(zoomed);
    }, []);

    const handlePageSelected = useCallback((e) => {
        setCurrentIndex(e.nativeEvent.position);
        setIsZoomed(false);
    }, []);

    const handleClose = useCallback(() => {
        onClose?.();
    }, [onClose]);

    if (!visible) return null;

    const totalImages = images.length;

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="fade"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <GestureHandlerRootView style={styles.root}>
                <StatusBar barStyle="light-content" backgroundColor="#000" translucent />
                <View style={styles.container}>
                    <PagerView
                        style={styles.pager}
                        initialPage={initialIndex}
                        onPageSelected={handlePageSelected}
                        scrollEnabled={!isZoomed}
                        overdrag={true}
                    >
                        {images.map((uri, i) => (
                            <View key={i} style={styles.page}>
                                <ZoomableImage
                                    uri={uri}
                                    panEnabled={isZoomed}
                                    onZoomChange={handleZoomChange}
                                />
                            </View>
                        ))}
                    </PagerView>

                    {/* Close button */}
                    <TouchableOpacity
                        style={styles.closeBtn}
                        onPress={handleClose}
                        activeOpacity={0.7}
                    >
                        <View style={styles.closeBtnInner}>
                            <Ionicons name="close" size={22} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    {/* Footer */}
                    {totalImages > 0 && (
                        <View style={styles.footer}>
                            <View style={styles.counter}>
                                <Text style={styles.counterText}>
                                    {currentIndex + 1} / {totalImages}
                                </Text>
                            </View>
                            {totalImages > 1 && totalImages <= 10 && (
                                <View style={styles.dots}>
                                    {images.map((_, i) => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.dot,
                                                i === currentIndex && styles.dotActive,
                                            ]}
                                        />
                                    ))}
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    pager: {
        flex: 1,
    },
    page: {
        flex: 1,
    },
    imageWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    closeBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 54 : 44,
        left: 16,
        zIndex: 20,
    },
    closeBtnInner: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingBottom: 50,
        gap: 12,
        zIndex: 20,
    },
    counter: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    counterText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
    },
    dots: {
        flexDirection: 'row',
        gap: 5,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    dotActive: {
        backgroundColor: '#FFFFFF',
        width: 18,
    },
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loaderText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        marginTop: 10,
        fontWeight: '500',
    },
});

export default FullscreenGallery;
