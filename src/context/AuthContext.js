import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRegister, apiLogin, apiLogout, setAuthTokens } from '../services/apiService';

const SESSION_KEY = '@renthub_current_user';

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
            if (raw) {
                const session = JSON.parse(raw);
                setUser(session.user);
                setAuthTokens(session.access_token, session.refresh_token);
            }
        } catch (e) {
            console.error('Load user error', e);
        } finally {
            setLoading(false);
        }
    };

    const register = async ({ name, email, phone, password, role }) => {
        const data = await apiRegister({ name, email, phone, password, role });
        const { user: newUser, access_token, refresh_token } = data;

        const session = { user: newUser, access_token, refresh_token };
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

        setAuthTokens(access_token, refresh_token);
        setUser(newUser);
        return newUser;
    };

    const login = async (email, password) => {
        const data = await apiLogin(email, password);
        const { user: loggedIn, access_token, refresh_token } = data;

        const session = { user: loggedIn, access_token, refresh_token };
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

        setAuthTokens(access_token, refresh_token);
        setUser(loggedIn);
        return loggedIn;
    };

    const logout = async () => {
        try {
            await apiLogout();
        } catch (e) {
            console.error('Failed to revoke session on server:', e);
        }
        await AsyncStorage.removeItem(SESSION_KEY);
        setAuthTokens(null, null);
        setUser(null);
    };

    const updateProfile = async (updates) => {
        try {
            const raw = await AsyncStorage.getItem(SESSION_KEY);
            let session = {};
            if (raw) {
                session = JSON.parse(raw);
            }
            session.user = { ...session.user, ...updates };
            await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
            setUser(session.user);
        } catch (e) {
            console.error('Failed to update local profile:', e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
