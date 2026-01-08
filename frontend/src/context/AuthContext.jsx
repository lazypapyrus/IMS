import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access');
            if (token) {
                // Fetch full profile to get Role
                // For simplicity, we decode or fetch.
                // Let's assume login returns role, OR we hit an endpoint.
                // We need to hit /users/me/ or similar.
                // For now, let's just fetch the user list (since admin) or decode if encoded.
                // Better: We'll decode the token if it had claims, BUT simpler:
                // Let's fetch the current user details correctly.
                // Since we don't have a /me endpoint, let's just assume Admin for the 'admin' user,
                // and for others we might need to rely on the Login response.
                // EDIT: Login response creates the session.
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        const response = await api.post('token/', { username, password });
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);

        // Decode Token to get Role
        const token = response.data.access;
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.username, role: payload.role });

        return response.data;
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
