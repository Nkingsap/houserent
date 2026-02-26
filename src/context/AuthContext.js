import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser,
    findUserByEmail,
    saveUser,
    getUsers,
} from '../services/storageService';

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
            const stored = await getCurrentUser();
            if (stored) setUser(stored);
        } catch (e) {
            console.error('Load user error', e);
        } finally {
            setLoading(false);
        }
    };

    const register = async ({ name, email, phone, password, role }) => {
        const existing = await findUserByEmail(email);
        if (existing) throw new Error('Email already registered');

        const newUser = {
            id: Date.now().toString(),
            name,
            email: email.toLowerCase(),
            phone,
            password,
            role, // 'owner' or 'user'
            avatar: null,
            createdAt: new Date().toISOString(),
        };

        await saveUser(newUser);
        const sessionUser = { ...newUser };
        delete sessionUser.password;
        await setCurrentUser(sessionUser);
        setUser(sessionUser);
        return sessionUser;
    };

    const login = async (email, password) => {
        const found = await findUserByEmail(email);
        if (!found) throw new Error('No account found with this email');
        if (found.password !== password) throw new Error('Incorrect password');

        const sessionUser = { ...found };
        delete sessionUser.password;
        await setCurrentUser(sessionUser);
        setUser(sessionUser);
        return sessionUser;
    };

    const logout = async () => {
        await clearCurrentUser();
        setUser(null);
    };

    const updateProfile = async (updates) => {
        const users = await getUsers();
        const idx = users.findIndex((u) => u.id === user.id);
        if (idx >= 0) {
            users[idx] = { ...users[idx], ...updates };
            await saveUser(users[idx]);
            const sessionUser = { ...users[idx] };
            delete sessionUser.password;
            await setCurrentUser(sessionUser);
            setUser(sessionUser);
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, logout, updateProfile }}
        >
            {children}
        </AuthContext.Provider>
    );
};
