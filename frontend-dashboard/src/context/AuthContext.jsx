import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

// 1. Global Axios Config: Moved outside the component so it only initializes once
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    // FIX APPLIED HERE: Strip trailing slash from the environment variable
    const rawUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    const backendUrl = rawUrl.replace(/\/$/, '');
    
    // --- 1. The Core Data Fetcher ---
    const getUserData = useCallback(async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/data`);
            if (data.success) {
                setUserData(data.userData);
                setIsLoggedIn(true);
                return data.userData;
            }
        } catch (error) {
            // Silence errors during silent background refreshes
            setUserData(null);
            setIsLoggedIn(false);
        }
        return null;
    }, [backendUrl]);

    // --- 2. Session Hydration (Runs on App Boot) ---
    const hydrateSession = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);
            if (data.success) {
                // If the cookie is valid, get the full profile
                await getUserData();
            } else {
                setIsLoggedIn(false);
                setUserData(null);
            }
        } catch (error) {
            setIsLoggedIn(false);
            setUserData(null);
        } finally {
            // Short delay to prevent UI flicker on fast connections
            setTimeout(() => setLoading(false), 400);
        }
    }, [backendUrl, getUserData]);

    useEffect(() => {
        hydrateSession();
    }, [hydrateSession]);

    // --- 3. Auth Actions ---

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/auth/login`, { email, password });
            if (data.success) {
                const user = await getUserData(); 
                if (user) {
                    toast.success("Signed in successfully");
                    return true;
                }
            }
            toast.error(data.message || "Invalid Credentials");
        } catch (err) {
            toast.error(err.response?.data?.message || "Connection Failed");
        }
        return false;
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/auth/register`, { name, email, password });
            if (data.success) {
                // IMPORTANT: We fetch data here so the app knows the user is logged in
                // but 'isAccountVerified' will be false, triggering the OTP gate.
                await getUserData();
                toast.success("Account Created");
                return true;
            }
            toast.error(data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration Failed");
        }
        return false;
    };

    const logout = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
            if (data.success) {
                setIsLoggedIn(false);
                setUserData(null);
                toast.info("Signed out");
                return true;
            }
        } catch (e) {
            toast.error("Logout Failed");
        }
        return false;
    };

    return (
        <AuthContext.Provider value={{ 
            userData, 
            isLoggedIn, 
            login, 
            register, 
            logout, 
            backendUrl, 
            loading, 
            getUserData 
        }}>
            {/* Prevent app from rendering until we know the auth status */}
            {!loading && children}
        </AuthContext.Provider>
    );
};