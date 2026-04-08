import React, { useState, useEffect, useRef } from 'react';
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
    Modal,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from '../../components/MapViewWrapper';
import { colors, spacing, borderRadius, typography } from '../../theme';
import InputField from '../../components/InputField';
import LoadingOverlay from '../../components/LoadingOverlay';
import { apiCreateListing, apiUpdateListing, apiUploadImage } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';



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
    const [fullscreenMap, setFullscreenMap] = useState(false);
    const [mapType, setMapType] = useState('hybrid');
    const mapRef = useRef(null);
    const fsMapRef = useRef(null);

    // Confirm-location sheet state
    const [pendingCoord, setPendingCoord] = useState(null);
    const [pendingAddress, setPendingAddress] = useState('');
    const [geocoding, setGeocoding] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [locationAddress, setLocationAddress] = useState('');

    // Use-my-location state
    const [locating, setLocating] = useState(false);
    const [nearbySuggestions, setNearbySuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

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

    // Reset form when opened fresh for a new listing
    useEffect(() => {
        if (!editingListing) {
            setTitle('');
            setDescription('');
            setPrice('');
            setType('apartment');
            setBedrooms('');
            setBathrooms('');
            setArea('');
            setAddress('');
            setCity('');
            setAmenities([]);
            setFurnished(false);
            setImages([]);
            setLocation({ latitude: 12.9716, longitude: 77.5946 });
            setStep(1);
            setErrors({});
        }
    }, [route.params]);

    // ── Use Current Location ──────────────────────────────────────────────
    const useMyLocation = async () => {
        setLocating(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Location permission is required to use this feature.');
                return;
            }
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const { latitude, longitude } = pos.coords;

            // Move the map pin
            setLocation({ latitude, longitude });
            mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 500);

            // Reverse-geocode to fill address & city
            const geocoded = await reverseGeocode(latitude, longitude);
            if (geocoded) setLocationAddress(geocoded);

            // Fill address & city from Nominatim
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
                    { headers: { 'Accept-Language': 'en', 'User-Agent': 'RentHubApp/1.0' } }
                );
                const data = await res.json();
                if (data?.address) {
                    const a = data.address;
                    const road = a.road || a.pedestrian || a.footway || '';
                    const neighbourhood = a.neighbourhood || a.suburb || a.quarter || '';
                    const detectedCity = a.city || a.town || a.village || a.county || '';
                    const street = [road, neighbourhood].filter(Boolean).join(', ');
                    if (street && !address) setAddress(street);
                    if (detectedCity && !city) setCity(detectedCity);
                }
            } catch (_) { }

            // Fetch nearby place suggestions
            fetchNearbySuggestions(latitude, longitude);
        } catch (e) {
            Alert.alert('Location Error', e.message || 'Unable to get current location.');
        } finally {
            setLocating(false);
        }
    };

    const fetchNearbySuggestions = async (lat, lon) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=residential&lat=${lat}&lon=${lon}&format=json&limit=5&addressdetails=1&viewbox=${lon - 0.05},${lat + 0.05},${lon + 0.05},${lat - 0.05}&bounded=1`,
                { headers: { 'Accept-Language': 'en', 'User-Agent': 'RentHubApp/1.0' } }
            );
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setNearbySuggestions(data.slice(0, 5));
                setShowSuggestions(true);
            } else {
                // fallback: just show the current address as suggestion
                const geocoded = await reverseGeocode(lat, lon);
                if (geocoded) {
                    setNearbySuggestions([{ display_name: geocoded, lat: lat.toString(), lon: lon.toString() }]);
                    setShowSuggestions(true);
                }
            }
        } catch (_) { }
    };

    const applySuggestion = (suggestion) => {
        const lat = parseFloat(suggestion.lat);
        const lon = parseFloat(suggestion.lon);
        setLocation({ latitude: lat, longitude: lon });
        mapRef.current?.animateToRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.015, longitudeDelta: 0.015 }, 400);
        const a = suggestion.address || {};
        const road = a.road || a.pedestrian || '';
        const neighbourhood = a.neighbourhood || a.suburb || '';
        const detectedCity = a.city || a.town || a.village || '';
        const street = [road, neighbourhood].filter(Boolean).join(', ');
        if (street) setAddress(street);
        if (detectedCity) setCity(detectedCity);
        setLocationAddress(suggestion.display_name);
        setShowSuggestions(false);
    };
    // ─────────────────────────────────────────────────────────────────────────

    const toggleAmenity = (amenity) => {
        setAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    // Reverse-geocode using Nominatim (OpenStreetMap) — no API key needed
    const reverseGeocode = async (lat, lon) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
                { headers: { 'Accept-Language': 'en', 'User-Agent': 'RentHubApp/1.0' } }
            );
            if (!res.ok) throw new Error('Nominatim HTTP ' + res.status);
            const data = await res.json();
            if (data && data.address) {
                const a = data.address;
                const parts = [
                    a.road || a.pedestrian || a.footway,
                    a.neighbourhood || a.suburb || a.quarter,
                    a.city || a.town || a.village || a.county,
                    a.state,
                ].filter(Boolean);
                const unique = parts.filter((v, i) => v !== parts[i - 1]);
                return unique.join(', ') || data.display_name;
            }
        } catch (_) {
            // fallback to expo-location
        }
        // Fallback: expo-location native geocoder
        try {
            const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
            if (results && results.length > 0) {
                const r = results[0];
                const parts = [
                    r.name, r.street,
                    r.district || r.subregion,
                    r.city, r.region,
                ].filter(Boolean);
                const unique = parts.filter((v, i) => v !== parts[i - 1]);
                if (unique.length > 0) return unique.join(', ');
            }
        } catch (_) { /* ignore */ }
        return null;
    };

    // Called when user long-presses on the map
    const handleMapLongPress = async (coord) => {
        setPendingCoord(coord);
        setPendingAddress('');
        setGeocoding(true);
        setConfirmVisible(true);
        try {
            const address = await reverseGeocode(coord.latitude, coord.longitude);
            setPendingAddress(
                address || `${coord.latitude.toFixed(5)}, ${coord.longitude.toFixed(5)}`
            );
        } catch {
            setPendingAddress(`${coord.latitude.toFixed(5)}, ${coord.longitude.toFixed(5)}`);
        } finally {
            setGeocoding(false);
        }
    };

    const confirmLocation = () => {
        if (pendingCoord) setLocation(pendingCoord);
        if (pendingAddress) setLocationAddress(pendingAddress);
        setConfirmVisible(false);
        setPendingCoord(null);
    };

    const cancelConfirm = () => {
        setConfirmVisible(false);
        setPendingCoord(null);
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
            const isEditing = !!editingListing?.id;

            // Upload any new local images (file:// URIs) to Supabase Storage
            // Images already uploaded (https://) are kept as-is
            const uploadedImages = await Promise.all(
                images.map((uri) =>
                    uri.startsWith('https://') ? uri : apiUploadImage(uri)
                )
            );

            const payload = {
                owner_id: user.id,
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
                images: uploadedImages,
                furnished,
                available: true,
            };

            if (isEditing) {
                await apiUpdateListing(editingListing.id, payload);
            } else {
                await apiCreateListing(payload);
            }

            Alert.alert(
                isEditing ? 'Updated!' : 'Published!',
                isEditing
                    ? 'Your listing has been updated successfully.'
                    : 'Your listing is now live and visible to tenants.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (e) {
            Alert.alert('Error', e.message || 'Failed to save listing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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

                            {/* Use My Location Button */}
                            <TouchableOpacity
                                style={styles.useLocationBtn}
                                onPress={useMyLocation}
                                disabled={locating}
                            >
                                {locating ? (
                                    <ActivityIndicator size="small" color={"#FFFFFF"} />
                                ) : (
                                    <Ionicons name="navigate" size={16} color={"#FFFFFF"} />
                                )}
                                <Text style={styles.useLocationBtnText}>
                                    {locating ? 'Detecting location…' : 'Use My Current Location'}
                                </Text>
                            </TouchableOpacity>

                            {/* Nearby Suggestions Sheet */}
                            {showSuggestions && nearbySuggestions.length > 0 && (
                                <View style={styles.suggestionsBox}>
                                    <View style={styles.suggestionsHeader}>
                                        <Ionicons name="pin" size={14} color={colors.primary || '#4fc3f7'} />
                                        <Text style={styles.suggestionsTitle}>Nearby Places</Text>
                                        <TouchableOpacity
                                            onPress={() => setShowSuggestions(false)}
                                            style={styles.suggestionsClose}
                                        >
                                            <Ionicons name="close" size={16} color={colors.textMuted} />
                                        </TouchableOpacity>
                                    </View>
                                    {nearbySuggestions.map((s, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            style={[
                                                styles.suggestionItem,
                                                i < nearbySuggestions.length - 1 && styles.suggestionItemBorder,
                                            ]}
                                            onPress={() => applySuggestion(s)}
                                        >
                                            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                                            <Text style={styles.suggestionText} numberOfLines={2}>
                                                {s.display_name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

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
                                <Ionicons name="arrow-forward" size={20} color={"#FFFFFF"} />
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
                                <Text style={styles.sectionHint}>Long press on the map to set location · tap ⛶ to go fullscreen</Text>
                                <View style={styles.mapContainer}>
                                    <MapView
                                        ref={mapRef}
                                        style={styles.map}
                                        initialRegion={{
                                            ...location,
                                            latitudeDelta: 0.05,
                                            longitudeDelta: 0.05,
                                        }}
                                        mapType={mapType}
                                        pitchEnabled={true}
                                        rotateEnabled={true}
                                        showsPointsOfInterest={true}
                                        showsBuildings={true}
                                        showsCompass={true}
                                        showsUserLocation={true}
                                        followsUserLocation={false}
                                        showsMyLocationButton={false}
                                        onLongPress={(e) => handleMapLongPress(e.nativeEvent.coordinate)}
                                    >
                                        <Marker coordinate={location}>
                                            <View style={styles.mapMarker}>
                                                <Ionicons name="home" size={16} color={"#FFFFFF"} />
                                            </View>
                                        </Marker>
                                    </MapView>

                                    {/* Fullscreen button */}
                                    <TouchableOpacity
                                        style={styles.mapFullscreenBtn}
                                        onPress={() => setFullscreenMap(true)}
                                    >
                                        <Ionicons name="expand" size={18} color="#fff" />
                                    </TouchableOpacity>

                                    {/* Map type toggle */}
                                    <View style={styles.mapTypeRow}>
                                        {['standard', 'hybrid', 'satellite'].map((t) => (
                                            <TouchableOpacity
                                                key={t}
                                                style={[styles.mapTypeBtn, mapType === t && styles.mapTypeBtnActive]}
                                                onPress={() => setMapType(t)}
                                            >
                                                <Text style={[styles.mapTypeTxt, mapType === t && styles.mapTypeTxtActive]}>
                                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                                <View style={styles.coordsRow}>
                                    <Ionicons name="location" size={13} color={colors.primary || '#4fc3f7'} />
                                    <Text style={styles.coordsText} numberOfLines={2}>
                                        {locationAddress
                                            ? locationAddress
                                            : `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`}
                                    </Text>
                                </View>
                            </View>

                            {/* ───── Fullscreen Map Modal ───── */}
                            <Modal
                                visible={fullscreenMap}
                                animationType="slide"
                                statusBarTranslucent
                                onRequestClose={() => setFullscreenMap(false)}
                            >
                                <SafeAreaView style={styles.fsContainer}>
                                    <StatusBar barStyle="light-content" backgroundColor="#000" translucent />

                                    <MapView
                                        ref={fsMapRef}
                                        style={StyleSheet.absoluteFillObject}
                                        initialRegion={{
                                            ...location,
                                            latitudeDelta: 0.05,
                                            longitudeDelta: 0.05,
                                        }}
                                        mapType={mapType}
                                        pitchEnabled={true}
                                        rotateEnabled={true}
                                        showsPointsOfInterest={true}
                                        showsBuildings={true}
                                        showsCompass={true}
                                        showsMyLocationButton={false}
                                        showsScale={true}
                                        showsUserLocation={true}
                                        followsUserLocation={false}
                                        onLongPress={(e) => handleMapLongPress(e.nativeEvent.coordinate)}
                                    >
                                        <Marker coordinate={location}>
                                            <View style={styles.mapMarker}>
                                                <Ionicons name="home" size={16} color={"#FFFFFF"} />
                                            </View>
                                        </Marker>
                                    </MapView>

                                    {/* Close */}
                                    <TouchableOpacity
                                        style={styles.fsCloseBtn}
                                        onPress={() => setFullscreenMap(false)}
                                    >
                                        <Ionicons name="close" size={22} color="#fff" />
                                    </TouchableOpacity>

                                    {/* Hint chip */}
                                    <View style={styles.fsHintChip}>
                                        <Ionicons name="hand-left-outline" size={14} color="#fff" />
                                        <Text style={styles.fsHintText}>Long press to pin location</Text>
                                    </View>

                                    {/* Coords strip */}
                                    <View style={styles.fsCoordsChip}>
                                        <Ionicons name="location" size={13} color="#4fc3f7" />
                                        <Text style={styles.fsCoordsText} numberOfLines={2}>
                                            {locationAddress
                                                ? locationAddress
                                                : `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`}
                                        </Text>
                                    </View>

                                    {/* Map type strip */}
                                    <View style={styles.fsMapTypeRow}>
                                        {['standard', 'hybrid', 'satellite'].map((t) => (
                                            <TouchableOpacity
                                                key={t}
                                                style={[styles.fsMapTypeBtn, mapType === t && styles.fsMapTypeBtnActive]}
                                                onPress={() => setMapType(t)}
                                            >
                                                <Text style={[styles.fsMapTypeTxt, mapType === t && styles.fsMapTypeTxtActive]}>
                                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </SafeAreaView>
                            </Modal>

                            {/* Save Button */}
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                <Ionicons name="checkmark-circle" size={22} color={"#FFFFFF"} />
                                <Text style={styles.saveBtnText}>
                                    {isEditing ? 'Update Listing' : 'Publish Listing'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ───── Confirm Location Bottom Sheet ───── */}
            <Modal
                visible={confirmVisible}
                transparent
                animationType="slide"
                onRequestClose={cancelConfirm}
            >
                <TouchableOpacity
                    style={styles.confirmOverlay}
                    activeOpacity={1}
                    onPress={cancelConfirm}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.confirmSheet}>
                        {/* Handle bar */}
                        <View style={styles.sheetHandle} />

                        {/* Header */}
                        <View style={styles.sheetHeader}>
                            <View style={styles.sheetIconWrap}>
                                <Ionicons name="location" size={22} color="#fff" />
                            </View>
                            <Text style={styles.sheetTitle}>Confirm Location?</Text>
                        </View>

                        {/* Address block */}
                        <View style={styles.sheetAddressBox}>
                            {geocoding ? (
                                <View style={styles.sheetLoading}>
                                    <Ionicons name="sync-outline" size={18} color={colors.textMuted} />
                                    <Text style={styles.sheetLoadingText}>Fetching address…</Text>
                                </View>
                            ) : (
                                <>
                                    <Text style={styles.sheetAddressLabel}>SELECTED LOCATION</Text>
                                    <Text style={styles.sheetAddressText}>{pendingAddress}</Text>
                                </>
                            )}
                        </View>

                        {/* Buttons */}
                        <View style={styles.sheetBtnRow}>
                            <TouchableOpacity style={styles.sheetCancelBtn} onPress={cancelConfirm}>
                                <Ionicons name="arrow-back" size={16} color={colors.text} />
                                <Text style={styles.sheetCancelTxt}>Re-pick</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.sheetConfirmBtn, geocoding && styles.sheetConfirmBtnDisabled]}
                                onPress={confirmLocation}
                                disabled={geocoding}
                            >
                                <Ionicons name="checkmark" size={18} color="#fff" />
                                <Text style={styles.sheetConfirmTxt}>Confirm Location</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
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
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
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
        backgroundColor: colors.surface,
    },
    stepDotActive: {
        backgroundColor: colors.primary,
    },
    stepLine: {
        width: 20,
        height: 2,
        backgroundColor: colors.surface,
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
    },
    typeBtnActive: {
        backgroundColor: colors.primary,
    },
    typeBtnText: {
        ...typography.bodyBold,
        color: colors.textSecondary,
    },
    typeBtnTextActive: {
        color: '#FFFFFF',
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
        backgroundColor: colors.primary,
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
    },
    amenityChipActive: {
        backgroundColor: colors.primary,
    },
    amenityChipText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    amenityChipTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        height: 56,
        borderRadius: borderRadius.xl,
        gap: spacing.sm,
    },
    nextBtnText: {
        color: '#FFFFFF',
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
        borderColor: colors.surface,
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
    // Use My Location
    useLocationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        height: 46,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    useLocationBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    suggestionsBox: {
        backgroundColor: colors.elevated,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    suggestionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.surface,
        gap: spacing.xs,
    },
    suggestionsTitle: {
        ...typography.caption,
        fontWeight: '700',
        flex: 1,
        color: colors.textSecondary,
    },
    suggestionsClose: {
        padding: 2,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.xs,
    },
    suggestionItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.surface,
    },
    suggestionText: {
        ...typography.caption,
        color: colors.textSecondary,
        flex: 1,
        lineHeight: 18,
    },
    mapContainer: {
        height: 250,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    map: {
        flex: 1,
    },
    mapFullscreenBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 38,
        height: 38,
        borderRadius: 9,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapTypeRow: {
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 18,
        padding: 3,
        gap: 2,
    },
    mapTypeBtn: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
    },
    mapTypeBtnActive: {
        backgroundColor: '#fff',
    },
    mapTypeTxt: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.75)',
    },
    mapTypeTxtActive: {
        color: '#111',
    },
    // ── Fullscreen Modal ──
    fsContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    fsCloseBtn: {
        position: 'absolute',
        top: 52,
        left: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    fsHintChip: {
        position: 'absolute',
        top: 62,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.65)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        zIndex: 10,
    },
    fsHintText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    fsCoordsChip: {
        position: 'absolute',
        top: 110,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        zIndex: 10,
    },
    fsCoordsText: {
        color: '#4fc3f7',
        fontSize: 12,
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
    },
    fsMapTypeRow: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.65)',
        borderRadius: 24,
        padding: 4,
        gap: 2,
        zIndex: 10,
    },
    fsMapTypeBtn: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
    },
    fsMapTypeBtnActive: {
        backgroundColor: '#fff',
    },
    fsMapTypeTxt: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.75)',
    },
    fsMapTypeTxtActive: {
        color: '#111',
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
    coordsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: spacing.sm,
        gap: spacing.xs,
        paddingHorizontal: spacing.xs,
    },
    coordsText: {
        ...typography.caption,
        color: colors.textMuted,
        flex: 1,
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        height: 56,
        borderRadius: borderRadius.xl,
        gap: spacing.sm,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    // ── Confirm Location Bottom Sheet ──
    confirmOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    confirmSheet: {
        backgroundColor: colors.elevated,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: spacing.xl,
        paddingBottom: 36,
        paddingTop: spacing.md,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.surface,
        alignSelf: 'center',
        marginBottom: spacing.lg,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    sheetIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#e53935',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheetTitle: {
        ...typography.h3,
        fontSize: 18,
    },
    sheetAddressBox: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        minHeight: 80,
        justifyContent: 'center',
    },
    sheetLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    sheetLoadingText: {
        ...typography.body,
        color: colors.textMuted,
    },
    sheetAddressLabel: {
        ...typography.small,
        color: colors.textMuted,
        marginBottom: spacing.xs,
        letterSpacing: 0.5,
    },
    sheetAddressText: {
        ...typography.bodyBold,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: spacing.xs,
    },
    sheetCoords: {
        ...typography.caption,
        color: colors.textMuted,
        fontVariant: ['tabular-nums'],
    },
    sheetBtnRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    sheetCancelBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        height: 52,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.surface,
    },
    sheetCancelTxt: {
        ...typography.bodyBold,
        fontSize: 15,
    },
    sheetConfirmBtn: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        height: 52,
        borderRadius: borderRadius.lg,
        backgroundColor: '#e53935',
    },
    sheetConfirmBtnDisabled: {
        opacity: 0.5,
    },
    sheetConfirmTxt: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default AddListingScreen;
