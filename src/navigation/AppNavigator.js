import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';

// Shared screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// User screens
import HomeScreen from '../screens/user/HomeScreen';
import ExploreScreen from '../screens/user/ExploreScreen';
import HouseDetailScreen from '../screens/user/HouseDetailScreen';
import SavedScreen from '../screens/user/SavedScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import AboutScreen from '../screens/user/AboutScreen';
import NotificationsScreen from '../screens/user/NotificationsScreen';
import PrivacySecurityScreen from '../screens/user/PrivacySecurityScreen';
import HelpSupportScreen from '../screens/user/HelpSupportScreen';

// Owner screens
import DashboardScreen from '../screens/owner/DashboardScreen';
import AddListingScreen from '../screens/owner/AddListingScreen';
import OwnerProfileScreen from '../screens/owner/OwnerProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── User Tab Navigator ──────────────────────
const UserTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
                borderTopWidth: 1,
                height: 70,
                paddingBottom: 10,
                paddingTop: 8,
                shadowColor: '#0A0A0F',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 8,
            },
            tabBarActiveTintColor: colors.text,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
            },
            tabBarIcon: ({ color, size }) => {
                const icons = {
                    Home: 'home',
                    Explore: 'search',
                    Saved: 'heart',
                    Profile: 'person',
                };
                return <Ionicons name={icons[route.name]} size={22} color={color} />;
            },
        })}
    >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Explore" component={ExploreScreen} />
        <Tab.Screen name="Saved" component={SavedScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
);

// ─── Owner Tab Navigator ─────────────────────
const OwnerTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
                borderTopWidth: 1,
                height: 70,
                paddingBottom: 10,
                paddingTop: 8,
                shadowColor: '#0A0A0F',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 8,
            },
            tabBarActiveTintColor: colors.text,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
            },
            tabBarIcon: ({ color, size }) => {
                const icons = {
                    Dashboard: 'grid',
                    OwnerProfile: 'person',
                };
                return <Ionicons name={icons[route.name]} size={22} color={color} />;
            },
        })}
    >
        <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ tabBarLabel: 'Dashboard' }}
        />
        <Tab.Screen
            name="OwnerProfile"
            component={OwnerProfileScreen}
            options={{ tabBarLabel: 'Profile' }}
        />
    </Tab.Navigator>
);

// ─── Root Navigator ──────────────────────────
const AppNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) return null;

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <>
                        <Stack.Screen
                            name="MainTabs"
                            component={user.role === 'owner' ? OwnerTabs : UserTabs}
                        />
                        <Stack.Screen
                            name="HouseDetail"
                            component={HouseDetailScreen}
                            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                        />
                        <Stack.Screen
                            name="About"
                            component={AboutScreen}
                        />
                        <Stack.Screen
                            name="Notifications"
                            component={NotificationsScreen}
                        />
                        <Stack.Screen
                            name="PrivacySecurity"
                            component={PrivacySecurityScreen}
                        />
                        <Stack.Screen
                            name="HelpSupport"
                            component={HelpSupportScreen}
                        />
                        {user.role === 'owner' && (
                            <Stack.Screen
                                name="AddListing"
                                component={AddListingScreen}
                                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Welcome" component={WelcomeScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
