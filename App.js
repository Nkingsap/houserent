import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import {
  hasSeeded,
  markSeeded,
  saveListing,
  saveUser,
} from './src/services/storageService';
import { sampleListings, sampleOwner } from './src/data/sampleListings';

const SeedGate = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedData();
  }, []);

  const seedData = async () => {
    try {
      const seeded = await hasSeeded();
      if (!seeded) {
        await saveUser(sampleOwner);
        for (const listing of sampleListings) {
          await saveListing(listing);
        }
        await markSeeded();
      }
    } catch (e) {
      console.error('Seed error', e);
    } finally {
      setReady(true);
    }
  };

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return children;
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SeedGate>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </SeedGate>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
