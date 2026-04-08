const IS_DEV = process.env.EAS_BUILD_PROFILE === "development";

const plugins = [
    [
        "expo-image-picker",
        {
            photosPermission:
                "Allow RentHub to access your photos to add images to your listings.",
        },
    ],
    [
        "expo-location",
        {
            locationAlwaysAndWhenInUsePermission:
                "Allow RentHub to use your location to find nearby rentals.",
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
        name: "RentHub",
        slug: "rent",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/appicon.png",
        userInterfaceStyle: "dark",
        owner: "barrynring",
        runtimeVersion: {
            policy: "appVersion",
        },
        updates: {
            url: "https://u.expo.dev/a39b5592-68c8-4a98-80c8-db111fab5776",
        },
        splash: {
            image: "./assets/appicon.png",
            resizeMode: "contain",
            backgroundColor: "#000000",
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.barrynring.renthub",
            config: {
                googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
            },
        },
        android: {
            package: "com.barrynring.renthub",
            adaptiveIcon: {
                foregroundImage: "./assets/appicon.png",
                backgroundColor: "#000000",
            },
            config: {
                googleMaps: {
                    apiKey: process.env.GOOGLE_MAPS_API_KEY,
                },
            },
        },
        androidNavigationBar: {
            visible: "sticky-immersive",
            backgroundColor: "#FAF9F6",
            barStyle: "dark-content",
        },
        web: {
            favicon: "./assets/appicon.png",
        },
        extra: {
            eas: {
                projectId: "a39b5592-68c8-4a98-80c8-db111fab5776",
            },
        },
        plugins,
    },
};
