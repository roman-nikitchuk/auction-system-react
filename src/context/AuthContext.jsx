import { createContext, useContext, useState } from 'react';
import api from '../api/axios';
const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user') || 'null')
    );

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token } = response.data;

            localStorage.setItem('token', token);
            setToken(token);

            const payload = JSON.parse(atob(token.split('.')[1]));
            const userData = {
                id: parseInt(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']),
                userName: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                role: payload['role'],
            };

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data || 'Błąd logowania',
            };
        }
    };

    const register = async (userName, email, password) => {
        try {
            await api.post('/auth/register', {
                userName,
                email,
                password,
            });

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.message || 'Błąd rejestracji',
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setToken(null);
        setUser(null);
    };

    const isAdmin = user?.role === 'Admin';
    const isLoggedIn = !!token;
    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isLoggedIn,
                isAdmin,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);