const IS_DEV = process.env.EAS_BUILD_PROFILE === "development";

const plugins = [
    [
        "expo-image-picker",
        {
            photosPermission:
                "Allow RentHouse to access your photos to add images to your listings.",
        },
    ],
    [
        "expo-location",
        {
            locationAlwaysAndWhenInUsePermission:
                "Allow RentHouse to use your location to find nearby rentals.",
        },
    ],
    "expo-font",
];

// Only include expo-dev-client in development builds
if (IS_DEV) {
    plugins.unshift("expo-dev-client");
}

export default {
    expo: {
        name: "RentHouse",
        slug: "rent",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "dark",
        owner: "barrynring",
        runtimeVersion: {
            policy: "appVersion",
        },
        updates: {
            url: "https://u.expo.dev/5c2fc43b-51ed-440d-b24b-224c86666844",
        },
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#000000",
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.barrynring.renthouse",
            config: {
                googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
            },
        },
        android: {
            package: "com.barrynring.renthouse",
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#000000",
            },
            config: {
                googleMaps: {
                    apiKey: process.env.GOOGLE_MAPS_API_KEY,
                },
            },
        },
        web: {
            favicon: "./assets/favicon.png",
        },
        extra: {
            eas: {
                projectId: "5c2fc43b-51ed-440d-b24b-224c86666844",
            },
        },
        plugins,
    },
};
