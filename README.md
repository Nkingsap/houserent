# 🏠 RentHouse

A cross-platform mobile app built with **React Native & Expo** for renting houses. House owners can list properties with photos and location, and renters can search, filter, and save listings — all with a sleek dark-themed UI.

---

## ✨ Features

- **Two user roles** — House Owner and Renter
- **Owner Dashboard** — Add, edit, and manage property listings
- **Renter Home** — Browse, search, and filter available rentals
- **Google Maps integration** — View property locations on a map
- **Image uploads** — Add photos to listings via device gallery
- **Saved listings** — Bookmark properties for later
- **Local storage** — All data persisted with AsyncStorage
- **Dark UI design** with a modern black & white aesthetic

---

## 📋 Prerequisites

Make sure you have the following installed:

| Tool | Version |
|------|---------|
| [Node.js](https://nodejs.org/) | v18 or newer |
| [npm](https://www.npmjs.com/) | v9 or newer |
| [Expo CLI](https://docs.expo.dev/get-started/installation/) | Latest |
| [Expo Go app](https://expo.dev/client) | On your phone (iOS / Android) |

---

## 🚀 Setup & Installation

### 1. Clone the repository

```bash
git clone  https://github.com/Nkingsap/houserent.git
cd rent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Google Maps API Key

Open `app.json` and replace the placeholder with your actual Google Maps API key:

```json
"ios": {
  "config": {
    "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
  }
},
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
    }
  }
}
```

> **Get a key**: Visit [Google Cloud Console](https://console.cloud.google.com/), enable the **Maps SDK for Android** and **Maps SDK for iOS**, and create an API key.

---

## ▶️ Running the App

### On your phone (Expo Go)

```bash
npm start
```

Scan the QR code with:
- **Android** — Expo Go app
- **iOS** — Camera app (then tap the banner)

### On Android emulator

```bash
npm run android
```

### On iOS simulator (macOS only)

```bash
npm run ios
```

### On web browser

```bash
npm run web
```

> **Note**: The Google Maps component is disabled on web and replaced with a placeholder.

### Using a tunnel (for remote networks)

```bash
npx expo start --tunnel
```

---

## 📁 Project Structure

```
rent/
├── App.js                  # App entry point & navigation setup
├── index.js                # Root registration
├── app.json                # Expo configuration
├── assets/                 # Icons, splash, images
└── src/
    ├── components/         # Reusable UI components
    │   ├── HouseCard.js
    │   ├── SearchBar.js
    │   ├── FilterPanel.js
    │   ├── MapViewWrapper.js
    │   └── ...
    ├── screens/
    │   ├── WelcomeScreen.js
    │   ├── LoginScreen.js
    │   ├── RegisterScreen.js
    │   ├── owner/          # Owner-specific screens
    │   │   ├── DashboardScreen.js
    │   │   ├── AddListingScreen.js
    │   │   └── OwnerProfileScreen.js
    │   └── user/           # Renter-specific screens
    │       ├── HomeScreen.js
    │       ├── ExploreScreen.js
    │       ├── HouseDetailScreen.js
    │       ├── SavedScreen.js
    │       └── ProfileScreen.js
    ├── context/            # React Context (global state)
    ├── navigation/         # Navigation configuration
    ├── services/           # AsyncStorage helpers
    ├── data/               # Seed / mock data
    └── theme/              # Colors, fonts, spacing
```

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `expo` | Core Expo SDK |
| `react-native-maps` | Google Maps integration |
| `@react-navigation/native` | Screen navigation |
| `@react-navigation/bottom-tabs` | Tab bar navigation |
| `@react-native-async-storage/async-storage` | Local data persistence |
| `expo-image-picker` | Photo uploads from gallery |
| `expo-location` | Device GPS location |
| `@expo/vector-icons` | Icon library |

---

## 🛠️ Troubleshooting

**Metro bundler cache issues**
```bash
npx expo start --clear
```

**Dependencies out of sync**
```bash
npm install
npx expo install --check
```

**Tunnel not working**
```bash
npm install @expo/ngrok
npx expo start --tunnel
```

---

## 📄 License

This project is private and not licensed for public distribution.
