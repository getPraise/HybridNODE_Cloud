import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // 1. Initial State: Check Storage -> Then Check System Preference -> Default to Dark
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('hn_theme');
        if (saved) return saved;
        
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    });

    // 2. The Apply Logic: Updates HTML classes and Browser Properties
    useEffect(() => {
        const root = window.document.documentElement;
        
        // Update DOM classes for Tailwind 'dark:' selectors
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        
        // Tell the browser to style scrollbars and native elements
        root.style.colorScheme = theme;
        
        // Save preference for next visit
        localStorage.setItem('hn_theme', theme);
    }, [theme]);

    // 3. System Listener: React to OS theme changes in real-time
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
            // Only auto-switch if the user hasn't set a manual preference yet
            if (!localStorage.getItem('hn_theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};