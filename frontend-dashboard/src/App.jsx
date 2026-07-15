import React, { useContext, useMemo, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext.jsx';
import { useTheme } from './context/ThemeContext.jsx'; // IMPORTED THEME HOOK

// UI Components
import { ToastContainer } from 'react-toastify'; // MOVED TOAST IMPORTS HERE
import 'react-toastify/dist/ReactToastify.css';

// Navbar and Pages
import Navbar from './components/layout/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Workspace from './pages/Workspace.jsx';
import EmailVerify from './pages/EmailVerify.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

const App = () => {
  const { loading, isLoggedIn, userData } = useContext(AuthContext);
  const { theme } = useTheme(); // GRAB THE DYNAMIC THEME (light or dark)
  const location = useLocation();

  // Enforce Fixed Shell layout on the Workspace
  useEffect(() => {
    const isWorkspace = location.pathname === '/workspace';
    document.body.classList.toggle('no-scroll', isWorkspace);
  }, [location.pathname]);

  // Hide standard navigation on app-specific routes
  const showNavbar = useMemo(() => {
    const hiddenRoutes = ['/workspace', '/email-verify', '/login', '/signup', '/reset-password'];
    return !hiddenRoutes.includes(location.pathname);
  }, [location.pathname]);

  // Full-Screen Loading State
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500"></div>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    /* Simplified UI Wrapper using native Tailwind dark mode classes */
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-200">
      
      {/* DYNAMIC TOAST CONTAINER: Automatically matches your light/dark theme! */}
      <ToastContainer 
        position="bottom-right" 
        autoClose={4000}
        theme={theme} 
        toastStyle={{ 
          borderRadius: '8px', 
          fontSize: '14px',    
          fontFamily: 'Inter, sans-serif'
        }}
      />

      {showNavbar && <Navbar />}

      <main className="relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Route: Workspace */}
          <Route 
            path="/workspace" 
            element={
              isLoggedIn && !userData?.isAccountVerified 
              ? <Navigate to="/email-verify" replace /> 
              : <Workspace />
            } 
          />

          <Route path="/email-verify" element={<EmailVerify />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;