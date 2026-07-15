import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
// useTheme removed: Tailwind's 'dark:' classes handle theme logic natively now
import { User, Mail, Lock, ShieldCheck, Eye, EyeOff, Loader2, ArrowLeft, LifeBuoy } from 'lucide-react';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, isLoggedIn, userData } = useContext(AuthContext);

  const isSignUp = location.pathname === '/signup';
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security Check: Redirect authenticated users away from auth pages
  useEffect(() => {
    if (isLoggedIn && userData?.isAccountVerified) {
      navigate('/workspace');
    }
  }, [isLoggedIn, userData, navigate]);

  // Clean state when toggling between /login and /signup
  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setIsSubmitting(false);
  }, [location.pathname]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
        if (isSignUp) {
          const success = await register(name, email, password);
          // Standard State Pass: Forward email to the verification screen
          if (success) navigate('/email-verify', { state: { email } });
        } else {
          const success = await login(email, password);
          if (success) navigate('/workspace');
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    /* Native Tailwind Theme Classes */
    <div className="min-h-screen flex items-center justify-center px-6 transition-colors duration-500 bg-slate-50 dark:bg-slate-950">
      
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors text-[10px] font-black uppercase tracking-widest"
      >
        <ArrowLeft size={14} /> Back to Home
      </button>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="p-10 rounded-[2.5rem] shadow-2xl border transition-all bg-white border-slate-200 shadow-slate-200/50 dark:bg-slate-900/40 dark:backdrop-blur-3xl dark:border-white/5 dark:shadow-black/50">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-[1000] italic tracking-[-0.05em] uppercase scale-x-110 text-slate-950 dark:text-white">
              {isSignUp ? 'Sign Up' : 'Login'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">
                {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          <form onSubmit={onSubmitHandler} className="space-y-4">
            {isSignUp && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Full Name"
                  disabled={isSubmitting}
                  /* Bumped text-xs to text-sm for enterprise readability standards */
                  className="w-full border rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition-all disabled:opacity-50 bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600 dark:bg-slate-950 dark:border-white/5 dark:text-white dark:focus:border-blue-500/50"
                  onChange={(e) => setName(e.target.value)} 
                  value={name} 
                  required
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="email" 
                placeholder="Email Address"
                disabled={isSubmitting}
                className="w-full border rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition-all disabled:opacity-50 bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600 dark:bg-slate-950 dark:border-white/5 dark:text-white dark:focus:border-blue-500/50"
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password"
                disabled={isSubmitting}
                className="w-full border rounded-xl py-3.5 pl-12 pr-12 text-sm font-medium outline-none transition-all disabled:opacity-50 bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600 dark:bg-slate-950 dark:border-white/5 dark:text-white dark:focus:border-blue-500/50"
                onChange={(e) => setPassword(e.target.value)} 
                value={password} 
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-500 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {!isSignUp && (
              <div className="flex justify-end px-1">
                <button 
                  type="button"
                  onClick={() => navigate('/reset-password')}
                  className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors flex items-center gap-1.5"
                >
                  <LifeBuoy size={12} /> Forgot Password?
                </button>
              </div>
            )}

            <button 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-blue-600/20"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-500 mt-8 uppercase font-bold tracking-widest">
            {isSignUp ? 'Already registered?' : "Need an account?"}
            <span 
              onClick={() => !isSubmitting && navigate(isSignUp ? '/login' : '/signup')}
              className="text-blue-500 cursor-pointer hover:text-blue-400 ml-2"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;