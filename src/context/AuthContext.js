import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRegister, apiLogin } from '../services/apiService';

const SESSION_KEY = '@houserent_current_user';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const raw = await AsyncStorage.getItem(SESSION_KEY);
            if (raw) setUser(JSON.parse(raw));
        } catch (e) {
            console.error('Load user error', e);
        } finally {
            setLoading(false);
        }
    };

    const register = async ({ name, email, phone, password, role }) => {
        const { user: newUser } = await apiRegister({ name, email, phone, password, role });
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
        setUser(newUser);
        return newUser;
    };

    const login = async (email, password) => {
        const { user: loggedIn } = await apiLogin(email, password);
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(loggedIn));
        setUser(loggedIn);
        return loggedIn;
    };

    const logout = async () => {
        await AsyncStorage.removeItem(SESSION_KEY);
        setUser(null);
    };

    // Profile updates go directly via apiUpdateUser if you add that endpoint later.
    // For now, patch local session only.
    const updateProfile = async (updates) => {
        const updated = { ...user, ...updates };
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        setUser(updated);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
