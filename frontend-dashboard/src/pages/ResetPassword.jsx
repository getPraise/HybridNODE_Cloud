import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
// useTheme removed: Relying entirely on native Tailwind dark: classes
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Mail, KeyRound, ChevronRight, Fingerprint, ArrowLeft, Loader2, Eye, EyeOff, ShieldAlert, RefreshCw } from 'lucide-react';

const ResetPassword = () => {
    const { backendUrl } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0); 
    const inputRefs = useRef([]);

    // Timer for Resend Button
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    //cursor movement in otp from one block to next 
    const handleInput = (e, index) => {
        if (e.target.value.length > 0 && index < 5) inputRefs.current[index + 1].focus();
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) inputRefs.current[index - 1].focus();
    };

    //otp copy paste logic (split mechanism)
    const handlePaste = (e) => {
        const pasteData = e.clipboardData.getData('text').trim().slice(0, 6).split('');
        pasteData.forEach((char, index) => {
            if (inputRefs.current[index]) inputRefs.current[index].value = char;
        });
        const nextIndex = Math.min(pasteData.length, 5);
        inputRefs.current[nextIndex].focus();
    };

    // Step 1 & Resend logic: Request OTP
    const onSubmitEmail = async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });
            if (data.success) {
                setIsEmailSent(true);
                setResendCooldown(60); 
                toast.success("Verification code sent");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Gateway timeout");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmitOTP = (e) => {
        e.preventDefault();
        const otpVal = inputRefs.current.map(i => i.value).join('');
        if (otpVal.length < 6) return toast.warning("Please enter the 6-digit code");
        setOtp(otpVal);
        setIsOtpSubmitted(true);
    };

    const onSubmitNewPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) return toast.warning("Password must be at least 6 characters");
        
        setIsSubmitting(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, { 
                email, otp, newPassword 
            });
            if (data.success) {
                toast.success("Password updated successfully");
                navigate('/login');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Could not update password");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 transition-colors duration-500 bg-slate-50 dark:bg-slate-950">
            
            <button 
                onClick={() => navigate('/login')}
                className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors text-[10px] font-black uppercase tracking-widest"
            >
                <ArrowLeft size={14} /> Return to Login
            </button>

            <div className="w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl border transition-all animate-in fade-in zoom-in-95 duration-500 bg-white border-slate-200 shadow-slate-200/50 dark:bg-slate-900/40 dark:backdrop-blur-3xl dark:border-white/5 dark:shadow-black/50">
                
                <div className="flex justify-center mb-8">
                    <div className="p-4 rounded-2xl border transition-all bg-blue-50 border-blue-200 dark:bg-blue-600/10 dark:border-blue-500/20">
                        {isOtpSubmitted ? <ShieldAlert className="text-emerald-500" size={32} /> : <Fingerprint className="text-blue-500" size={32} />}
                    </div>
                </div>

                {/* PHASE 1: EMAIL REQUEST */}
                {!isEmailSent && (
                    <form onSubmit={onSubmitEmail} className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-black uppercase tracking-tight italic text-slate-950 dark:text-white">
                                Reset Password
                            </h2>
                            <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-2 font-bold">Step 1: Enter your email address</p>
                        </div>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input 
                                type="email" placeholder="Registered Email" required
                                disabled={isSubmitting}
                                className="w-full border rounded-xl p-4 pl-12 text-sm font-medium outline-none transition-all disabled:opacity-50 bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600 dark:bg-slate-950 dark:border-white/5 dark:text-white dark:focus:border-blue-500/50"
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <button disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-white text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20 disabled:opacity-50">
                            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <><ChevronRight size={16} /> Send Verification Code</>}
                        </button>
                    </form>
                )}

                {/* PHASE 2: OTP VERIFICATION */}
                {isEmailSent && !isOtpSubmitted && (
                    <form onSubmit={onSubmitOTP} className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-black uppercase tracking-tight italic text-slate-950 dark:text-white">
                                Verify Code
                            </h2>
                            <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-2 font-bold">Step 2: Check your email</p>
                        </div>
                        <div className="flex justify-between gap-2" onPaste={handlePaste}>
                            {Array(6).fill(0).map((_, i) => (
                                <input 
                                    key={i} type="text" maxLength="1" required
                                    inputMode="numeric"
                                    disabled={isSubmitting}
                                    ref={el => inputRefs.current[i] = el}
                                    onInput={e => handleInput(e, i)}
                                    onKeyDown={e => handleKeyDown(e, i)}
                                    className="w-12 h-14 border rounded-xl text-center text-xl font-bold outline-none transition-all disabled:opacity-50 bg-slate-50 border-slate-200 text-blue-600 focus:border-blue-600 dark:bg-slate-950 dark:border-white/5 dark:text-blue-400 dark:focus:border-blue-500"
                                />
                            ))}
                        </div>
                        <div className="flex flex-col gap-4">
                            <button disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-white text-[11px] uppercase tracking-widest active:scale-95 shadow-lg shadow-blue-600/20 disabled:opacity-50">
                                Verify Code
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={onSubmitEmail}
                                disabled={isSubmitting || resendCooldown > 0}
                                className={`text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                                    resendCooldown > 0 ? "text-slate-500 cursor-not-allowed" : "text-blue-500 hover:text-blue-400"
                                }`}
                            >
                                <RefreshCw size={12} className={resendCooldown > 0 ? "" : "animate-spin-slow"} />
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                            </button>

                            <button 
                                type="button" onClick={() => setIsEmailSent(false)}
                                disabled={isSubmitting}
                                className="w-full text-[10px] text-slate-500 hover:text-slate-400 uppercase font-black tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                            >
                                <ArrowLeft size={12} /> Start Over
                            </button>
                        </div>
                    </form>
                )}

                {/* PHASE 3: NEW PASSWORD */}
                {isOtpSubmitted && (
                    <form onSubmit={onSubmitNewPassword} className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-black uppercase tracking-tight italic text-slate-950 dark:text-white">
                                New Password
                            </h2>
                            <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-2 font-bold">Step 3: Secure your account</p>
                        </div>
                        <div className="relative group">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Enter New Password" required
                                disabled={isSubmitting}
                                className="w-full border rounded-xl p-4 pl-12 pr-12 text-sm font-medium outline-none transition-all disabled:opacity-50 bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600 dark:bg-slate-950 dark:border-white/5 dark:text-white dark:focus:border-blue-500/50"
                                onChange={e => setNewPassword(e.target.value)}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-500 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <button disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl font-black text-white text-[11px] uppercase tracking-widest active:scale-95 shadow-lg shadow-emerald-600/20 disabled:opacity-50">
                            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Update Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;