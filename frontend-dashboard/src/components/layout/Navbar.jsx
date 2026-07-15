import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import Logo from '../brand/Logo';

const Navbar = () => {
  const { isLoggedIn, userData, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  // Enforce Fixed Shell: Hide standard navigation inside the workspace
  if (location.pathname === '/workspace') return null;

  // Dynamic Background: Premium Glassmorphism on scroll
  const navBg = scrolled 
    ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200 py-3 shadow-sm dark:bg-slate-950/80 dark:border-white/5' 
    : 'bg-transparent border-b border-transparent py-5';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 px-6 md:px-12 flex justify-between items-center transition-all duration-500 ${navBg}`}>
      
      {/* 1. Brand Identity */}
      <div 
        className="flex items-center gap-3 cursor-pointer z-50 group" 
        onClick={() => navigate('/')}
      >
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 border border-blue-400/20 group-hover:scale-105 transition-transform duration-300">
          <Logo size={22} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-black tracking-tighter text-xl italic leading-none transition-colors text-slate-950 dark:text-white">
            HybridNODE
          </span>
          <span className="text-[7px] font-bold tracking-[0.3em] uppercase mt-1 transition-colors text-slate-500 dark:text-slate-400">
            Orchestration Gateway
          </span>
        </div>
      </div>

      {/* 2. Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6 z-50">
        {isLoggedIn ? (
          <div className="flex items-center gap-6 pl-6 pr-2 py-1.5 rounded-2xl border transition-colors bg-white border-slate-200 shadow-sm dark:bg-slate-900/50 dark:border-white/5">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Authenticated</span>
              <span className="text-xs font-bold leading-none text-slate-950 dark:text-white">
                {userData?.name || "User"}
              </span>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10" />

            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/workspace')}
                className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-blue-600/20 uppercase tracking-widest"
              >
                <LayoutDashboard size={14} />
                Workspace
              </button>
              
              <button 
                onClick={logout}
                className="p-2.5 transition-all rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-400/10"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')} 
              className="text-[11px] font-black tracking-widest transition-colors px-4 uppercase italic text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/signup')} 
              className="text-[11px] font-black px-6 py-3 rounded-2xl transition-all flex items-center gap-2 active:scale-95 shadow-xl uppercase italic bg-slate-950 text-white hover:bg-slate-800 shadow-slate-900/10 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:shadow-white/5"
            >
              Get Started <ArrowRight size={14} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>

      {/* 3. Mobile Toggle Button */}
      <button 
        className="md:hidden z-50 p-2 rounded-xl transition-colors text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 4. Mobile Menu Overlay (Upgraded to Premium Glassmorphism) */}
      <div className={`fixed inset-0 z-40 transition-all duration-500 md:hidden flex flex-col items-center justify-center gap-8 bg-white/95 backdrop-blur-2xl dark:bg-slate-950/95 ${
        mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {isLoggedIn ? (
          <>
            <div className="text-center animate-in slide-in-from-bottom-4 duration-500 delay-100">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Authenticated User</p>
              <p className="text-2xl font-black text-slate-950 dark:text-white">{userData?.name}</p>
            </div>
            <button 
              onClick={() => { navigate('/workspace'); setMobileMenuOpen(false); }} 
              className="text-xl font-black tracking-widest uppercase italic text-blue-600 hover:text-blue-500 animate-in slide-in-from-bottom-4 duration-500 delay-150 flex items-center gap-2"
            >
              <LayoutDashboard size={20} /> Launch Workspace
            </button>
            <button 
              onClick={() => { logout(); setMobileMenuOpen(false); }} 
              className="text-sm font-black text-red-500 hover:text-red-400 flex items-center gap-2 uppercase tracking-widest mt-8 animate-in slide-in-from-bottom-4 duration-500 delay-200"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} 
              className="text-2xl font-black tracking-widest italic uppercase text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white animate-in slide-in-from-bottom-4 duration-500 delay-100"
            >
              Sign In
            </button>
            <button 
              onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }} 
              className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black italic text-[13px] tracking-widest uppercase shadow-xl shadow-blue-600/20 active:scale-95 transition-all animate-in slide-in-from-bottom-4 duration-500 delay-150 flex items-center gap-2"
            >
              Get Started <ArrowRight size={16} strokeWidth={3} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;