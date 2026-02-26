import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from '../../components/MapViewWrapper';
import { colors, spacing, borderRadius, typography } from '../../theme';
import InputField from '../../components/InputField';
import LoadingOverlay from '../../components/LoadingOverlay';
import { saveListing } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

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

const AMENITIES_LIST = [
    'WiFi', 'AC', 'Parking', 'Gym', 'Pool', 'Security',
    'Garden', 'Elevator', 'Power Backup', 'Terrace', 'Smart Home', 'Lake View',
];

const PROPERTY_TYPES = [
    { label: 'Apartment', value: 'apartment' },
    { label: 'Villa', value: 'villa' },
    { label: 'House', value: 'house' },
];

const AddListingScreen = ({ navigation, route }) => {
    const { user } = useAuth();
    const editingListing = route.params?.listing;
    const isEditing = route.params?.editing;

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Details, 2: Photos & Location

    // Form state
    const [title, setTitle] = useState(editingListing?.title || '');
    const [description, setDescription] = useState(editingListing?.description || '');
    const [price, setPrice] = useState(editingListing?.price?.toString() || '');
    const [type, setType] = useState(editingListing?.type || 'apartment');
    const [bedrooms, setBedrooms] = useState(editingListing?.bedrooms?.toString() || '');
    const [bathrooms, setBathrooms] = useState(editingListing?.bathrooms?.toString() || '');
    const [area, setArea] = useState(editingListing?.area?.toString() || '');
    const [address, setAddress] = useState(editingListing?.address || '');
    const [city, setCity] = useState(editingListing?.city || '');
    const [amenities, setAmenities] = useState(editingListing?.amenities || []);
    const [furnished, setFurnished] = useState(editingListing?.furnished || false);
    const [images, setImages] = useState(editingListing?.images || []);
    const [location, setLocation] = useState({
        latitude: editingListing?.latitude || 12.9716,
        longitude: editingListing?.longitude || 77.5946,
    });

    const [errors, setErrors] = useState({});

    const toggleAmenity = (amenity) => {
        setAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
        }
    };

    const removeImage = (idx) => {
        setImages((prev) => prev.filter((_, i) => i !== idx));
    };

    const validateStep1 = () => {
        const errs = {};
        if (!title.trim()) errs.title = 'Title is required';
        if (!price || isNaN(price)) errs.price = 'Enter a valid price';
        if (!bedrooms || isNaN(bedrooms)) errs.bedrooms = 'Enter bedrooms count';
        if (!bathrooms || isNaN(bathrooms)) errs.bathrooms = 'Enter bathrooms count';
        if (!area || isNaN(area)) errs.area = 'Enter area in sq ft';
        if (!address.trim()) errs.address = 'Address is required';
        if (!city.trim()) errs.city = 'City is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) setStep(2);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const listingData = {
                id: editingListing?.id || Date.now().toString(),
                ownerId: user.id,
                title: title.trim(),
                description: description.trim(),
                price: parseFloat(price),
                type,
                bedrooms: parseInt(bedrooms),
                bathrooms: parseInt(bathrooms),
                area: parseInt(area),
                address: address.trim(),
                city: city.trim(),
                latitude: location.latitude,
                longitude: location.longitude,
                amenities,
                images,
                furnished,
                available: true,
                createdAt: editingListing?.createdAt || new Date().toISOString(),
            };

            await saveListing(listingData);
            Alert.alert(
                isEditing ? 'Updated!' : 'Published!',
                isEditing
                    ? 'Your listing has been updated successfully.'
                    : 'Your listing is now live and visible to tenants.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (e) {
            Alert.alert('Error', 'Failed to save listing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />
            <LoadingOverlay visible={loading} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => (step === 2 ? setStep(1) : navigation.goBack())}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {isEditing ? 'Edit Listing' : 'New Listing'}
                </Text>
                <View style={styles.stepIndicator}>
                    <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
                    <View style={styles.stepLine} />
                    <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {step === 1 ? (
                        <>
                            {/* Property Type */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>PROPERTY TYPE</Text>
                                <View style={styles.typeRow}>
                                    {PROPERTY_TYPES.map((t) => (
                                        <TouchableOpacity
                                            key={t.value}
                                            style={[styles.typeBtn, type === t.value && styles.typeBtnActive]}
                                            onPress={() => setType(t.value)}
                                        >
                                            <Text
                                                style={[
                                                    styles.typeBtnText,
                                                    type === t.value && styles.typeBtnTextActive,
                                                ]}
                                            >
                                                {t.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <InputField
                                label="TITLE"
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Modern 3BHK in City Center"
                                icon="text-outline"
                                error={errors.title}
                            />

                            <InputField
                                label="DESCRIPTION"
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Describe your property..."
                                multiline
                                numberOfLines={4}
                            />

                            <InputField
                                label="MONTHLY RENT (₹)"
                                value={price}
                                onChangeText={setPrice}
                                placeholder="25000"
                                icon="cash-outline"
                                keyboardType="numeric"
                                error={errors.price}
                            />

                            <View style={styles.row}>
                                <View style={{ flex: 1 }}>
                                    <InputField
                                        label="BEDROOMS"
                                        value={bedrooms}
                                        onChangeText={setBedrooms}
                                        placeholder="3"
                                        icon="bed-outline"
                                        keyboardType="numeric"
                                        error={errors.bedrooms}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <InputField
                                        label="BATHROOMS"
                                        value={bathrooms}
                                        onChangeText={setBathrooms}
                                        placeholder="2"
                                        icon="water-outline"
                                        keyboardType="numeric"
                                        error={errors.bathrooms}
                                    />
                                </View>
                            </View>

                            <InputField
                                label="AREA (SQ FT)"
                                value={area}
                                onChangeText={setArea}
                                placeholder="1200"
                                icon="resize-outline"
                                keyboardType="numeric"
                                error={errors.area}
                            />

                            <InputField
                                label="ADDRESS"
                                value={address}
                                onChangeText={setAddress}
                                placeholder="42 MG Road, Indiranagar"
                                icon="location-outline"
                                error={errors.address}
                            />

                            <InputField
                                label="CITY"
                                value={city}
                                onChangeText={setCity}
                                placeholder="Bangalore"
                                icon="business-outline"
                                error={errors.city}
                            />

                            {/* Furnished Toggle */}
                            <TouchableOpacity
                                style={styles.toggleRow}
                                onPress={() => setFurnished(!furnished)}
                            >
                                <View style={styles.toggleLeft}>
                                    <Ionicons name="bed-outline" size={20} color={colors.text} />
                                    <Text style={styles.toggleLabel}>Furnished</Text>
                                </View>
                                <View style={[styles.toggle, furnished && styles.toggleActive]}>
                                    <View style={[styles.toggleThumb, furnished && styles.toggleThumbActive]} />
                                </View>
                            </TouchableOpacity>

                            {/* Amenities */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>AMENITIES</Text>
                                <View style={styles.amenitiesGrid}>
                                    {AMENITIES_LIST.map((a) => (
                                        <TouchableOpacity
                                            key={a}
                                            style={[
                                                styles.amenityChip,
                                                amenities.includes(a) && styles.amenityChipActive,
                                            ]}
                                            onPress={() => toggleAmenity(a)}
                                        >
                                            <Text
                                                style={[
                                                    styles.amenityChipText,
                                                    amenities.includes(a) && styles.amenityChipTextActive,
                                                ]}
                                            >
                                                {a}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                                <Text style={styles.nextBtnText}>Next: Photos & Location</Text>
                                <Ionicons name="arrow-forward" size={20} color={colors.background} />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {/* Photos */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>PHOTOS</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.photosRow}>
                                        <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImage}>
                                            <Ionicons name="camera-outline" size={28} color={colors.textMuted} />
                                            <Text style={styles.addPhotoText}>Add Photos</Text>
                                        </TouchableOpacity>
                                        {images.map((uri, i) => (
                                            <View key={i} style={styles.photoThumb}>
                                                <Image source={{ uri }} style={styles.photoImage} />
                                                <TouchableOpacity
                                                    style={styles.removePhotoBtn}
                                                    onPress={() => removeImage(i)}
                                                >
                                                    <Ionicons name="close" size={14} color={colors.text} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            {/* Location Picker */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>PIN LOCATION ON MAP</Text>
                                <Text style={styles.sectionHint}>Long press on the map to set location</Text>
                                <View style={styles.mapContainer}>
                                    <MapView
                                        style={styles.map}
                                        latitude={location.latitude}
                                        longitude={location.longitude}
                                        initialRegion={{
                                            ...location,
                                            latitudeDelta: 0.05,
                                            longitudeDelta: 0.05,
                                        }}
                                        customMapStyle={colorMapStyle}
                                        onLongPress={(e) => setLocation(e.nativeEvent.coordinate)}
                                    >
                                        <Marker coordinate={location}>
                                            <View style={styles.mapMarker}>
                                                <Ionicons name="home" size={16} color={colors.background} />
                                            </View>
                                        </Marker>
                                    </MapView>
                                </View>
                                <Text style={styles.coordsText}>
                                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                </Text>
                            </View>

                            {/* Save Button */}
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                <Ionicons name="checkmark-circle" size={22} color={colors.background} />
                                <Text style={styles.saveBtnText}>
                                    {isEditing ? 'Update Listing' : 'Publish Listing'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
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
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: 56,
        paddingBottom: spacing.lg,
        gap: spacing.md,
    },
    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: colors.elevated,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerTitle: {
        ...typography.h3,
        flex: 1,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    stepDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.border,
    },
    stepDotActive: {
        backgroundColor: colors.text,
    },
    stepLine: {
        width: 20,
        height: 2,
        backgroundColor: colors.border,
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxxl,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionLabel: {
        ...typography.small,
        marginBottom: spacing.sm,
        color: colors.textSecondary,
    },
    sectionHint: {
        ...typography.caption,
        color: colors.textMuted,
        marginBottom: spacing.sm,
    },
    typeRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.elevated,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    typeBtnActive: {
        backgroundColor: colors.text,
        borderColor: colors.text,
    },
    typeBtnText: {
        ...typography.bodyBold,
        color: colors.textSecondary,
    },
    typeBtnTextActive: {
        color: colors.background,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.elevated,
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    toggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    toggleLabel: {
        ...typography.bodyBold,
    },
    toggle: {
        width: 48,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    toggleActive: {
        backgroundColor: colors.text,
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.textMuted,
    },
    toggleThumbActive: {
        alignSelf: 'flex-end',
        backgroundColor: colors.background,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    amenityChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.elevated,
        borderWidth: 1,
        borderColor: colors.border,
    },
    amenityChipActive: {
        backgroundColor: colors.text,
        borderColor: colors.text,
    },
    amenityChipText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    amenityChipTextActive: {
        color: colors.background,
        fontWeight: '600',
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.text,
        height: 56,
        borderRadius: borderRadius.xl,
        gap: spacing.sm,
    },
    nextBtnText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: '700',
    },
    photosRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    addPhotoBtn: {
        width: 120,
        height: 120,
        borderRadius: borderRadius.md,
        backgroundColor: colors.elevated,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
        borderStyle: 'dashed',
        gap: spacing.xs,
    },
    addPhotoText: {
        ...typography.caption,
        color: colors.textMuted,
    },
    photoThumb: {
        width: 120,
        height: 120,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        position: 'relative',
    },
    photoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removePhotoBtn: {
        position: 'absolute',
        top: spacing.xs,
        right: spacing.xs,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapContainer: {
        height: 250,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    map: {
        flex: 1,
    },
    mapMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e53935',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
        elevation: 6,
    },
    coordsText: {
        ...typography.caption,
        color: colors.textMuted,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.text,
        height: 56,
        borderRadius: borderRadius.xl,
        gap: spacing.sm,
    },
    saveBtnText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default AddListingScreen;
